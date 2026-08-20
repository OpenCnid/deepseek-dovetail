# Implementation and acceptance report

Date: 2026-08-20 (America/Chicago)

## Outcome

`deepseek-dovetail@0.1.0` is implemented as one private, standalone, out-of-tree DSH bundle. Milestones 1–9 in SPEC.md section 17 pass. Milestone 10's bounded runner, platform review, notices, and unmeasured-state handling are implemented; the owner-approved real-provider behavioral run remains `UNMEASURED`, so the first stable-release definition in section 18 is intentionally not claimed complete.

The final assembled profiles were removed after acceptance. The clean pinned DSH and Dovetail checkouts are both still clean at their exact commits. The separate user-modified `dsh-99f6f02-patched` checkout was never built in or edited.

## Milestones and skills

| Section 17 milestone | Status | Primary evidence |
|---|---|---|
| 1. Compatibility preflight | PASS | `COMPATIBILITY.md`, exact public export/dependency record |
| 2. Private package scaffold | PASS | `package.json`, `src/index.ts`, one-row `cordis.patch.yml` |
| 3. Pinned source pipeline | PASS | 31-file vendor subset, 55 reviewed deletion hashes, deterministic digest `e6a8e2701f4fd4a525002ff23ad07e132acccadf8f444b25bfbf2ef95827a1c2` |
| 4. Eight-skill vertical slice | PASS | real-provider integration tests, clean consumer import, tar inspection |
| 5. Host-neutral ports | PASS structurally | prompt/hypershot companions and DSH SPARK overlays; live effectiveness unmeasured |
| 6. Orchestration ports | PASS structurally | exact DSH schemas/lifecycle text and final cold-child snapshot; live impartiality/effectiveness unmeasured |
| 7. Upsum lifecycle | PASS structurally | explicit-only injection/resource-base snapshot, checker execution/exit tests; model-authored changed/unchanged close behavior unmeasured |
| 8. Better Skill Creator/evaluation | PASS structurally | validator, bounded runner, fake failure/abort tests, real DSH keyless paired run |
| 9. Packed and assembled proof | PASS | tar/consumer, web/headless CLI install/config/boot/UI/removal snapshots |
| 10. Behavioral release gate | UNMEASURED | no owner opt-in and no `DEEPSEEK_API_KEY`; see `evidence/behavioral/UNMEASURED.json` |

| Skill | Load/policy/resources | DSH behavior port | Real-provider behavioral gate |
|---|---|---|---|
| `prompt-engineering` | PASS, model + user | host-neutral structure and companion loading | UNMEASURED |
| `hypershot-protocol` | PASS, model + user | host-neutral contamination-free examples | UNMEASURED |
| `spark-steering` | PASS, user-only | DSH skills/presets/plugins/providers/policy levers | UNMEASURED |
| `subagent-composition` | PASS, model + user | cold spawn/fork/background/control/report/preset semantics | UNMEASURED beyond keyless cold-child selection |
| `judge-composition` | PASS, model + user | differently blinded cold seats and post-verdict audit | UNMEASURED |
| `self-play` | PASS, model + user | cold-child visibility matrix and fork prohibition | UNMEASURED beyond keyless cold-child selection |
| `upsum` | PASS, user-only | append-only/fixed-budget/open-work contract and package-relative checker | UNMEASURED for model-authored close behavior |
| `better-skill-creator` | PASS, model + user | DSH author/test/measure loop and paired runner | UNMEASURED for real model quality; keyless routing passes |

## Revisions, runtime, and architecture

- DeepSeek Harness: `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` (`dsh-v0.1.0-rc.7`).
- Cordis: `4.0.1`.
- OpenCnid Dovetail: `69f89e3322847fb11665980c16598494a9eacca0`.
- Acceptance runtime: Node.js `v22.23.2`, pnpm `11.19.0`, Python `3.13.1`, Windows.
- Public runtime path: DSH profile → one `deepseek-dovetail` bundle row → package Cordis plugin → effect-owned `@deepseek-ai/dsh-skill-filesystem` child → `ctx.skills` bundled layer → existing DSH consumers.
- Provider config: `providerName: dovetail`, `includeDefaultRoots: false`, package-local `bundledSkillDir`, `watch: false`.
- Package root: resolved from built `lib/index.js` with `import.meta.url` and `fileURLToPath`.

Direct dependencies are `@deepseek-ai/cordis@4.0.1` plus these exact `0.1.0-rc.7` public packages: `dsh-skill-filesystem`, `dsh-skill`, `dsh-home-paths`, `dsh-llm`, `dsh-scope`, `dsh-timeout`, `dsh-attachment`, `dsh-brand`, `dsh-fs`, `dsh-invariants`, `dsh-sandbox`, `dsh-session`, and `dsh-typert-protocol`. This exact closure is required because profile pnpm sets `autoInstallPeers: false`; the retained failure record documents the peer-only import failure.

