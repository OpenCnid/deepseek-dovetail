# Paired DSH skill evaluation

## Inputs

Provide a JSON config to `scripts/run_eval.py`. It names the DSH executable, optional fixed `dshArguments`, optional common overlays, installed profile, target skill, exact provider/model, immutable workspace fixture, artifact root, cases, repetitions, grader prompt, timeout, captured-byte/artifact limits, and an environment-name allowlist. Common overlays are applied identically before every arm-specific overlay; use them for a fixed composition or keyless adapter, never to encode arm identity. Task strings are data; credential values are inherited only from named variables and are never serialized.

## Arms

Each repetition creates separate disposable workspaces and raw session roots. Treatment receives `/<target-skill>` followed by the unchanged task bytes. Baseline receives only those task bytes and a DSH patch disabling the exact `tool-skill` row. Both patches also pin the same model/provider and raw session persistence root.

After each process settles, the runner reads the raw JSONL session and checks every user-visible text block. Treatment must contain exactly one target `<skill_content>` marker. Baseline must contain neither `<available_skills>` nor `<skill_content>`. These checks establish prompt separation, not effectiveness.

## Blind grading

The runner randomizes the two sanitized outputs as candidate A/B before building a grader task. The grader receives the same declared rubric and no arm identity. Its skill consumer is disabled. Only after the grader process settles does the runner write the arm mapping and derived winner. A missing grader output is `FAILED`; unavailable usage is `UNMEASURED` and never zero.

## Bounds and privacy

Subprocess count, repetitions, timeout, captured bytes, individual artifact bytes, total artifact bytes, and environment names are validated before execution. The default action is `--plan`. Live execution self-skips as `UNMEASURED` when required credential names are absent. Raw provider credentials, full inherited environments, and unsanitized session logs are never copied into evidence.
