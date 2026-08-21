#!/usr/bin/env python3
"""Bounded DSH pre-publish checks for an explicitly selected workspace.

Usage: python checks.py TARGET_WORKSPACE [--all] [--full]

Exit code reports measurement integrity, not findings:
  0  every check ran with no withheld coverage
  1  at least one check was unavailable or partially blind
  2  the checker itself failed
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "build", "vendor", "ports"}
ARCHIVAL_DIRS = {"references", "vendor", "evals", "tests", "fixtures", "runs", ".upsum"}
MAX_FILES = 10_000
MAX_FILE_BYTES = 2 * 1024 * 1024
MAX_FRONTMATTER_BYTES = 16 * 1024 * 1024
MAX_SHOWN = 12
DESCRIPTION_LIMIT = 480
RULE_CITATION = re.compile(r"\b(?:Guardrail|[Rr]ule)\s+\d+[a-z]?\b")
ABSOLUTE_PERSON_PATH = re.compile(
    r"(?:[A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/][\w. -]+[\\/][\w.\\/ -]+"
    r"|\\\\[\w.-]+\\[\w. -]+"
    r"|/(?:home|Users)/[\w.-]+/[\w./-]+)"
)
MARKDOWN_LINK = re.compile(r"\[[^\[\]]*\]\(([^)\s]+)\)")
RESOURCE_CODE = re.compile(r"`((?:scripts|references|assets)/[A-Za-z0-9_./-]+)`")
FRONTMATTER = re.compile(r"\A\ufeff?---\r?\n(.*?)\r?\n---\r?\n([\s\S]*)\Z", re.DOTALL)
FENCE = re.compile(r"^\s*(```|~~~)")
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass
class Result:
    name: str
    findings: list[str] = field(default_factory=list)
    unmeasured: str | None = None
    blind: list[str] = field(default_factory=list)
    counted: int = 0

    def find(self, value: str) -> None:
        if value not in self.findings:
            self.findings.append(value)

    def withheld(self, value: str) -> None:
        if value not in self.blind:
            self.blind.append(value)

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
        for finding in self.findings[:MAX_SHOWN]:
            print(f"    - {finding}")
        if len(self.findings) > MAX_SHOWN:
            print(f"    ... and {len(self.findings) - MAX_SHOWN} more")


def strip_fences(text: str) -> str:
    lines: list[str] = []
    fenced = False
    for line in text.splitlines():
        if FENCE.match(line):
            fenced = not fenced
            lines.append("")
        else:
            lines.append("" if fenced else line)
    return "\n".join(lines)


def walk(root: Path, name: str | None = None) -> Iterable[Path]:
    count = 0
    seen: set[tuple[int, int] | str] = set()
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        directory = Path(dirpath)
        try:
            info = directory.stat()
            key: tuple[int, int] | str = (info.st_dev, info.st_ino)
        except OSError:
            key = str(directory.resolve())
        if key in seen:
            dirnames[:] = []
            continue
        seen.add(key)
        dirnames[:] = [item for item in dirnames if item not in SKIP_DIRS]
        for filename in filenames:
            if name is not None and filename != name:
                continue
            count += 1
            if count > MAX_FILES:
                raise RuntimeError(f"workspace exceeds the {MAX_FILES}-file checker bound")
            yield directory / filename


def read_text(path: Path) -> str | None:
    try:
        if path.stat().st_size > MAX_FILE_BYTES:
            return None
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def git(root: Path, *args: str) -> tuple[int, str, str]:
    try:
        result = subprocess.run(
            ["git", *args], cwd=root, capture_output=True, text=True,
            timeout=20, check=False,
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except (OSError, subprocess.SubprocessError) as error:
        return -1, "", str(error)


def check_reader_paths(root: Path, scan_all: bool) -> Result:
    result = Result("reader-facing paths")
    root_real = root.resolve()
    for path in walk(root):
        if path.suffix.lower() != ".md":
            continue
        relative_path = path.relative_to(root)
        if not scan_all and any(part in ARCHIVAL_DIRS for part in relative_path.parts):
            continue
        raw = read_text(path)
        if raw is None:
            result.find(f"{relative_path.as_posix()}: unreadable or over byte bound")
            continue
        result.counted += 1
        text = strip_fences(raw)
        for match in ABSOLUTE_PERSON_PATH.finditer(text):
            result.find(f"{relative_path.as_posix()}: person-specific absolute path -- {match.group(0)!r}")
        for match in RULE_CITATION.finditer(text):
            result.find(f"{relative_path.as_posix()}: rule cited only by number -- {match.group(0)!r}")
        for match in MARKDOWN_LINK.finditer(text):
            target = match.group(1).split("#", 1)[0].split("?", 1)[0]
            if not target or re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I):
                continue
            candidate = (path.parent / target.replace("\\", "/")).resolve()
            try:
                candidate.relative_to(root_real)
            except ValueError:
                result.find(f"{relative_path.as_posix()}: link escapes workspace -- {target!r}")
                continue
            if not candidate.exists():
                result.find(f"{relative_path.as_posix()}: unresolved link -- {target!r}")
    return result


def check_repo_state(root: Path) -> Result:
    result = Result("repository state")
    code, inside, error = git(root, "rev-parse", "--is-inside-work-tree")
    if code != 0 or inside.strip() != "true":
        result.unmeasured = f"not a readable Git worktree ({error.strip() or 'rev-parse failed'})"
        return result
    result.counted = 1
    code, status, error = git(root, "status", "--porcelain=v1", "--untracked-files=all")
    if code != 0:
        result.unmeasured = f"git status failed ({error.strip()})"
        return result
    if status.strip():
        result.find(f"{len(status.strip().splitlines())} changed path(s) are not committed")
    code, stash, _ = git(root, "stash", "list")
    if code != 0:
        result.withheld("stash state unavailable")
    elif stash.strip():
        result.find(f"{len(stash.strip().splitlines())} local stash(es)")
    code, branches, _ = git(root, "for-each-ref", "--format=%(refname:short)\t%(upstream:short)", "refs/heads")
    if code != 0:
        result.withheld("branches unavailable")
    else:
        for line in branches.splitlines():
            branch, _, upstream = line.partition("\t")
            if branch and not upstream:
                result.find(f"branch {branch!r} has no upstream")
            elif branch:
                ahead_code, ahead, _ = git(root, "rev-list", "--count", f"{upstream}..{branch}")
                if ahead_code != 0 or not ahead.strip().isdigit():
                    result.withheld(f"ahead count unavailable for {branch!r}")
                elif int(ahead.strip()) > 0:
                    result.find(f"{ahead.strip()} commit(s) on {branch!r} are not pushed")
    result.withheld("remote not contacted; upstream state is local-cache evidence")
    return result


def _boolean(value: object) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, int) and not isinstance(value, bool) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        if value.strip().lower() in {"true", "yes", "on", "1"}:
            return True
        if value.strip().lower() in {"false", "no", "off", "0"}:
            return False
    return None


def parse_frontmatter(documents: list[str]) -> list[dict[str, object]]:
    helper = Path(__file__).with_name("parse-frontmatter.mjs").resolve()
    if not helper.is_file() or helper.is_symlink():
        raise RuntimeError(f"package frontmatter parser is absent or symlinked: {helper}")
    payload = json.dumps(documents, ensure_ascii=False).encode("utf-8")
    if len(payload) > MAX_FRONTMATTER_BYTES:
        raise RuntimeError(f"frontmatter batch exceeds the {MAX_FRONTMATTER_BYTES}-byte checker bound")
    try:
        completed = subprocess.run(
            ["node", str(helper)], input=payload, capture_output=True,
            timeout=30, check=False,
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise RuntimeError(f"package YAML parser could not run: {error}") from error
    if completed.returncode != 0:
        detail = completed.stderr.decode("utf-8", errors="replace").strip().splitlines()
        raise RuntimeError(f"package YAML parser failed: {detail[0] if detail else 'no diagnostic'}")
    try:
        parsed = json.loads(completed.stdout.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("package YAML parser returned invalid JSON") from error
    if not isinstance(parsed, list) or len(parsed) != len(documents):
        raise RuntimeError("package YAML parser returned the wrong result count")
    if not all(isinstance(item, dict) for item in parsed):
        raise RuntimeError("package YAML parser returned an invalid result")
    return parsed


def check_dsh_skills(root: Path) -> Result:
    result = Result("DSH skill health")
    skills = list(walk(root, "SKILL.md"))
    if not skills:
        result.unmeasured = "no SKILL.md found"
        return result
    root_real = root.resolve()
    records: list[tuple[Path, str, re.Match[str]]] = []
    for skill in skills:
        relative_path = skill.relative_to(root).as_posix()
        raw = read_text(skill)
        if raw is None:
            result.find(f"{relative_path}: unreadable or over byte bound")
            continue
        result.counted += 1
        match = FRONTMATTER.match(raw)
        if match is None:
            result.find(f"{relative_path}: missing YAML frontmatter or body")
            continue
        records.append((skill, relative_path, match))
    parsed = parse_frontmatter([match.group(1) for _, _, match in records])
    for (skill, relative_path, match), parsed_item in zip(records, parsed, strict=True):
        if parsed_item.get("ok") is not True:
            result.find(f"{relative_path}: YAML error -- {parsed_item.get('error', 'unknown parser error')}")
            continue
        data = parsed_item.get("data")
        if not isinstance(data, dict):
            result.find(f"{relative_path}: frontmatter is not a mapping")
            continue
        name = data.get("name")
        description = data.get("description")
        if not isinstance(name, str) or not NAME.fullmatch(name) or name != skill.parent.name:
            result.find(f"{relative_path}: name is invalid or differs from directory")
        if not isinstance(description, str) or not description.strip():
            result.find(f"{relative_path}: description is missing")
        elif len(re.sub(r"\s+", " ", description).strip()) > DESCRIPTION_LIMIT:
            result.find(f"{relative_path}: parsed description exceeds {DESCRIPTION_LIMIT} characters")
        if not match.group(2).strip():
            result.find(f"{relative_path}: body is empty")
        for wrong in ("disableModelInvocation", "userInvocable"):
            if wrong in data:
                result.find(f"{relative_path}: unsupported invocation key {wrong!r}")
        for key in ("disable-model-invocation", "user-invocable"):
            if key in data and _boolean(data[key]) is None:
                result.find(f"{relative_path}: {key} is not a DSH boolean")
        targets = set(RESOURCE_CODE.findall(match.group(2)))
        for target in sorted(targets):
            candidate = (skill.parent / target).resolve()
            try:
                candidate.relative_to(skill.parent.resolve())
                candidate.relative_to(root_real)
            except ValueError:
                result.find(f"{relative_path}: resource escapes skill -- {target!r}")
                continue
            if not candidate.exists() or candidate.is_symlink():
                result.find(f"{relative_path}: resource missing or symlinked -- {target!r}")
    return result


def check_credit_travel(root: Path) -> Result:
    result = Result("skill credit travel")
    skill_roots: list[Path] = []
    dist_skills = root / "dist" / "skills"
    if dist_skills.is_dir():
        skill_roots = [path for path in dist_skills.iterdir() if path.is_dir() and (path / "SKILL.md").is_file()]
    else:
        skill_roots = sorted({skill.parent for skill in walk(root, "SKILL.md")})
    if not skill_roots:
        result.unmeasured = "no packaged or workspace skill directories found"
        return result
    package_file = root / "package.json"
    if dist_skills.is_dir() and package_file.is_file():
        try:
            package = json.loads(package_file.read_text(encoding="utf-8"))
            serialized_files = json.dumps(package.get("files", []))
            if "dist/skills" not in serialized_files:
                result.find("package.json files do not include dist/skills")
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
            result.withheld(f"package manifest unavailable ({error.__class__.__name__})")
    for directory in skill_roots:
        result.counted += 1
        licenses = list(directory.glob("LICENSE*")) + list(directory.glob("NOTICE*"))
        if not any(path.is_file() and path.stat().st_size > 0 for path in licenses):
            result.find(f"{directory.relative_to(root).as_posix()}: no adjacent nonempty license or notice")
    return result


def main(argv: list[str]) -> int:
    if "--help" in argv or "-h" in argv or len(argv) < 2:
        print(__doc__)
        return 0 if len(argv) >= 2 else 2
    global MAX_SHOWN
    if "--full" in argv:
        MAX_SHOWN = 10**9
    positional = [value for value in argv[1:] if not value.startswith("--")]
    if len(positional) != 1:
        print("exactly one explicit TARGET_WORKSPACE is required", file=sys.stderr)
        return 2
    root = Path(positional[0]).resolve()
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2
    print(f"upsum DSH checks -- {root}")
    results = [
        check_reader_paths(root, "--all" in argv),
        check_repo_state(root),
        check_dsh_skills(root),
        check_credit_travel(root),
    ]
    for result in results:
        result.report()
    unavailable = [result.name for result in results if result.unmeasured]
    partial = [result.name for result in results if not result.unmeasured and result.blind]
    findings = sum(len(result.findings) for result in results)
    print(f"\n{findings} finding(s); {len(results) - len(unavailable)}/{len(results)} checks ran.")
    if unavailable:
        print(f"UNMEASURED: {', '.join(unavailable)} -- not the same as passing.")
    if partial:
        print(f"Partially blind: {', '.join(partial)} -- inspect the withheld notes.")
    return 1 if unavailable or partial else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except Exception as error:
        print(f"checks.py failed: {error}", file=sys.stderr)
        raise SystemExit(2)
