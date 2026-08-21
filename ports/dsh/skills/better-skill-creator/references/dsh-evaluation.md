# Paired DSH skill evaluation

## Inputs

Provide a JSON config to `scripts/run_eval.py`. It names the DSH executable, optional fixed `dshArguments`, optional common overlays, installed profile, target skill, exact provider/model, immutable workspace fixture, artifact root, cases, repetitions, grader prompt, timeout, captured-byte/artifact limits, and an environment-name allowlist. Common overlays are applied identically before every arm-specific overlay; use them for a fixed composition or keyless adapter, never to encode arm identity. Task strings are data; credential values are inherited only from named variables and are never serialized.

## Arms

Each repetition creates separate disposable workspaces and raw session roots. On Windows, configure `workspaceTempRoot` to an existing caller-owned root with DSH-compatible inherited ACLs; the pinned real-ACL suite uses a home-directory scratch root. A user-private `%TEMP%` may deny the restricted token read access even after DSH applies its write grant. Session/control state remains in a separate system-temp tree. When `initializeGit` is true, the trusted host runner initializes and commits the copied fixture before DSH starts with a fixed local identity, commit date, branch, and message, yielding identical clean Git state for every arm without weakening the model's sandbox. Every arm-specific patch pins `sandbox-policy` to `workspace-write`, pins `fs-sandbox` to the arm workspace, and redirects the normal filesystem skill provider's DSH, agents, and bundled roots to empty arm-local directories with watching disabled. Treatment receives `/<target-skill>` followed by the unchanged task bytes. Baseline receives only those task bytes and a DSH patch disabling the exact `tool-skill` row. Both patches also pin the same model/provider and raw session persistence root.

After each process settles, the runner reads the raw JSONL session and checks every user-visible text block. Treatment must contain exactly one target `<skill_content>` marker. Baseline must contain neither `<available_skills>` nor `<skill_content>`. These checks establish prompt separation, not effectiveness.

## Blind grading

The runner randomizes the two sanitized outputs as candidate A/B before building a grader task. The grader receives the same declared rubric and no arm identity. Its skill consumer is disabled. Only after the grader process settles does the runner write the arm mapping and derived winner. A missing grader output is `FAILED`; unavailable usage is `UNMEASURED` and never zero.

## Bounds and privacy

Subprocess count, repetitions, timeout, captured bytes, individual artifact bytes, total artifact bytes, and environment names are validated before execution. The default action is `--plan`. Live execution self-skips as `UNMEASURED` when required credential names are absent. Raw provider credentials, full inherited environments, and unsanitized session logs are never copied into evidence.

This controls ordinary cross-arm state; it is not an adversarial secrecy boundary. The pinned DSH filesystem seam allows reads in every sandbox mode, and RLM/IPython executes code with the DSH process's OS authority. Do not compose RLM/IPython into these profiles. If hostile readable host data or untrusted code is in scope, run the complete profile inside a disposable OS account, VM, or container whose mounted inputs are limited to the fixture, installed profile, and credential channel.
