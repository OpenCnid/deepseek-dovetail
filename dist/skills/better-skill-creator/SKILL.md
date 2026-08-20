---
name: better-skill-creator
description: >-
  Author, repair, validate, measure, and package DSH skills. Use when turning a repeated workflow, prompt pattern, team convention, or model-facing template into a skill; when SKILL.md does not trigger, parses incorrectly, is too long, or produces inconsistent results; or when comparing a skill with a clean no-skill baseline. Covers DSH frontmatter, project/user/bundled precedence, /name invocation, paired evaluation, blind grading, evidence artifacts, and private handoff.
license: Apache-2.0
---

# Better Skill Creator for DSH

A `SKILL.md` is model-facing instruction. Before drafting its bytes, load `prompt-engineering` and `hypershot-protocol` with the lowercase DSH `skill` tool unless their `<skill_content>` blocks are already present. If either is unavailable, state that limitation once and continue only if the collaborator wants an unassisted draft. Never reload a body already injected by an explicit `/name` gesture.

## Workflow

1. Define the unreliable behavior, realistic trigger language, output evidence, and done condition. Decide whether judgment plus procedure warrants a skill; a fixed action may belong in a script, ordinary instruction, tool, or preset instead.
2. Draft the smallest `SKILL.md` that carries the workflow. Put directly linked detail in `references/`, executable helpers in `scripts/`, and output assets in `assets/`.
3. Validate immediately by executing `python scripts/quick_validate.py <skill-dir>` from this installed skill's DSH-reported resource base. Fix every parser/policy/resource error before model runs.
4. Prepare realistic cases with identical task bytes for treatment and baseline. State objective assertions and subjective grading criteria before outputs exist.
5. Run independent, bounded DSH treatment/baseline sessions. Treatment begins with `/<target-skill>`. Baseline disables the exact `tool-skill` consumer so it receives neither catalog nor body. Never tell the baseline that a skill or comparison exists.
6. Verify session evidence: treatment contains one target `<skill_content>` body; baseline contains neither `<available_skills>` nor `<skill_content>`. A contaminated arm is retained and excluded, never silently rerun as though it had not happened.
7. Randomize candidate position and blind graders to arm identity. Reveal the mapping only after verdicts settle. Record output, stop reason, duration, available usage, contamination checks, and missing measures.
8. Review results with the collaborator, improve the general instruction rather than naming the test case, widen the held-out set, and repeat until evidence or the collaborator says stop.
9. Revalidate, package privately if needed, inspect the archive, and install through the DSH bundle/profile workflow. Do not copy into project or user skill homes.

Start at the stage the collaborator actually needs. Evals are the default for effectiveness claims, not a barrier to a requested drafting-only session.

## DSH skill format

- Directory: `<kebab-name>/SKILL.md`; DSH filesystem discovery is one level deep.
- Required frontmatter: string `name` matching the directory and nonempty string `description`.
- Description: function plus trigger conditions, parsed/normalized length at most 480 characters for this port.
- Invocation: omitted fields allow both surfaces. `disable-model-invocation: true` makes a skill explicit-only but still available through `/name`. `user-invocable: false` removes the human gesture. Camel-case spellings are invalid and fail closed.
- DSH project and user candidates outrank bundled rank. Never bypass that precedence.
- The model sees only name/description before selection. A user `/name` gesture injects a canonical `<skill_content>` block; the model must not call `skill` again for it.
- Resolve every relative resource against the loaded `<skill_resources>` base. Never hardcode a user home or development checkout.

Read `references/dsh-frontmatter.md` for exact fields and validation. Read `references/dsh-distribution.md` for private package/profile handoff.

## Evaluation runner

`scripts/run_eval.py` is the DSH runner abstraction and CLI. It does not create another agent loop or model-facing tool; it invokes the installed `dsh` headless profile as bounded subprocesses. Configuration names the executable, profile, provider/model, work fixture, artifact root, time/byte/run limits, and allowed environment names. Credential values remain inherited only in memory and never enter command lines or artifacts.

Use `--plan` first. A live run is opt-in and self-reports `UNMEASURED` when required credential variables are absent. It writes independent arm workspaces and session roots, sanitized outputs, stop reason, duration, usage when available, catalog/body checks, randomized blind-grading inputs, verdict, and the post-verdict arm map. Any unsettled arm, missing target body, contaminated baseline, premature unblinding, or exceeded bound fails loudly.

Read `references/dsh-evaluation.md` before a paired run. Execute each retained script to validate it rather than treating source inspection as proof.

## Measurement language

- `0` is a measured value.
- `UNMEASURED` means the run may exist but the named metric or check was unavailable.
- `CONTAMINATED` means a withheld skill/catalog/input reached an arm.
- `FAILED` means a required process, control, arm, or grader did not settle.

Never turn missing timing/usage into zero, a load into evidence of benefit, or a no-skill delta into proof that the skill works. Report what was measured, what was withheld, and what remains an owner decision.

## Provenance

This is an Apache-2.0 adaptation of OpenCnid's Better Skill Creator, itself derived from Anthropic's Skill Creator. Preserve `LICENSE.txt` and `NOTICE`. The DSH rewrite is identified in the package notice and does not imply Anthropic or OpenCnid endorsement.
