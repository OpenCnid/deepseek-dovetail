#!/usr/bin/env python3
"""Pre-publish checks for a session close.

Four checks, each bought by something that shipped broken while nobody was
looking for it. The contract that matters: a check that could not run reports
UNMEASURED and never "clean". A silent pass and an unrun check look identical
in a log, and only one of them is evidence.

Where a check ran but could not see everything, it says what it withheld on the
same line as the verdict. A clean that names its own blind spot cannot be
misread as coverage.

    python checks.py [repo_root] [--all] [--full]

    --all   include archival directories (references/, vendor/, .upsum/, ...)
    --full  print every finding instead of the first 12

Scope, stated because a clean is otherwise easy to over-read: only markdown is
opened, and fenced blocks are excluded from the prose scan. Defects in source
files, config, or inside a fenced install command are outside what this sees.

Exit code is about measurement integrity, not findings:
    0  every check ran and saw everything it needed
    1  at least one check could not run, or ran partially blind
    2  the script itself failed
Findings do not change the exit code. This reports; the human gates.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

try:
    import yaml  # optional; absent means frontmatter is parsed less strictly
except ImportError:
    yaml = None

PREFIX_CEILING = 19_900
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}
ARCHIVAL_DIRS = {"references", "vendor", "evals", "tests", "fixtures", "runs",
                 "probes", "worktrees", ".upsum"}
# `.upsum/` is this skill's own append-only history. A record quotes the defects
# it records, so scanning it accrues one finding per specimen, forever, growing
# with the record. Found the first time this skill was run on a real session.
HARNESS_CONCEPTS = {
    "CLAUDE.md", "CLAUDE.local.md", "AGENTS.md", "MEMORY.md", "SKILL.md",
    "README.md", "TODO.md", "LICENSE.md", "NOTICE", "settings.json",
    "settings.local.json", "package.json", "hooks.json", "requirements.txt",
}
MAX_SHOWN = 12   # --full lifts this

RULE_CITATION = re.compile(r"\b(?:Guardrail|[Rr]ule)\s+\d+[a-z]?\b")
# Requires a separator and a path-shaped tail, so "Note:\n" and regex examples
# in prose no longer read as drive paths. Drive paths, UNC shares and named
# absolute roots only. A `~/` path is deliberately absent: it resolves on any
# machine, which is the opposite of the defect this looks for, and every skill
# in this ecosystem documents `~/.claude/skills/` as its install destination.
ABSOLUTE_PATH = re.compile(
    r"(?:[A-Za-z]:[\\/][\w.\- ]+[\\/][\w.\- ]+"
    r"|\\\\[\w.\-]+\\[\w.\- \\]+"
    r"|/(?:home|Users)/[\w.\-]+/[\w.\-/]+)"
)
BACKTICK_FILE = re.compile(r"`([\w./\\-]+\.(?:md|txt|json|ts|py|yaml|yml))`")
MD_LINK = re.compile(r"\[[^\[\]]*\]\(([^)\s]+)\)")   # bounded: no quadratic blowup
FRONTMATTER = re.compile(r"\A﻿?---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
FENCE = re.compile(r"^\s*(```|~~~)")


def strip_fences(text: str) -> str:
    """Blank out fenced blocks. A document teaching its own syntax is not
    making pointers, and scanning its examples as prose invents findings."""
    out, fenced = [], False
    for line in text.splitlines():
        if FENCE.match(line):
            fenced = not fenced
            out.append("")
            continue
        out.append("" if fenced else line)
    return "\n".join(out)


class Result:
    def __init__(self, name: str) -> None:
        self.name = name
        self.findings: list[str] = []
        self.unmeasured: str | None = None
        self.blind: list[str] = []      # ran, but did not see this
        self.note: str | None = None
        self.counted = 0

    def find(self, msg: str) -> None:
        if msg not in self.findings:
            self.findings.append(msg)

    def cannot_measure(self, why: str) -> None:
        self.unmeasured = why

    def withheld(self, what: str) -> None:
        if what not in self.blind:
            self.blind.append(what)

    def report(self) -> None:
        if self.unmeasured:
            print(f"  {self.name}: -- UNMEASURED ({self.unmeasured})")
            return
        scope = f"{self.counted} file(s)" if self.counted else "nothing to check"
        if self.blind:
            scope += "; " + ", ".join(self.blind)
        if not self.findings:
            print(f"  {self.name}: clean over {scope}")
            return
        print(f"  {self.name}: {len(self.findings)} finding(s) over {scope}")
        for f in self.findings[:MAX_SHOWN]:
            print(f"    - {f}")
        if len(self.findings) > MAX_SHOWN:
            print(f"    ... and {len(self.findings) - MAX_SHOWN} more")
        if self.note:
            print(f"    ({self.note})")


def walk(root: Path, name: str | None = None):
    """Yield files, never visiting one real directory twice. A junction or
    symlink loop otherwise multiplies one file into dozens of findings."""
    seen: set = set()
    for dirpath, dirnames, filenames in os.walk(root):
        try:
            st = os.stat(dirpath)
            key = (st.st_dev, st.st_ino)
        except OSError:
            key = os.path.realpath(dirpath)
        if key in seen:
            dirnames[:] = []
            continue
        seen.add(key)
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if name is None or fn == name:
                yield Path(dirpath) / fn


def read(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def git(root: Path, *args: str) -> tuple[int, str, str]:
    """stdout and stderr kept apart. Merging them lets any git warning both
    suppress a real finding and invent a false one."""
    try:
        r = subprocess.run(["git", *args], cwd=root,
                           capture_output=True, text=True, timeout=20)
        return r.returncode, r.stdout or "", r.stderr or ""
    except (OSError, subprocess.SubprocessError) as e:
        return -1, "", str(e)


# --------------------------------------------------------------- check 1
def check_inside_baseball(root: Path, scan_all: bool = False) -> Result:
    res = Result("inside baseball")
    excluded = unreadable = nonmd = fenced_files = 0
    rootr = root.resolve()

    def reader_facing(p: Path) -> bool:
        if scan_all:
            return True
        return not any(part in ARCHIVAL_DIRS for part in p.relative_to(root).parts)

    def resolves(base_dir: Path, target: str) -> bool:
        """Only relative to the citing file or the repo root, and never outside
        the repo. A pointer that resolves on the author's disk layout is the
        thing this check exists to catch."""
        t = target.split("#", 1)[0].split("?", 1)[0]
        if not t:
            return True                      # pure anchor into this same file
        cands = [base_dir / t, root / t]
        probe = base_dir
        while True:                          # a declared references/ mirror
            cands.append(probe / "references" / t)
            if probe == rootr or probe.parent == probe:
                break
            probe = probe.parent
        for cand in cands:
            try:
                rp = cand.resolve()
                rp.relative_to(rootr)
            except (OSError, ValueError):
                continue
            if rp.exists():
                return True
        return False

    for md in walk(root):
        if md.suffix.lower() != ".md":
            nonmd += 1          # never opened: source, config, prompts in other formats
            continue
        if not reader_facing(md):
            excluded += 1
            continue
        raw = read(md)
        rel = md.relative_to(root).as_posix()
        if raw is None:
            unreadable += 1
            res.find(f"{rel}: unreadable, not checked")
            continue
        res.counted += 1
        text = strip_fences(raw)
        if text != raw:
            fenced_files += 1   # fenced content excluded from the prose scan

        for m in ABSOLUTE_PATH.finditer(text):
            res.find(f"{rel}: local filesystem path -- {m.group(0)!r}")
        for m in RULE_CITATION.finditer(text):
            res.find(f"{rel}: rule cited by number -- {m.group(0)!r}")
        for m in BACKTICK_FILE.finditer(text):
            target = m.group(1)
            if "/" not in target and target in HARNESS_CONCEPTS:
                continue                     # bare convention name, not a path
            if not resolves(md.parent, target):
                res.find(f"{rel}: unresolved file citation `{target}`")
        for m in MD_LINK.finditer(text):
            href = m.group(1)
            if href.startswith(("http://", "https://", "#", "mailto:")):
                continue
            if not resolves(md.parent, href):
                res.find(f"{rel}: link target does not exist -- {href}")

    if excluded:
        res.withheld(f"{excluded} archival excluded")
    if nonmd:
        res.withheld(f"{nonmd} non-markdown not opened")
    if fenced_files:
        res.withheld(f"fenced blocks unscanned in {fenced_files}")
    if unreadable:
        res.withheld(f"{unreadable} unreadable")
    if res.counted == 0 and not res.findings:
        res.cannot_measure("no reader-facing markdown found")
    if any("unresolved file citation" in f for f in res.findings):
        res.note = ("unresolved citations are ambiguous by construction: a dead "
                    "pointer and a path created at runtime look identical here")
    return res


# --------------------------------------------------------------- check 2
def check_repo_state(root: Path) -> Result:
    res = Result("repo state")
    if not (root / ".git").exists():
        res.cannot_measure("not a git repository")
        return res
    code, out, err = git(root, "status", "--porcelain")
    if code != 0:
        res.cannot_measure(f"git status failed: {err.strip()[:80]}")
        return res
    res.counted = 1

    dirty = [ln for ln in out.splitlines() if ln.strip()]
    if dirty:
        res.find(f"{len(dirty)} uncommitted change(s)")

    code, ig, _ = git(root, "status", "--porcelain", "--ignored=matching")
    if code == 0:
        ignored = [ln[3:] for ln in ig.splitlines() if ln.startswith("!! ")]
        if ignored:
            res.find(f"{len(ignored)} ignored-but-present path(s) git will never "
                     f"preserve, e.g. {ignored[0]}")

    code, st, _ = git(root, "stash", "list")
    if code == 0 and st.strip():
        res.find(f"{len(st.strip().splitlines())} stash(es) -- local-only by nature")

    # Every local branch, not just the checked-out one.
    code, br, _ = git(root, "for-each-ref",
                      "--format=%(refname:short)\t%(upstream:short)", "refs/heads")
    if code != 0:
        res.withheld("branches unenumerated")
    else:
        for line in br.splitlines():
            if not line.strip():
                continue
            name, _, up = line.partition("\t")
            if not up:
                c, n, _ = git(root, "rev-list", "--count", name, "--not", "--remotes")
                extra = ""
                if c == 0 and n.strip().isdigit() and int(n.strip()):
                    extra = f", {n.strip()} commit(s) on no remote"
                res.find(f"branch {name!r} has no upstream{extra}")
                continue
            c, n, _ = git(root, "rev-list", "--count", f"{up}..{name}")
            if c != 0 or not n.strip().isdigit():
                res.withheld(f"ahead-count unreadable for {name!r}")
                continue
            if int(n.strip()) > 0:
                res.find(f"{n.strip()} commit(s) on {name!r} not pushed")

    c, _, _ = git(root, "symbolic-ref", "-q", "HEAD")
    if c != 0:
        res.find("detached HEAD -- commits here belong to no branch")

    res.withheld("remote not contacted; upstream state is from the local cache")
    return res


# --------------------------------------------------------------- check 3
def check_skill_health(root: Path) -> Result:
    res = Result("skill health")
    skills = list(walk(root, "SKILL.md"))     # exact basename, not endswith
    if not skills:
        res.cannot_measure("no SKILL.md found")
        return res
    if yaml is None:
        res.withheld("frontmatter not YAML-parsed (pyyaml absent)")

    for sk in skills:
        rel = sk.relative_to(root).as_posix()
        try:                                   # count characters as written
            raw = sk.read_bytes().decode("utf-8")
        except (OSError, UnicodeDecodeError):
            res.find(f"{rel}: unreadable")
            continue
        res.counted += 1
        n = len(raw)
        if n > PREFIX_CEILING:
            res.find(f"{rel}: {n} chars, {n - PREFIX_CEILING} past the surviving prefix")

        fm = FRONTMATTER.match(raw)
        if not fm:
            res.find(f"{rel}: no frontmatter block")
            continue
        block, data = fm.group(1), None
        if yaml is not None:
            try:
                data = yaml.safe_load(block)
            except yaml.YAMLError as e:
                res.find(f"{rel}: frontmatter does not parse -- "
                         f"{str(e).splitlines()[0][:70]}")
                continue
            if not isinstance(data, dict):
                res.find(f"{rel}: frontmatter is not a mapping")
                continue
            name, desc = data.get("name"), data.get("description")
        else:
            m1 = re.search(r"^name:\s*(.*)$", block, re.MULTILINE)
            m2 = re.search(r"^description:\s*(.*)$", block, re.MULTILINE)
            name = m1.group(1).strip().strip("\"'") if m1 else None
            desc = m2.group(1).strip().strip("\"'") if m2 else None
        if not name:
            res.find(f"{rel}: frontmatter has no name")
        elif str(name).strip() != sk.parent.name:
            res.find(f"{rel}: name {str(name).strip()!r} != directory {sk.parent.name!r}")
        if not desc or not str(desc).strip():
            res.find(f"{rel}: description missing or empty -- the skill cannot trigger")
    return res


# --------------------------------------------------------------- check 4
def check_credit_travel(root: Path) -> Result:
    res = Result("credit travel")
    readme = next((root / n for n in ("README.md", "readme.md")
                   if (root / n).exists()), None)
    if readme is None:
        res.cannot_measure("no README.md at repo root")
        return res
    text = read(readme)
    if text is None:
        res.cannot_measure("README.md unreadable")
        return res
    res.counted = 1

    copied = re.findall(r"(?:cp -r|Copy-Item(?:\s+-\w+)*)\s+([\w./\\-]+)", text)
    if not copied:
        res.cannot_measure("no install command naming a directory found in README")
        return res

    targets, unresolved = [], []
    for c in copied:
        stripped = c.split("/", 1)[1] if "/" in c else c
        hit = next((cand for cand in (root / c, root / stripped) if cand.is_dir()), None)
        if hit is None:
            unresolved.append(c)
        elif hit not in targets:
            targets.append(hit)

    for c in unresolved:
        res.find(f"install command names {c!r}, which is not a directory in this repo")
    if not targets:
        res.cannot_measure("no install command resolved to a directory that exists")
        return res

    for d in targets:
        rel = d.relative_to(root).as_posix()
        found = None
        try:
            for f in d.rglob("*"):             # cp -r copies the whole tree
                if not f.is_file():
                    continue
                if re.fullmatch(r"LICEN[CS]E(\.\w+)?|NOTICE(\.\w+)?", f.name.upper()):
                    if f.stat().st_size > 0:
                        found = f
                        break
        except OSError as e:
            res.withheld(f"{rel} not fully readable ({e.__class__.__name__})")
        if found is None:
            res.find(f"install copies {rel}/ -- no non-empty LICENSE or NOTICE "
                     f"travels with it")
    return res


def main(argv: list[str]) -> int:
    if "--help" in argv or "-h" in argv:
        print(__doc__)
        return 0
    args = [a for a in argv[1:] if not a.startswith("--")]
    scan_all = "--all" in argv
    if "--full" in argv:
        globals()["MAX_SHOWN"] = 10**9
    root = Path(args[0] if args else ".").resolve()
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    print(f"upsum checks -- {root}" + ("  [--all]" if scan_all else ""))
    results = [
        check_inside_baseball(root, scan_all),
        check_repo_state(root),
        check_skill_health(root),
        check_credit_travel(root),
    ]
    for r in results:
        r.report()

    unmeasured = [r.name for r in results if r.unmeasured]
    partial = [r.name for r in results if not r.unmeasured and r.blind]
    findings = sum(len(r.findings) for r in results)
    print(f"\n{findings} finding(s); "
          f"{len(results) - len(unmeasured)}/{len(results)} checks ran.")
    if unmeasured:
        print(f"Did not run: {', '.join(unmeasured)} -- not the same as passing.")
    if partial:
        print(f"Ran partially blind: {', '.join(partial)} -- see the withheld notes.")
    return 1 if (unmeasured or partial) else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except Exception as e:
        print(f"checks.py failed: {e}", file=sys.stderr)
        sys.exit(2)