## Exact pinned source and overlay paths

The following 31 paths under `vendor/dovetail` are byte-identical to the pinned Dovetail commit and individually SHA-256 locked:

- `skills/better-skill-creator/{LICENSE.txt,NOTICE,requirements.txt,SKILL.md}`
- `skills/hypershot-protocol/{LICENSE.md,SKILL.md}`
- `skills/judge-composition/{LICENSE.md,SKILL.md}`
- `skills/judge-composition/references/{failure-modes.md,substrate-and-cases.md,thesis-and-provenance.md}`
- `skills/prompt-engineering/{LICENSE.md,NOTICE,SKILL.md}`
- `skills/self-play/{LICENSE.md,SKILL.md}`
- `skills/self-play/references/{discipline-cases.md,ground-block-failure.md,measurement-and-reporting.md,measurement-bounds.md,README.md}`
- `skills/spark-steering/{LICENSE.md,SKILL.md}`
- `skills/spark-steering/references/{steer-1-levers.md,steer-3-costs.md}`
- `skills/subagent-composition/{LICENSE.md,SKILL.md}`
- `skills/subagent-composition/references/provenance.md`
- `skills/upsum/{LICENSE.md,SKILL.md}`
- `skills/upsum/scripts/checks.py`

The exact DSH overlay/new paths under `ports/dsh/skills` are:

- `better-skill-creator/SKILL.md`
- `better-skill-creator/requirements.txt`
- `better-skill-creator/references/{dsh-distribution.md,dsh-evaluation.md,dsh-frontmatter.md}`
- `better-skill-creator/scripts/{quick_validate.py,run_eval.py}`
- `hypershot-protocol/SKILL.md`
- `judge-composition/SKILL.md`
- `judge-composition/references/dsh-ceremony.md`
- `prompt-engineering/SKILL.md`
- `self-play/SKILL.md`
- `self-play/references/{dsh-isolation.md,README.md}`
- `spark-steering/SKILL.md`
- `spark-steering/references/{steer-1-levers.md,steer-3-costs.md}`
- `subagent-composition/SKILL.md`
- `subagent-composition/references/dsh-subagents.md`
- `upsum/SKILL.md`
- `upsum/scripts/checks.py`

`ports/dsh/deletions.json` records 28 reviewed deletion roots/files, expanded to 55 SHA-256 entries in `upstream.lock.json`. No file under `vendor/dovetail` was hand-edited.

## Command and result ledger

Compatibility/preflight used read-only `rg`, `Get-Content`, `git show/status/rev-parse`, package-manifest/export inspection, and registry metadata checks over the exact checkouts. The material implementation/acceptance commands were:

| Command | Result |
|---|---|
| `pnpm install` with Node 22/pnpm 11 | PASS; lockfile created, scripts not auto-approved |
| `pnpm peers check` in package | PASS, no issues |
| `pnpm run sync:upstream -- --source D:\deepseek-harness-custom-plugins-setup\dovetail-69f89e-readonly` | PASS; 31 files; lock SHA `dfd1caa72e6c6782be489031de395069d649deda331fc6de2ecd32ce1cbb2425` unchanged on repeat |
| `pnpm run materialize` | PASS; eight skills from 31 pinned files |
| `pnpm run typecheck` | one intermediate failure in a new test, fixed; final PASS |
| `pnpm run lint` | PASS, zero warnings |
| `pnpm run test` | PASS; 6 files, 21 tests |
| `pnpm run build` | PASS |
| `pnpm run verify` | one intermediate Host-shape assertion failure, fixed; final PASS including eight Python validations and 3 real-provider integration tests |
| `pnpm pack --dry-run` | PASS; 46 files, eight SKILL.md files |
| `pnpm run pack:artifact` and `tar -tf` inspection | PASS; no test/vendor/ports/evidence/node_modules/hook/app/MCP/Codex-plugin residue |
| clean consumer `pnpm init`, `pnpm add <tarball>`, `pnpm peers check`, public ESM import | PASS; 21 packages, no peer issues, `Host.apply` importable, eight package skill roots |
| pinned DSH `pnpm install` and `pnpm run build` | PASS; checkout still clean |
| `dsh plugin --profile {headless,web} add <tarball>` | PASS through actual CLI; each assembled profile also passed `pnpm peers check` |
| `dsh --profile {headless,web} --dump-config` | PASS; exactly one package layer and one row while installed |
| five final keyless headless sessions (`catalog-v4`, `/upsum`, `/spark-steering`, self-play, hidden-catalog baseline) | PASS; all subprocesses exit 0 |
| `node scripts/analyze-keyless.mjs ...` | PASS; six complete package catalog entries, explicit-only absence, exactly-one explicit bodies, package resource bases, clean baseline, cold spawn settlement |
| Better Skill Creator `run_eval.py ... --plan` and `--run` against the real clean DSH/keyless adapter | PASS; three independent children and complete sanitized paired artifacts; TIE explicitly denotes routing-only evidence |
| `dsh --profile web ... --port 31988` plus HTTP shell/asset requests | PASS; HTML 200 (12,076 bytes), JS 200 (442,999 bytes) |
| in-app browser slash-menu inspection on the real assembled web profile | PASS; eight entries exactly once, only SPARK/upsum marked user-only, zero browser warning/error logs |
| actual `dsh plugin remove` in both profiles | PASS; row/layer/list absent; post-removal catalog had zero package entries and `/upsum` had zero package invocation |
| before/after user/project skill-home SHA-256 inventory | PASS; identical `31ba2e11ebb6cc36cb353e7b72c4f6dc9b1c33cc9c82425d9a3aa5ec769a996d` across removal/install/removal |
| final `git status --porcelain` in clean DSH and Dovetail fixtures | PASS; empty at both exact commits |

