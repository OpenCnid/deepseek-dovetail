# Live behavioral evidence

Date: 2026-08-20 (America/Chicago)

## Authorization and composition

The owner authorized a maximum of USD 25 and supplied an existing ChatGPT subscription OAuth session. Runs used the external `deepseek-openai-codex@0.1.0` bundle, provider `openai-codex`, model `gpt-5.6-sol`, and the clean pinned DSH checkout at `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca`. RLM/IPython was not installed in the evaluation profile.

ChatGPT OAuth consumes subscription plan allowance rather than exposing an API-dollar meter. The runner therefore enforced root-process, repetition, timeout, captured-byte, artifact-byte, and environment bounds, prohibited purchased-credit use in the run configuration, and recorded available token usage. It cannot prove a literal USD amount. Across all retained live attempts, 49 DSH root processes reported 121,217 input tokens, 17,941 output tokens, 497,664 cache-read tokens, and 2,276,131 ms of cumulative subprocess duration. No credential appears in argv or retained artifacts.

Each arm received a fresh copied fixture, fresh DSH session root, and empty project-independent skill roots. Treatment used `/<target-skill>`. Baseline and grader disabled `tool-skill`, and every settled result reports no baseline/grader catalog or skill body. Candidate positions were randomized and identity was written only after the verdict settled.

## Settled forward-test results

| Required case | Comparisons | Result | Behavioral evidence |
|---|---:|---|---|
| Prompt/template plus companion | 3 | treatment 1, baseline 2 | `prompt-engineering` loaded exactly once and loaded `hypershot-protocol` as its companion; the small quality sample was mixed |
| Explicit SPARK steering | 1 | treatment | identified S rather than R from successful-tool evidence, chose available DSH grep/read instead of inventing a surface, and left the collaborator-owned tradeoff unchanged |
| Delegation gate | 1 | tie | treatment emitted `DELEGATION: NO` and made no subagent call |
| Useful parallel cold delegation | 1 | treatment | two `subagent` calls were emitted together with `run_in_background: false`; no `subagent_fork` call occurred |
| Blind claim judging | 1 | treatment | a cold domain seat ran first, three cold foreground judge seats ran together, and a cold audit ran after them; no fork occurred |
| Self-play router | 1 | baseline | treatment used cold gatherer, calibrator, adversary, evaluator, utility judge, and audit seats, and disclosed that filesystem/skill-layer blindness was not fully established |
| Skill authoring | 1 | baseline | treatment produced a valid DSH skill body; the blind grader preferred the baseline's more explicit controls and fuller workflow |

The nine settled non-upsum comparisons above yielded treatment 4, baseline 4, and tie 1. These results show that the ported workflows execute and expose where they did or did not help on the recorded tasks; they do not establish universal effectiveness.

## Upsum gate

Six treatment/baseline comparisons settled across three attempts, but all reported the Git and package-script portions as unmeasured. A final diagnostic run placed workspaces directly under the user's home and initialized identical Git fixtures before DSH boot. DSH's in-process `glob` and `read` tools saw the fixture files, while the workspace-write PowerShell subprocess received `Permission denied` for the same pre-created Git worktree. The package-relative checker consequently reported only 1/4 checks measured. Its isolated static test does pass with `python -S`, proving that DSH YAML is parsed through the adjacent Node helper and package-pinned `yaml@2.9.0` without PyYAML.

The live changed/unchanged `upsum` lifecycle criterion remains `UNMEASURED` on this Windows host. A valid next run needs either a DSH Windows sandbox fix that proves restricted subprocess reads of pre-created workspace/Git content, or the same pinned assembled profile inside an outer VM/container with compatible mounts. The runner does not weaken `workspace-write` to manufacture a passing result.

## Retained failures

- `live-oauth/dsh-eval-20260821T003625Z-a157321e`: a detector counted marker-like companion prose as a second target body. Typed `skill-invocation` evidence replaced raw substring counting; the failed run remains retained.
- `live-judge/dsh-eval-20260821T004504Z-9ebbc0d9` and `live-skill-authoring/dsh-eval-20260821T005446Z-5c116e6d`: initial session artifacts exceeded configured caps. Later bounded attempts settled; the failures remain retained.
- `live-upsum/dsh-eval-20260821T005821Z-2ea9ead9`: initial session artifact exceeded its cap.
- `live-upsum/dsh-eval-20260821T010052Z-432eb4f0`, `dsh-eval-20260821T011335Z-873a6112`, and `dsh-eval-20260821T012140Z-08bb19a4`: paired comparisons settled but explicitly reported partial checker blindness.
- `live-upsum/dsh-eval-20260821T013110Z-1ae71f87`: diagnostic treatment completed with the Windows subprocess denial; baseline exited without settling.

The first `live-spark` command used an unsupported `--config` flag and failed at argument parsing before starting DSH. The corrected positional-config invocation produced `live-spark/dsh-eval-20260821T015503Z-ee1ab700` and settled cleanly.
