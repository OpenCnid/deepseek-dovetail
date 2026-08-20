#!/usr/bin/env python3
"""Validate one skill against the pinned DeepSeek Harness skill format."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None

DESCRIPTION_LIMIT = 480
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
FRONTMATTER = re.compile(r"\A\ufeff?---\r?\n(.*?)\r?\n---\r?\n([\s\S]*)\Z", re.DOTALL)
MARKDOWN_LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
RESOURCE_CODE = re.compile(
    r"`((?:scripts|references|assets|agents|eval-viewer)/[A-Za-z0-9_.\/-]+)`"
)


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    message: str


def normalize_description(value: str) -> str:
    """Normalize a parsed description as the DSH catalog consumer does."""
    return re.sub(r"\s+", " ", value.replace("\r", "\n")).strip()


def parse_boolean(value: Any) -> bool | None:
    """Parse the boolean forms accepted by the pinned filesystem provider."""
    if isinstance(value, bool):
        return value
    if isinstance(value, int) and not isinstance(value, bool) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "on", "1"}:
            return True
        if lowered in {"false", "no", "off", "0"}:
            return False
    return None


def inside(root: Path, candidate: Path) -> bool:
    """Return whether an existing candidate resolves inside root."""
    try:
        candidate.resolve(strict=True).relative_to(root.resolve(strict=True))
        return True
    except (OSError, ValueError):
        return False


def direct_resources(body: str) -> set[str]:
    """Collect directly referenced local resource paths from a skill body."""
    targets = set(RESOURCE_CODE.findall(body))
    for target in MARKDOWN_LINK.findall(body):
        if target.startswith(("#", "http://", "https://", "mailto:")):
            continue
        targets.add(target.split("#", 1)[0].split("?", 1)[0])
    return {target for target in targets if target}


def validate(skill_dir: Path) -> list[Finding]:
    """Return all DSH-format findings for one skill directory."""
    findings: list[Finding] = []
    if yaml is None:
        return [Finding("error", "PY_YAML_MISSING", "PyYAML is required; validation is UNMEASURED")]
    try:
        root = skill_dir.resolve(strict=True)
    except OSError as error:
        return [Finding("error", "SKILL_DIR", f"skill directory is unavailable: {error}")]
    if not root.is_dir():
        return [Finding("error", "SKILL_DIR", "target is not a directory")]
    skill_md = root / "SKILL.md"
    try:
        raw = skill_md.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        return [Finding("error", "SKILL_MD", f"SKILL.md is unreadable UTF-8: {error}")]
    match = FRONTMATTER.match(raw)
    if match is None:
        return [Finding("error", "FRONTMATTER", "expected YAML frontmatter followed by a nonempty body")]
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as error:
        return [Finding("error", "YAML", f"frontmatter does not parse: {str(error).splitlines()[0]}")]
    if not isinstance(data, dict):
        return [Finding("error", "FRONTMATTER", "frontmatter must be a YAML mapping")]

    name = data.get("name")
    if not isinstance(name, str) or NAME.fullmatch(name) is None:
        findings.append(Finding("error", "NAME", "name must be a nonempty kebab-case string"))
    elif name != root.name:
        findings.append(Finding("error", "NAME_DIRECTORY", f"name {name!r} does not match directory {root.name!r}"))

    description = data.get("description")
    if not isinstance(description, str):
        findings.append(Finding("error", "DESCRIPTION", "description must be a string"))
    else:
        normalized = normalize_description(description)
        if not normalized:
            findings.append(Finding("error", "DESCRIPTION", "description is empty after normalization"))
        elif len(normalized) > DESCRIPTION_LIMIT:
            findings.append(Finding(
                "error",
                "DESCRIPTION_LENGTH",
                f"parsed description is {len(normalized)} characters; maximum is {DESCRIPTION_LIMIT}",
            ))

    for wrong in ("disableModelInvocation", "userInvocable"):
        if wrong in data:
            findings.append(Finding("error", "INVOCATION_CAMEL_CASE", f"unsupported key {wrong!r}"))
    for key in ("disable-model-invocation", "user-invocable"):
        if key in data and parse_boolean(data[key]) is None:
            findings.append(Finding("error", "INVOCATION_VALUE", f"{key} must be a DSH boolean value"))

    body = match.group(2)
    if not body.strip():
        findings.append(Finding("error", "BODY", "instruction body is empty"))
    for target in sorted(direct_resources(body)):
        if "\\" in target:
            findings.append(Finding("error", "RESOURCE_SEPARATOR", f"resource uses a Windows-only separator: {target}"))
            continue
        target_path = root / target
        if not target_path.exists():
            findings.append(Finding("error", "RESOURCE_MISSING", f"direct resource does not exist: {target}"))
        elif target_path.is_symlink():
            findings.append(Finding("error", "RESOURCE_SYMLINK", f"direct resource is a symlink: {target}"))
        elif not inside(root, target_path):
            findings.append(Finding("error", "RESOURCE_ESCAPE", f"resource resolves outside the skill: {target}"))
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_dir", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args(argv)
    findings = validate(args.skill_dir)
    payload = {
        "target": "dsh-0.1.0-rc.7",
        "valid": not any(finding.severity == "error" for finding in findings),
        "descriptionLimit": DESCRIPTION_LIMIT,
        "findings": [asdict(finding) for finding in findings],
    }
    if args.as_json:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        state = "valid" if payload["valid"] else "invalid"
        print(f"{args.skill_dir}: {state} for DSH 0.1.0-rc.7")
        for finding in findings:
            print(f"  {finding.severity}: {finding.code}: {finding.message}")
    return 0 if payload["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
