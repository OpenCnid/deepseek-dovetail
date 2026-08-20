#!/usr/bin/env python3
"""Bounded, blinded treatment/baseline evaluation through DSH headless.

This is deliberately a host-side runner.  It is neither a model-facing tool nor
an agent loop: every candidate and grader is an ordinary, independent `dsh
--profile headless` process assembled by the installed DeepSeek Harness.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import secrets
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,127}$")
ENV_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
SECRET_RE = re.compile(r"(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)", re.I)
SKILL_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_RUNS = 60
MAX_TIMEOUT_SECONDS = 3600
MAX_CAPTURED_BYTES = 2 * 1024 * 1024
MAX_ARTIFACT_BYTES = 50 * 1024 * 1024
COPY_EXCLUDES = {
    ".git", ".dsh", ".claude", ".agents", ".env", ".env.local",
    ".credentials", ".credentials.yaml", "node_modules", "__pycache__",
}


class EvalError(RuntimeError):
    """A required control or run failed; partial sanitized evidence is retained."""


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def _tree_size(root: Path) -> int:
    total = 0
    if not root.exists():
        return 0
    for path in root.rglob("*"):
        if path.is_symlink():
            raise EvalError(f"symlink is not permitted in evaluation artifacts: {path}")
        if path.is_file():
            total += path.stat().st_size
    return total


def _json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def _write_bounded(path: Path, value: Any, limit: int) -> None:
    data = value if isinstance(value, bytes) else _json_bytes(value)
    if len(data) > limit:
        raise EvalError(f"artifact exceeds {limit} bytes: {path.name}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def _yaml_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def _nested_strings(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from _nested_strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from _nested_strings(item)


def _usage_from(value: Any) -> Any:
    if isinstance(value, dict):
        for key in ("usage", "tokenUsage", "token_usage"):
            if key in value:
                return value[key]
        for item in value.values():
            found = _usage_from(item)
            if found != "UNMEASURED":
                return found
    elif isinstance(value, list):
        for item in value:
            found = _usage_from(item)
            if found != "UNMEASURED":
                return found
    return "UNMEASURED"


def _copy_fixture(source: Path, destination: Path, max_bytes: int) -> None:
    if not source.is_dir():
        raise EvalError(f"workspaceFixture is not a directory: {source}")
    size = 0
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        if any(part in COPY_EXCLUDES for part in relative.parts):
            continue
        if path.is_symlink():
            raise EvalError(f"workspace fixture contains a symlink: {relative}")
        target = destination / relative
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        elif path.is_file():
            size += path.stat().st_size
            if size > max_bytes:
                raise EvalError(f"workspace fixture exceeds {max_bytes} bytes")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)


@dataclass(frozen=True)
class Limits:
    timeout_seconds: int
    max_captured_bytes: int
    max_artifact_bytes: int


@dataclass(frozen=True)
class Case:
    id: str
    task: str
    grader_prompt: str


@dataclass(frozen=True)
class Settings:
    dsh_executable: str
    dsh_arguments: tuple[str, ...]
    common_patches: tuple[Path, ...]
    profile: str
    provider: str
    model: str
    target_skill: str
    workspace_fixture: Path
    artifact_root: Path
    repetitions: int
    required_credential_env: tuple[str, ...]
    allowed_environment: tuple[str, ...]
    limits: Limits
    cases: tuple[Case, ...]


@dataclass
class ProcessResult:
    argv_labels: list[str]
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int
    timed_out: bool
    capture_truncated: bool


@dataclass
class ArmResult:
    label: str
    output: str
    stop_reason: Any
    usage: Any
    process: ProcessResult
    target_body_count: int
    saw_catalog: bool
    saw_any_skill_content: bool
    session_files: int


class _Capture:
    def __init__(self, limit: int) -> None:
        self.limit = limit
        self.total = 0
        self.truncated = False
        self.lock = threading.Lock()
        self.buffers: dict[str, bytearray] = {"stdout": bytearray(), "stderr": bytearray()}

    def drain(self, name: str, pipe: Any) -> None:
        while True:
            chunk = pipe.read(65536)
            if not chunk:
                return
            with self.lock:
                room = max(0, self.limit - self.total)
                kept = chunk[:room]
                self.buffers[name].extend(kept)
                self.total += len(kept)
                if len(kept) != len(chunk):
                    self.truncated = True


class Runner(ABC):
    """Host runner boundary used by the paired-evaluation ceremony."""

    @abstractmethod
    def command_labels(self, patch: Path, task: str) -> list[str]:
        """Return a credential-free description of the child command."""

    @abstractmethod
    def run(self, patch: Path, task: str, cwd: Path) -> ProcessResult:
        """Run one independent bounded host session."""


class DshRunner(Runner):
    def __init__(self, settings: Settings, environment: Mapping[str, str], secrets_to_scrub: Sequence[str]) -> None:
        executable = shutil.which(settings.dsh_executable) if not Path(settings.dsh_executable).is_file() else settings.dsh_executable
        if executable is None:
            raise EvalError(f"DSH executable was not found: {settings.dsh_executable}")
        self.executable = str(Path(executable).resolve())
        self.settings = settings
        self.environment = dict(environment)
        self.secrets = sorted({value for value in secrets_to_scrub if len(value) >= 4}, key=len, reverse=True)

    def _scrub(self, text: str) -> str:
        for value in self.secrets:
            text = text.replace(value, "[REDACTED]")
        return text

    def command_labels(self, patch: Path, task: str) -> list[str]:
        return [
            Path(self.executable).name, *self.settings.dsh_arguments,
            "--profile", self.settings.profile,
            *(part for common in self.settings.common_patches for part in ("--patch", str(common))),
            "--patch", str(patch),
            f"<task:{len(task.encode('utf-8'))}-bytes:{hashlib.sha256(task.encode()).hexdigest()[:12]}>",
        ]

    def run(self, patch: Path, task: str, cwd: Path) -> ProcessResult:
        argv = [
            self.executable, *self.settings.dsh_arguments,
            "--profile", self.settings.profile,
            *(part for common in self.settings.common_patches for part in ("--patch", str(common))),
            "--patch", str(patch), task,
        ]
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
        start_new_session = os.name != "nt"
        capture = _Capture(self.settings.limits.max_captured_bytes)
        started = time.monotonic()
        proc = subprocess.Popen(
            argv,
            cwd=cwd,
            env=self.environment,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=creationflags,
            start_new_session=start_new_session,
        )
        assert proc.stdout is not None and proc.stderr is not None
        threads = [
            threading.Thread(target=capture.drain, args=("stdout", proc.stdout), daemon=True),
            threading.Thread(target=capture.drain, args=("stderr", proc.stderr), daemon=True),
        ]
        for thread in threads:
            thread.start()
        timed_out = False
        try:
            proc.wait(timeout=self.settings.limits.timeout_seconds)
        except subprocess.TimeoutExpired:
            timed_out = True
            if os.name == "nt":
                subprocess.run(
                    ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    timeout=15, check=False,
                )
            else:
                os.killpg(proc.pid, signal.SIGKILL)
            proc.wait(timeout=15)
        for thread in threads:
            thread.join(timeout=5)
        duration_ms = round((time.monotonic() - started) * 1000)
        return ProcessResult(
            argv_labels=self.command_labels(patch, task),
            exit_code=int(proc.returncode),
            stdout=self._scrub(capture.buffers["stdout"].decode("utf-8", errors="replace")),
            stderr=self._scrub(capture.buffers["stderr"].decode("utf-8", errors="replace")),
            duration_ms=duration_ms,
            timed_out=timed_out,
            capture_truncated=capture.truncated,
        )


def _load_settings(path: Path) -> Settings:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise EvalError("configuration must be a JSON object")

    def string(name: str) -> str:
        value = raw.get(name)
        if not isinstance(value, str) or not value.strip() or "\x00" in value:
            raise EvalError(f"{name} must be a nonempty string")
        return value

    profile = string("profile")
    provider = string("provider")
    model = string("model")
    skill = string("targetSkill")
    if not ID_RE.fullmatch(profile) or not ID_RE.fullmatch(provider) or not ID_RE.fullmatch(model):
        raise EvalError("profile, provider, and model must use lowercase DSH identifiers")
    if not SKILL_RE.fullmatch(skill):
        raise EvalError("targetSkill must be a lowercase kebab-case skill name")
    repetitions = raw.get("repetitions", 1)
    if not isinstance(repetitions, int) or not 1 <= repetitions <= 20:
        raise EvalError("repetitions must be an integer from 1 through 20")
    timeout = raw.get("timeoutSeconds", 300)
    captured = raw.get("maxCapturedBytes", 512 * 1024)
    artifacts = raw.get("maxArtifactBytes", 20 * 1024 * 1024)
    if not isinstance(timeout, int) or not 1 <= timeout <= MAX_TIMEOUT_SECONDS:
        raise EvalError(f"timeoutSeconds must be from 1 through {MAX_TIMEOUT_SECONDS}")
    if not isinstance(captured, int) or not 4096 <= captured <= MAX_CAPTURED_BYTES:
        raise EvalError(f"maxCapturedBytes must be from 4096 through {MAX_CAPTURED_BYTES}")
    if not isinstance(artifacts, int) or not 65536 <= artifacts <= MAX_ARTIFACT_BYTES:
        raise EvalError(f"maxArtifactBytes must be from 65536 through {MAX_ARTIFACT_BYTES}")

    def env_names(name: str) -> tuple[str, ...]:
        value = raw.get(name, [])
        if not isinstance(value, list) or not all(isinstance(item, str) and ENV_RE.fullmatch(item) for item in value):
            raise EvalError(f"{name} must be an array of environment-variable names")
        return tuple(dict.fromkeys(value))

    dsh_arguments_raw = raw.get("dshArguments", [])
    if (not isinstance(dsh_arguments_raw, list)
            or len(dsh_arguments_raw) > 16
            or not all(isinstance(item, str) and "\x00" not in item for item in dsh_arguments_raw)):
        raise EvalError("dshArguments must be an array of at most 16 NUL-free strings")
    common_patches_raw = raw.get("commonPatches", [])
    if not isinstance(common_patches_raw, list) or len(common_patches_raw) > 8:
        raise EvalError("commonPatches must be an array of at most 8 paths")
    common_patches: list[Path] = []
    for value in common_patches_raw:
        if not isinstance(value, str) or not value.strip() or "\x00" in value:
            raise EvalError("every commonPatches entry must be a nonempty NUL-free path")
        common = Path(value).expanduser().resolve()
        if not common.is_file() or common.is_symlink() or common.stat().st_size > 256 * 1024:
            raise EvalError(f"common patch is absent, symlinked, or over 256 KiB: {common}")
        common_patches.append(common)

    cases_raw = raw.get("cases")
    if not isinstance(cases_raw, list) or not cases_raw:
        raise EvalError("cases must be a nonempty array")
    cases: list[Case] = []
    seen: set[str] = set()
    for item in cases_raw:
        if not isinstance(item, dict):
            raise EvalError("every case must be an object")
        case_id = item.get("id")
        task = item.get("task")
        grader = item.get("graderPrompt")
        if not isinstance(case_id, str) or not ID_RE.fullmatch(case_id) or case_id in seen:
            raise EvalError("case ids must be unique lowercase identifiers")
        if not isinstance(task, str) or not task.strip() or not isinstance(grader, str) or not grader.strip():
            raise EvalError(f"case {case_id} needs nonempty task and graderPrompt strings")
        seen.add(case_id)
        cases.append(Case(case_id, task, grader))
    if len(cases) * repetitions * 3 > MAX_RUNS:
        raise EvalError(f"configuration would exceed the {MAX_RUNS}-child-run bound")

    fixture = Path(string("workspaceFixture")).expanduser().resolve()
    artifact_root = Path(string("artifactRoot")).expanduser().resolve()
    if artifact_root == Path(artifact_root.anchor) or len(artifact_root.parts) < 3:
        raise EvalError("artifactRoot is too broad")
    return Settings(
        dsh_executable=string("dshExecutable"), dsh_arguments=tuple(dsh_arguments_raw),
        common_patches=tuple(common_patches), profile=profile, provider=provider, model=model,
        target_skill=skill, workspace_fixture=fixture, artifact_root=artifact_root,
        repetitions=repetitions, required_credential_env=env_names("requiredCredentialEnv"),
        allowed_environment=env_names("allowedEnvironment"),
        limits=Limits(timeout, captured, artifacts), cases=tuple(cases),
    )


def _child_environment(settings: Settings) -> tuple[dict[str, str], list[str]]:
    platform_names = {
        "PATH", "PATHEXT", "SystemRoot", "SYSTEMROOT", "ComSpec", "COMSPEC",
        "TEMP", "TMP", "TMPDIR", "USERPROFILE", "HOME", "APPDATA", "LOCALAPPDATA",
        "PROGRAMDATA", "LANG", "LC_ALL", "NODE_OPTIONS", "DSH_HOME",
    }
    names = platform_names | set(settings.allowed_environment) | set(settings.required_credential_env)
    child = {name: os.environ[name] for name in names if name in os.environ}
    child["DSH_TELEMETRY_DISABLED"] = "1"
    secret_values = [value for name, value in child.items() if SECRET_RE.search(name)]
    return child, secret_values


def _write_patch(path: Path, settings: Settings, session_root: Path, hide_skill_consumer: bool) -> None:
    rows = [
        "- id: agent-default-model",
        "  config:",
        f"    provider: {_yaml_quote(settings.provider)}",
        f"    model: {_yaml_quote(settings.model)}",
        "- id: session-persistence-jsonl",
        "  config:",
        f"    root: {_yaml_quote(str(session_root.resolve()))}",
        "    compression: none",
        "    packChunks: false",
    ]
    if hide_skill_consumer:
        rows.extend(["- id: tool-skill", "  disabled: true"])
    path.write_text("\n".join(rows) + "\n", encoding="utf-8")


def _read_session_evidence(session_root: Path, target_skill: str, scrub: Any) -> dict[str, Any]:
    files = sorted(session_root.rglob("*.jsonl")) if session_root.exists() else []
    events: list[dict[str, Any]] = []
    sanitized_lines: list[str] = []
    for file in files:
        if file.is_symlink() or not _is_within(file, session_root):
            raise EvalError(f"session persistence escaped its configured root: {file}")
        for line in file.read_text(encoding="utf-8", errors="replace").splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError as error:
                raise EvalError(f"invalid DSH JSONL in {file.name}: {error}") from error
            if isinstance(event, dict):
                events.append(event)
                sanitized_lines.append(scrub(json.dumps(event, ensure_ascii=False, separators=(",", ":"))))
    all_text = "\n".join(text for event in events for text in _nested_strings(event))
    marker = f'<skill_content name="{target_skill}">'
    turn_ends = [event.get("data", {}).get("reason") for event in events if event.get("type") == "turn/end"]
    assistant = [event for event in events if event.get("type") == "assistant/message"]
    return {
        "files": len(files),
        "targetBodyCount": all_text.count(marker),
        "sawCatalog": "<available_skills>" in all_text,
        "sawAnySkillContent": "<skill_content" in all_text,
        "stopReason": turn_ends[-1] if turn_ends else "UNMEASURED",
        "usage": _usage_from(assistant[-1]) if assistant else "UNMEASURED",
        "sanitizedJsonl": "\n".join(sanitized_lines) + ("\n" if sanitized_lines else ""),
    }


def _arm_json(arm: ArmResult) -> dict[str, Any]:
    return {
        "label": arm.label,
        "output": arm.output,
        "stopReason": arm.stop_reason,
        "durationMs": arm.process.duration_ms,
        "usage": arm.usage,
        "process": {
            "argv": arm.process.argv_labels,
            "exitCode": arm.process.exit_code,
            "stderr": arm.process.stderr,
            "timedOut": arm.process.timed_out,
            "captureTruncated": arm.process.capture_truncated,
        },
        "surfaceChecks": {
            "targetBodyCount": arm.target_body_count,
            "sawCatalog": arm.saw_catalog,
            "sawAnySkillContent": arm.saw_any_skill_content,
            "sessionFiles": arm.session_files,
        },
    }


def _execute_arm(
    runner: DshRunner, settings: Settings, case_dir: Path, label: str, task: str,
    hide_skill_consumer: bool,
) -> ArmResult:
    patch = case_dir / f"{label}.overlay.yml"
    with tempfile.TemporaryDirectory(prefix=f"dovetail-{label}-") as temporary:
        temporary_root = Path(temporary).resolve()
        workspace = temporary_root / "workspace"
        session_root = temporary_root / "sessions"
        workspace.mkdir()
        session_root.mkdir()
        _copy_fixture(settings.workspace_fixture, workspace, settings.limits.max_artifact_bytes // 4)
        _write_patch(patch, settings, session_root, hide_skill_consumer)
        process = runner.run(patch, task, workspace)
        if _tree_size(temporary_root) > settings.limits.max_artifact_bytes:
            raise EvalError(f"{label} temporary workspace/session bound was exceeded")
        evidence = _read_session_evidence(session_root, settings.target_skill, runner._scrub)
    _write_bounded(
        case_dir / f"{label}.session.sanitized.jsonl",
        evidence.pop("sanitizedJsonl").encode("utf-8"),
        settings.limits.max_captured_bytes,
    )
    arm = ArmResult(
        label=label, output=process.stdout.rstrip("\r\n"), stop_reason=evidence["stopReason"],
        usage=evidence["usage"], process=process, target_body_count=evidence["targetBodyCount"],
        saw_catalog=evidence["sawCatalog"], saw_any_skill_content=evidence["sawAnySkillContent"],
        session_files=evidence["files"],
    )
    _write_bounded(case_dir / f"{label}.json", _arm_json(arm), settings.limits.max_captured_bytes)
    return arm


def _assert_settled(arm: ArmResult) -> None:
    if arm.process.timed_out or arm.process.capture_truncated or arm.process.exit_code != 0:
        raise EvalError(f"{arm.label} did not settle successfully")
    if arm.session_files == 0:
        raise EvalError(f"{arm.label} produced no persisted DSH session")


def _grader_task(case: Case, candidates: Sequence[tuple[str, str]]) -> str:
    return (
        "Judge two anonymous candidate outputs for the same task. Do not infer their origin. "
        "Return a concise verdict naming A, B, or TIE and explain it against the stated rubric.\n\n"
        f"TASK\n{case.task}\n\nRUBRIC\n{case.grader_prompt}\n\n"
        f"CANDIDATE A\n{candidates[0][1]}\n\nCANDIDATE B\n{candidates[1][1]}"
    )


def _plan(settings: Settings, runner: DshRunner) -> dict[str, Any]:
    commands: list[dict[str, Any]] = []
    for case in settings.cases:
        for repetition in range(1, settings.repetitions + 1):
            prefix = f"{case.id}-{repetition:02d}"
            commands.extend([
                {"case": prefix, "arm": "treatment", "argv": runner.command_labels(Path("<treatment-patch>"), f"/{settings.target_skill}\n{case.task}")},
                {"case": prefix, "arm": "baseline", "argv": runner.command_labels(Path("<baseline-patch>"), case.task)},
                {"case": prefix, "arm": "grader", "argv": runner.command_labels(Path("<grader-patch>"), "<blind-grading-task>")},
            ])
    return {
        "status": "PLAN",
        "targetSkill": settings.target_skill,
        "runs": len(commands),
        "limits": settings.limits.__dict__,
        "controls": {
            "treatmentPrefix": f"/{settings.target_skill}",
            "baselineHides": "tool-skill",
            "graderHides": "tool-skill",
            "armMapWritten": "after grader process settles",
            "commonPatches": len(settings.common_patches),
        },
        "commands": commands,
    }


def _run(settings: Settings, runner: DshRunner) -> tuple[Path, dict[str, Any]]:
    stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    run_dir = settings.artifact_root / f"dsh-eval-{stamp}-{secrets.token_hex(4)}"
    run_dir.mkdir(parents=True, exist_ok=False)
    summary: dict[str, Any] = {
        "status": "RUNNING", "targetSkill": settings.target_skill,
        "startedAt": stamp, "cases": [],
    }
    _write_bounded(run_dir / "run.json", summary, settings.limits.max_captured_bytes)
    try:
        for case in settings.cases:
            for repetition in range(1, settings.repetitions + 1):
                case_dir = run_dir / f"{case.id}-{repetition:02d}"
                case_dir.mkdir(parents=True)
                treatment = _execute_arm(
                    runner, settings, case_dir, "treatment",
                    f"/{settings.target_skill}\n{case.task}", False,
                )
                baseline = _execute_arm(runner, settings, case_dir, "baseline", case.task, True)
                _assert_settled(treatment)
                _assert_settled(baseline)
                if treatment.target_body_count != 1:
                    raise EvalError(f"treatment target body count is {treatment.target_body_count}, expected 1")
                if baseline.saw_catalog or baseline.saw_any_skill_content:
                    raise EvalError("baseline is CONTAMINATED by a skill catalog or body")

                ordered = [("treatment", treatment.output), ("baseline", baseline.output)]
                if secrets.randbelow(2):
                    ordered.reverse()
                blind = [{"position": chr(65 + index), "output": output} for index, (_, output) in enumerate(ordered)]
                _write_bounded(case_dir / "grade-input.json", {"task": case.task, "rubric": case.grader_prompt, "candidates": blind}, settings.limits.max_captured_bytes)
                grader = _execute_arm(runner, settings, case_dir, "grader", _grader_task(case, ordered), True)
                _assert_settled(grader)
                if grader.saw_catalog or grader.saw_any_skill_content:
                    raise EvalError("grader is CONTAMINATED by a skill catalog or body")
                if not grader.output.strip():
                    raise EvalError("grader returned no verdict")

                # Identity remains only in memory until the grader settles and its verdict is durable.
                _write_bounded(case_dir / "arm-map.json", {
                    chr(65 + index): label for index, (label, _) in enumerate(ordered)
                }, settings.limits.max_captured_bytes)
                result = {
                    "case": case.id, "repetition": repetition, "status": "MEASURED",
                    "treatment": _arm_json(treatment), "baseline": _arm_json(baseline),
                    "grader": _arm_json(grader),
                }
                _write_bounded(case_dir / "result.json", result, settings.limits.max_captured_bytes)
                summary["cases"].append({"case": case.id, "repetition": repetition, "status": "MEASURED"})
                if _tree_size(run_dir) > settings.limits.max_artifact_bytes:
                    raise EvalError("evaluation artifact bound was exceeded")
        summary["status"] = "MEASURED"
        return run_dir, summary
    except Exception as error:
        summary["status"] = "FAILED"
        summary["error"] = str(error)
        raise
    finally:
        _write_bounded(run_dir / "run.json", summary, settings.limits.max_captured_bytes)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path, help="bounded DSH evaluation JSON configuration")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan", action="store_true", help="validate and print credential-free child command shapes")
    mode.add_argument("--run", action="store_true", help="opt in to real-provider DSH child processes")
    args = parser.parse_args(argv)
    try:
        settings = _load_settings(args.config.resolve())
        child_env, secret_values = _child_environment(settings)
        missing = [name for name in settings.required_credential_env if not os.environ.get(name)]
        # Resolve the executable even in plan mode: an unexecutable plan is not useful evidence.
        runner = DshRunner(settings, child_env, secret_values)
        if args.plan:
            print(json.dumps(_plan(settings, runner), ensure_ascii=False, indent=2, sort_keys=True))
            return 0
        if missing:
            print(json.dumps({
                "status": "UNMEASURED",
                "reason": "required credential environment is absent",
                "missingEnvironmentNames": missing,
            }, indent=2, sort_keys=True))
            return 0
        run_dir, summary = _run(settings, runner)
        print(json.dumps({**summary, "artifactPath": str(run_dir)}, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except Exception as error:
        print(f"FAILED: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