Focused commands also executed every generated skill through packaged `quick_validate.py`; executed `upsum/scripts/checks.py` with explicit changed/clean/non-Git fixtures; and exercised the runner's plan, missing-credential `UNMEASURED`, contaminated/failing grader, timeout kill, bounds, redaction, and artifact-order cases. Failed/incomplete acceptance attempts are retained in `evidence/assembled/failures.md` and raw snapshot directories.

## Package and assembled evidence

- Tarball: `artifacts/deepseek-dovetail-0.1.0.tgz`
- Tarball SHA-256: `b668ccf0244e5c4250b049d42f03811297d2f5c4acf086416c6576c3efb2ea0b`
- Tarball: 61,621 bytes; 46 paths; 8 skill documents; 8 adjacent licenses; Better Skill Creator and Prompt Engineering notices present.
- Clean consumer: `D:\deepseek-harness-custom-plugins-setup\deepseek-dovetail-consumer-final-20260820`.
- Clean DSH fixture: `D:\deepseek-harness-custom-plugins-setup\dsh-99f6f02-clean-dovetail`.
- Isolated DSH home: `D:\deepseek-harness-custom-plugins-setup\dsh-dovetail-assembled-home`.
- Final installed snapshot: `evidence/keyless/snapshot.json` and raw `*-v4` JSONL trees.
- Web UI snapshot: `evidence/assembled/web-ui.snapshot.json`.
- Install/config/boot/removal snapshot: `evidence/assembled/profile.snapshot.json`.
- Paired keyless runner artifacts: `evidence/behavioral/keyless-runner/dsh-eval-20260820T225535Z-9d374658`.

## Security, trust, platform, and licensing limitations

- Plugin load mounts immutable package files only: no runtime fetch/update, script execution, watcher, user-home install, or project/user skill write.
- Skill prose and retained Python scripts are trusted content. Scripts execute only when a DSH agent/user deliberately invokes them; package load never executes them.
- Evaluation config is a trusted execution boundary because it selects a DSH executable, fixed arguments, and common profile patches. Values are bounded/validated and credential names are allowlisted; credentials stay out of argv/artifacts and are scrubbed from captured output.
- Cold-child blindness still depends on an effective DSH composition with `subagent/spawn` and an uncontaminated workspace/tool view. The skills stop rather than substitute inherited fork behavior.
- Initial assembled evidence is Windows-only. The implementation uses cross-platform Node/Python APIs, but macOS/Linux support is not claimed until assembled CLI/runner smoke runs there.
- Upstream license/notice files and Matthew Murphy/Lexideck/SPARK attribution travel with the artifact. New adapter/build/test code has no owner-selected public license. The package stays `private: true` and was not published.

## Unmet stable-release acceptance criteria

1. SPEC section 15.5's seven real-provider behavioral forward tests are `UNMEASURED`; no owner-approved provider/model/spend opt-in was supplied and `DEEPSEEK_API_KEY` was absent. Next change: owner selects provider/model, per-case/repetition/token/time/spend caps and authorizes `run_eval.py --run`; run fresh uncontaminated prompts and retain all outputs.
2. Consequently, section 18's claims that all eight are behavior-compatible and that the bounded behavioral gate passes are not established. All static, keyless, package, and assembled criteria pass.
3. Publication remains blocked by every owner decision in section 19: new-code license, repository/npm ownership and visibility, notice approval, OS claims, and final live-evaluation cost/model approval.

No essential DSH API export remained blocked, no DSH/upstream tracked change is required, and no other acceptance criterion is known unmet.
