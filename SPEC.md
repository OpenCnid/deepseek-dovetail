# `deepseek-dovetail` compatibility-port specification

Status: Draft v0.1  
Date: 2026-08-20  
Target host: DeepSeek Harness `dsh-v0.1.0-rc.7`  
Target upstream: OpenCnid Dovetail commit `69f89e3322847fb11665980c16598494a9eacca0`

## 1. Outcome

Build one standalone, out-of-tree DeepSeek Harness bundle named `deepseek-dovetail`. The bundle packages DSH-compatible editions of Dovetail's eight skills and exposes them through DSH's existing `ctx.skills` capability. It must preserve Dovetail's prompt-authoring, delegation, judge-panel, clean-room self-play, skill-evaluation, SPARK-steering, and session-close purposes while replacing Claude Code and Codex host assumptions with behavior that is true in DSH.

The completed package must install and remove through the normal DSH profile workflow, require no tracked change to DeepSeek Harness or upstream Dovetail, perform no network access at runtime, and keep every skill resource inside the installed package.

This is a compatibility port, not a claim that loading upstream Dovetail unchanged makes every workflow correct. Upstream's current discovery bridges target Claude Code and Codex; several instruction bodies still name Claude-specific tools, paths, agent files, hooks, and subprocesses. The port is complete only when its packaged instructions advertise and exercise DSH behavior.

## 2. Normative language

The terms MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are normative.

The following compatibility levels are used throughout this specification:

1. **Load-compatible**: DSH discovers the skill, parses its invocation policy, and loads its body and resources.
2. **Instruction-compatible**: the body names only supported DSH operations or clearly labeled external reference behavior.
3. **Behavior-compatible**: realistic DSH runs can execute the workflow without relying on an unstated Claude/Codex mechanism.
4. **Distribution-compatible**: a packed artifact installs, boots, unloads, and removes through DSH's actual plugin/profile workflow.

The first stable release MUST satisfy all four levels for all eight skills. Alpha releases MAY stage the levels, but MUST state their incomplete level and MUST NOT describe an unverified workflow as supported.

## 3. Pinned compatibility baselines

Implementation and tests MUST use these revisions until an intentional upgrade updates this specification and the compatibility record:

| Component | Revision or version | Purpose |
|---|---|---|
| DeepSeek Harness | `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` / `dsh-v0.1.0-rc.7` | Host APIs, package versions, assembled fixture |
| Cordis | `4.0.1` | Plugin runtime used by the target DSH release |
| OpenCnid Dovetail | `69f89e3322847fb11665980c16598494a9eacca0` | Skill text, resources, scripts, licenses, and provenance |
| Node.js | `^22.19.0 || >=24` | DSH-compatible build and runtime |
| pnpm | `11.x` | Reproducible workspace/package management |

The implementation repository MUST record the exact installed DSH package versions it consumes. Floating Git branches, unpinned Git dependencies, runtime Git clones, and runtime downloads are forbidden.

The implementation session MUST inspect the pinned DSH and Dovetail sources directly before coding. It MUST read the applicable `AGENTS.md` files in those checkouts and MUST NOT infer APIs from package names or this specification alone.

## 4. Goals

The implementation MUST:

1. Ship all eight Dovetail skills: `better-skill-creator`, `hypershot-protocol`, `judge-composition`, `prompt-engineering`, `self-play`, `spark-steering`, `subagent-composition`, and `upsum`.
2. Mount them as one package-owned bundled provider through DSH's existing skill registry and filesystem provider.
3. Preserve DSH's project and user skill precedence over package-bundled skills.
4. Preserve the user-only policy of `spark-steering` and `upsum`; the other six remain model- and user-invocable.
5. Keep every catalog description complete within DSH's configured default `500`-character description limit.
6. Replace unsupported Claude/Codex operational instructions with DSH-native skill, subagent, preset, tool-filter, resource, and explicit-invocation semantics.
7. Preserve each skill's necessary references, scripts, assets, copyright notices, license, and provenance.
8. Provide deterministic offline materialization from a pinned vendored source snapshot plus reviewed DSH overlays.
9. Provide static, package, assembled-profile, keyless snapshot, and opt-in behavioral evaluation evidence.
10. Install from a local checkout and packed tarball into unmodified DSH `web` and `headless` profiles.

## 5. Non-goals

The first stable release MUST NOT:

- add another skill registry, agent loop, subagent provider, memory system, or session store;
- patch DSH core to recognize Dovetail;
- install a Codex `.codex-plugin/plugin.json`, marketplace entry, MCP server, app, browser card, or hook;
- copy skills into `~/.agents`, `~/.dsh`, a project `.agents`, or a project `.dsh` directory;
- auto-update from GitHub or fetch skill bodies at runtime;
- preserve Claude-specific behavior merely by renaming `Agent` to `subagent`;
- claim that `subagent_fork` provides clean-room blindness;
- run Dovetail scripts automatically when the plugin loads;
- execute a real-model evaluation in CI or require user credentials for keyless tests;
- publish to npm, select a new license for adapter code, or alter upstream license text without owner approval; or
- claim support for a DSH version or operating system that has not passed the assembled acceptance run.

## 6. Architecture and ownership

### 6.1 Runtime path

The required runtime path is:

```text
DSH profile
  -> deepseek-dovetail bundle row
  -> deepseek-dovetail Cordis plugin
  -> @deepseek-ai/dsh-skill-filesystem over package-local dist/skills
  -> ctx.skills bundled layer
  -> existing dsh-tool-skill and UI consumers
```

The package plugin MUST resolve `dist/skills` relative to its built module with `import.meta.url` and `fileURLToPath`. It MUST mount `@deepseek-ai/dsh-skill-filesystem` with the semantic configuration:

```ts
{
  providerName: 'dovetail',
  includeDefaultRoots: false,
  bundledSkillDir: packageSkillRoot,
  watch: false,
}
```

The package MAY express this by mounting the existing filesystem plugin as an effect-owned child. It MUST NOT copy its parser or watcher implementation. Child mounting and disposal MUST follow Cordis lifecycle ownership so unloading `deepseek-dovetail` withdraws the provider and leaves no watcher, timer, or resource behind.

`watch: false` is a package invariant, not a tunable: installed package files are immutable for the process lifetime. Development changes become visible after rebuild/reinstall or process restart.

### 6.2 Ownership table

| Concern | Owner |
|---|---|
| Skill registry, precedence, snapshots, lookup, and invalidation | DSH `ctx.skills` |
| YAML parsing and package-root discovery | DSH filesystem skill provider |
| Catalog, model-facing `skill` tool, `/name` injection | DSH `dsh-tool-skill` |
| Skill text and package resources | `deepseek-dovetail` |
| Agent loop, model selection, tools, logging, policy, sessions | DSH |
| Cold and inherited child semantics | DSH subagent providers |
| Treatment/baseline orchestration for Dovetail skill evaluation | Dovetail's ported evaluation runner over the DSH CLI |
| Upstream provenance and license truth | Pinned Dovetail source plus this package's notices |

### 6.3 Precedence and collisions

The provider MUST enter candidates as the standard DSH bundled source/rank. DSH's normal lower-rank priority therefore allows project, custom, and user skills with the same name to override the packaged Dovetail copy. The package MUST NOT invent a second namespace or bypass DSH duplicate resolution.

The provider name `dovetail` and bundle row id `deepseek-dovetail` are fixed identities. A real provider-id or bundle-row collision MUST fail clearly rather than silently registering an alias.

## 7. Repository and package layout

The repository MUST begin as one ESM npm package with this logical layout:

```text
.
├── src/
│   └── index.ts
├── vendor/
│   └── dovetail/
│       └── skills/                 # pinned, unmodified selected upstream files
├── ports/
│   └── dsh/
│       └── skills/                 # replacement/additive files over vendor source
├── dist/
│   └── skills/                     # generated runtime tree; packed, not hand-edited
├── scripts/
│   ├── materialize-skills.mjs
│   ├── sync-upstream.mjs
│   ├── verify-port.mjs
│   └── verify-resource-closure.mjs
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── snapshots/
│   └── fixtures/
├── upstream.lock.json
├── cordis.patch.yml
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── COMPATIBILITY.md
├── THIRD_PARTY_NOTICES.md
├── SPEC.md
└── IMPLEMENTATION_PROMPT.md
```

Equivalent build-tool filenames MAY be used, but the separation between exact upstream material, DSH-authored overlays, and generated runtime output MUST remain explicit.

The package name MUST be `deepseek-dovetail`, initial version `0.1.0`, `type: module`, and `private: true`. The npm package remains private until the release decisions in section 19 are resolved; GitHub repository visibility is independent and is now public.

## 8. Upstream synchronization and materialization

### 8.1 Lock record

`upstream.lock.json` MUST record at least:

- upstream repository URL;
- full commit SHA;
- commit date and subject;
- each vendored path included in the port;
- SHA-256 for every vendored file;
- each intentionally excluded upstream directory class; and
- the materializer format version.

### 8.2 Vendored source

`vendor/dovetail` MUST contain byte-identical selected files from the pinned commit. Vendored files MUST never be edited. DSH changes belong under `ports/dsh`.

The selected source MUST include every runtime file reachable by a packaged `SKILL.md`, all per-skill license files, `better-skill-creator/NOTICE`, and provenance material needed to attribute imported work. It SHOULD exclude upstream `.git` data, CI files, test suites, scratch fixtures, historical iteration output, captured model streams, and generated evaluation results unless a packaged runtime script demonstrably requires them.

### 8.3 DSH overlays

An overlay path replaces the same relative vendored path or adds a new runtime file. Deletion MUST be represented by an explicit reviewed manifest rather than by silently omitting a file during copy. Every materially rewritten `SKILL.md` MUST retain an adjacent license file covering the resulting work and MUST be named in `THIRD_PARTY_NOTICES.md` as adapted.

### 8.4 Deterministic build

`materialize-skills.mjs` MUST:

1. validate the lock and vendored hashes;
2. create a clean `dist/skills` tree;
3. copy the allowlisted vendored runtime files;
4. apply the DSH overlays and explicit deletions;
5. validate skill names, frontmatter, policies, description lengths, and body presence;
6. validate relative resource closure and path containment;
7. validate required license/notice files; and
8. emit deterministic content without network access.

The generated tree MUST never be the editing source. A repository gate MUST fail when regenerating from the pinned source and overlays would change the checked or packed result unexpectedly.

## 9. Package and profile integration

### 9.1 Package metadata

The package MUST expose its Host plugin and bundle patch:

```json
{
  "name": "deepseek-dovetail",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./lib/index.js",
  "types": "./lib/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/types/index.d.ts",
      "default": "./lib/index.js"
    },
    "./cordis.patch.yml": "./cordis.patch.yml",
    "./package.json": "./package.json"
  },
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

The final manifest MUST include the built Host module, types, patch, `dist/skills`, README, compatibility record, license material, and third-party notice in `files`. It MUST use exact target-compatible DSH/Cordis peer or direct dependencies according to their actual import ownership. It MUST contain no local `file:`, `link:`, absolute-path, workspace, or floating Git dependency in the packed artifact.

Compatibility evidence from the clean pinned profile establishes one additional packaging constraint: the profile workspace sets pnpm `autoInstallPeers: false`, and external packages cannot resolve runtime imports from DSH's separate in-box bundle anchor. `deepseek-dovetail` therefore MUST declare the exact `0.1.0-rc.7` public runtime and peer closure of `@deepseek-ai/dsh-skill-filesystem` as direct dependencies, plus `@deepseek-ai/cordis@4.0.1`. A peer-only draft is non-conforming: it installed successfully but failed at import time on `@deepseek-ai/dsh-home-paths`. The exact closure and failure evidence belong in `COMPATIBILITY.md`; the bundle MUST NOT work around this boundary with internal source imports or profile edits.

### 9.2 Bundle patch

The package-owned patch MUST insert exactly one complete row:

```yaml
- insert:
    - id: deepseek-dovetail
      name: deepseek-dovetail
```

The implementation MUST verify the exact external bundle syntax against the pinned DSH loader. No browser client metadata is needed.

### 9.3 Supported compositions

Load compatibility requires `ctx.skills`. Model invocation additionally requires the existing `dsh-tool-skill` consumer in the viewing agent's effective composition. Orchestration skills additionally require a cold in-process `spawn` subagent provider and the normal `subagent` tool for full behavior.

The shipped DSH `base`/`web` and `headless` compositions at the pinned release are the required acceptance targets. In a custom composition missing an optional surface, a skill MUST report the missing DSH capability and stop that path; it MUST NOT substitute `subagent_fork` for a clean child or pretend an unavailable evaluation ran.

## 10. Skill catalog and resource contracts

### 10.1 Required catalog

| Skill | Model invocable | User invocable | Maximum description length |
|---|---:|---:|---:|
| `better-skill-creator` | yes | yes | 480 |
| `hypershot-protocol` | yes | yes | 480 |
| `judge-composition` | yes | yes | 480 |
| `prompt-engineering` | yes | yes | 480 |
| `self-play` | yes | yes | 480 |
| `spark-steering` | no | yes | 480 |
| `subagent-composition` | yes | yes | 480 |
| `upsum` | no | yes | 480 |

The descriptions MUST include both function and trigger conditions. Trigger-critical text MUST NOT be deferred to a body section because the body is unavailable before selection. The `480`-character project ceiling reserves space below DSH's default `500`-character catalog cap and is measured after YAML parsing and newline normalization.

`spark-steering` and `upsum` MUST use `disable-model-invocation: true`. Every omitted `user-invocable` value defaults to true. Unsupported camel-case policy keys are forbidden.

### 10.2 Explicit invocation

User-facing DSH examples MUST use `/skill-name`, including `/spark-steering` and `/upsum`. Codex `$skill-name` and Claude plugin-command forms MAY appear only in clearly labeled upstream/provenance comparisons, never as the DSH execution path.

When a skill instructs the model to load a companion, it MUST name DSH's lowercase `skill` tool and the exact kebab-case name. It MUST avoid double loading when DSH has already injected a user-explicit `<skill_content>` block.

### 10.3 Resources

Every relative resource reference MUST resolve against the base directory reported by DSH's `<skill_resources>` block. Operational instructions MUST NOT hardcode an installation path such as `~/.claude/skills`, `~/.agents/skills`, the development checkout, or a Windows user directory.

Scripts MUST accept an explicit target workspace and MUST distinguish their own package-relative location from the target repository. They MUST use cross-platform path APIs. A script that cannot measure a condition MUST report it as unmeasured rather than clean.

`SKILL.md` bodies SHOULD remain below `500` lines and contain only the essential workflow and resource routing. Large evidence, schemas, and examples belong in directly referenced files. Reference files longer than `100` lines SHOULD include a concise contents section.

## 11. Per-skill compatibility requirements

### 11.1 `prompt-engineering`

- Preserve structural clarity, semantic tags, hierarchy, placeholders, attention management, and iteration guidance.
- Replace host-specific companion-loading text with DSH `skill` behavior.
- Keep the description below the project ceiling without dropping the principal prompt/template/system-instruction/output-schema triggers.
- Preserve Matthew Murphy/Lexideck attribution and the applicable CC BY license.

### 11.2 `hypershot-protocol`

- Preserve contamination-free structural examples and variable-loading levels.
- Keep the relationship to `prompt-engineering` explicit.
- Remove no distinction necessary to tell hypershots from semantic few-shot examples.
- Preserve attribution and license material.

### 11.3 `spark-steering`

- Remain explicit-only.
- Preserve the Skills, Personalities, Approaches, Resources, and Knowledge axis diagnosis.
- Translate host examples such as plugin, permission, instruction, and subagent changes into DSH vocabulary without implying every missing axis is solved by installation.
- Preserve the un-tool rule: when a held expectation would contaminate a prompt, end the tool action and ask the collaborator instead.

### 11.4 `subagent-composition`

This skill requires a DSH-native rewrite rather than terminology substitution.

It MUST explain and enforce:

- `subagent`/spawn is a cold child appropriate for independent work and blindness;
- `subagent_fork` inherits completed parent history and is inappropriate when the hidden variable or parent conclusion must stay hidden;
- multiple foreground calls emitted in one assistant message can overlap, while `run_in_background: false` returns each final output directly;
- continuable background children have a durable id and use DSH follow-up/report/settlement surfaces;
- the prompt must carry the complete task-local ground required by a cold child, but not the parent's expected answer;
- per-call fields are limited by the visible DSH tool schema;
- model, persona, tool filter, provider, and maximum-depth variants that are fixed by a configured tool instance MUST NOT be advertised as arbitrary call arguments; and
- persistent specialization maps to DSH agent presets and profile/plugin composition, not `.claude/agents/*.md`.

The skill MUST contain a delegation gate that recommends no child when the work is atomic, context transfer costs more than it saves, or independence buys no evidence or concurrency.

### 11.5 `judge-composition`

- Preserve the differently blinded grounding, coherence, corroboration, and audit responsibilities.
- Load prompt companions before authoring judge prompts.
- Use cold spawned children for blinded seats.
- Launch independent non-audit seats together where their inputs are ready.
- Run the audit seat only after the other prompts, artifacts, disclosures, and verdicts exist.
- Keep authorship, expectations, and desired verdicts out of blinded inputs unless a role's explicit jurisdiction requires them.
- Preserve abstention, jurisdiction, evidence-addressing, and audit-not-gate principles.

### 11.6 `self-play`

- Require cold spawn for blind roles and explicitly forbid forked parent history for clean-room evidence.
- Apply the delegation gate before paying for a ceremony.
- Launch independent players together with `run_in_background: false` when their results are required by the next step.
- Record an input-visibility matrix for each role.
- Never pass the builder's held expectation, desired score, or suspected failure to a blind evaluator or judge.
- Stop and disclose when the available DSH composition cannot provide the required isolation.
- Preserve honest measurement language: a run that loaded is not proof that it helped.

### 11.7 `upsum`

- Remain explicit-only and document `/upsum`.
- Preserve `.upsum/RECORD.md` as append-only, `.upsum/SUMMARY.md` as fixed-budget descending resolution, and root `TODO.md` as the rewritten open-work projection.
- Resolve `scripts/checks.py` from DSH's reported skill base directory; remove the Claude-home fallback.
- Take the target repository as an explicit argument.
- Preserve the difference between findings and measurement failures, including exit-code semantics.
- Parse DSH frontmatter with the package's pinned Node `yaml` dependency through a package-relative helper; PyYAML and Python site packages MUST NOT be runtime prerequisites for `upsum`.
- Never create a close record when repository work did not change.

### 11.8 `better-skill-creator`

- Preserve the author-test-measure-improve workflow and the requirement to load `prompt-engineering` and `hypershot-protocol` before authoring prompt bytes.
- Replace Claude frontmatter, discovery, compaction-prefix, packaging, and installation facts with DSH facts verified against the pinned host.
- Keep DSH trigger information in descriptions and validate the `480`-character project ceiling.
- Validate scripts by execution, not inspection alone.
- Preserve paired treatment/baseline evaluation, blind grading, unmeasured-state reporting, and evidence artifacts.
- Replace nested `claude -p` with the DSH runner in section 12.
- Exclude upstream historical test/evaluation output from the runtime package unless a current script consumes it.

## 12. DSH skill-evaluation runner

The automated portion of `better-skill-creator` needs a real DSH analogue to upstream nested Claude CLI runs. The port MUST introduce a runner abstraction in the retained evaluation scripts and a `dsh` runner implementation. It MUST NOT add a second model-facing tool or agent loop merely for evaluation.

### 12.1 Treatment and baseline

For one evaluation case:

1. Create independent disposable workspaces or reset from the same immutable fixture.
2. Start independent DSH headless sessions with identical model/provider selection, task bytes, ordinary tool composition, limits, and environment allowlist.
3. The treatment user prompt begins with the exact explicit gesture `/<target-skill>` so DSH injects that skill deterministically.
4. The baseline uses a DSH patch that removes or hides the exact `skill` tool consumer from that agent. DSH then publishes neither the catalog nor skill bodies to the baseline.
5. Do not tell the baseline that it is a baseline or that a skill exists.
6. Capture final output, stop reason, duration, and available usage without exposing credentials.
7. Randomize treatment/control presentation before grading and withhold arm identity from graders until their verdicts are final.

Each arm MUST also pin DSH to `workspace-write`, use its disposable workspace as the filesystem/session cwd, and redirect the ordinary filesystem skill provider's project-independent roots to empty arm-local directories with watching disabled. On Windows, the runner MUST accept an explicit caller-owned workspace scratch root with inherited ACLs compatible with DSH's restricted token; the pinned host's passing real-ACL suite uses a home-directory scratch root, while a user-private `%TEMP%` MAY deny confined reads. Session/control state remains in a separate system-temp tree. This removes inherited local skill state but is not an adversarial read-secrecy boundary: profiles containing RLM/IPython MUST be excluded unless the complete DSH process is placed inside an OS sandbox, VM, or container with bounded mounts.

The implementation MUST verify through a keyless snapshot that hiding the exact `skill` tool also suppresses DSH's catalog. Prompting a baseline model to “ignore skills” is not an acceptable control.

### 12.2 Runner configuration

The runner MAY use the installed `dsh` executable or a configured executable path. Profile, model, provider, timeout, repetitions, artifact root, and patch paths MUST be explicit validated inputs. No credential may be copied into an artifact or command line. Environment inheritance MUST follow an allowlist or the DSH subprocess conventions verified during implementation.

The runner MUST fail loud when:

- `dsh` is missing or incompatible;
- the target skill is absent;
- the treatment did not receive the skill body;
- the baseline received a skill catalog or body;
- either arm did not settle;
- the grader saw arm identity before verdict; or
- usage, timing, or another claimed measure was unavailable.

A missing measure may be reported as `UNMEASURED` when the run itself remains usable, but it MUST never be converted to zero or clean.

### 12.3 CI and live evaluation

CI MUST cover runner planning, command construction, fixture isolation, artifact schemas, redaction, and treatment/baseline catalog differences without a real provider. Real-model runs MUST be opt-in, self-skip without configured credentials, declare expected spend/repetition bounds, and store only sanitized artifacts.

## 13. Security, trust, and privacy

Dovetail skills are trusted local prompt content, and some include executable scripts. Installation therefore grants the model instructions and makes scripts available to ordinary DSH tools; it does not execute them at load.

The package MUST:

- perform no runtime network fetch or update check;
- validate generated paths remain inside the vendor, overlay, generated, or selected workspace roots;
- reject symlink or traversal escapes during materialization and packaging;
- avoid reading or writing user skill homes;
- never log or store model-provider credentials in evaluation artifacts;
- bound child counts, repetitions, subprocess duration, captured output, and artifact sizes;
- preserve DSH sandbox, approval, tool logging, session logging, and subprocess behavior;
- treat external URLs and large references as information to load only when needed; and
- report that blind-agent evidence depends on using a cold provider and uncontaminated artifacts.

No script may silently widen authority, disable TLS verification, edit an installed upstream cache, or publish results externally.

## 14. Licensing and provenance

The upstream repository root is CC BY 4.0 for the prose and scripts it covers, while individual skill directories carry their own license files. At the pinned commit, `better-skill-creator` is Apache-2.0 and includes `NOTICE`; the other packaged skills carry their adjacent license terms and attributions. The implementation MUST treat the adjacent skill license as authoritative and MUST not flatten them into one guessed package license.

The package MUST include:

- every packaged skill's adjacent license file;
- `better-skill-creator/NOTICE`;
- Dovetail provenance sufficient to identify the source repository, commit, and original paths;
- attribution for Matthew Murphy/Lexideck where inherited;
- SPARK/arXiv provenance where inherited; and
- `THIRD_PARTY_NOTICES.md` listing verbatim and adapted files.

Until the owner selects a license for new adapter/build code, the npm package MUST remain private and use an explicit `SEE LICENSE IN ...` posture that does not relicense upstream material. The GitHub repository may be public, but that visibility does not imply a license grant or authorize npm publication.

## 15. Testing and evidence plan

### 15.1 Static and unit tests

Tests MUST cover:

- upstream lock and SHA-256 verification;
- deterministic overlay materialization and explicit deletions;
- all eight names and exact invocation policies;
- description normalization and the `480`-character ceiling;
- DSH frontmatter parsing through the real target provider;
- resource-link existence, containment, and Windows/POSIX separators;
- required licenses/notices;
- prohibited operational Claude/Codex path and tool references with a narrow provenance allowlist;
- plugin path resolution from built `lib/index.js`;
- provider registration, duplicate provider failure, and disposal;
- no watchers and no writes to user/project skill roots;
- runner configuration, redaction, bounds, abort, and failure states; and
- treatment/baseline artifact and blindness schemas.

### 15.2 Keyless DSH snapshots

Using DSH's actual keyless snapshot/replay infrastructure, prove:

1. The initial model catalog contains the six model-invocable Dovetail skills.
2. `spark-steering` and `upsum` are absent from that catalog.
3. `/upsum` injects one canonical `<skill_content>` block and does not invoke the model-facing `skill` tool again.
4. A successful load reports the installed package directory as the resource base.
5. Catalog descriptions are not truncated.
6. Removing or hiding the exact `skill` tool suppresses the catalog for a clean baseline.
7. A DSH-native `self-play` example selects cold `subagent`, never `subagent_fork`, for blind roles.
8. An `upsum` example resolves `checks.py` without a Claude/user-home path.

### 15.3 Package tests

The repository MUST pass:

```sh
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run verify
pnpm pack --dry-run
```

Inspect the tarball file list, install the tarball in a clean consumer, import the Host plugin through its public export, and prove the package contains every generated runtime resource and no excluded test/history corpus.

### 15.4 Assembled profile tests

Against a separate clean, unmodified checkout of the pinned DSH release:

1. Build and pack `deepseek-dovetail`.
2. Install the tarball with `dsh plugin --profile web add <tarball>`.
3. Verify `dsh --profile web --dump-config` contains exactly one package row.
4. Boot the web profile with a keyless/replay model path.
5. Verify all eight human-visible skills and the six-skill model catalog.
6. Repeat a headless load and explicit-invocation smoke.
7. Remove the plugin through the actual DSH CLI.
8. Verify the provider, catalog entries, and bundle layer disappear.
9. Verify the DSH checkout remains clean.

### 15.5 Behavioral forward tests

Before stable release, use fresh sessions and raw task prompts to test at least:

- a prompt/template task that should load both prompt skills;
- a task where the delegation gate should refuse unnecessary delegation;
- a parallel cold-child task where delegation is useful;
- a self-authored claim judged by blinded seats;
- a rubric or router examined through self-play;
- a skill-authoring task with a clean paired treatment/baseline evaluation; and
- `/upsum` over a disposable repository containing both changed and unchanged-session cases.

Forward-test prompts MUST not reveal the intended answer, suspected bug, expected winner, or implementation diagnosis. Failed or contaminated runs MUST remain evidence and MUST not be silently discarded.

### 15.6 Platform claims

All implementation code and scripts MUST use cross-platform APIs. The initial local evidence is expected on Windows. macOS or Linux support MUST not be claimed until the assembled package and the relevant Python/CLI runner smoke pass there.

## 16. Documentation requirements

The implementation MUST create a root `README.md` and `COMPATIBILITY.md` covering:

- architecture and the no-DSH-core-change rule;
- exact supported DSH and Dovetail revisions;
- local checkout and packed-tarball installation;
- the eight skills and their invocation policy;
- `/spark-steering` and `/upsum` explicit invocation;
- cold `subagent` versus inherited `subagent_fork`;
- package-relative resource behavior;
- evaluation-runner prerequisites, isolation, cost, and unmeasured states;
- update/sync procedure for a new Dovetail commit;
- security/trust and executable-script warning;
- licensing/provenance; and
- removal instructions.

Documentation MUST describe current verified behavior rather than design-session history. Individual skill directories MUST not gain redundant README, changelog, installation-guide, or quick-reference files.

## 17. Implementation sequence

Implement in these milestones, keeping every milestone testable:

1. **Compatibility preflight**: inspect pins and public exports; record the DSH/Dovetail compatibility matrix and exact package dependencies.
2. **Repository scaffold**: ESM package, TypeScript/build/test/lint configuration, private manifest, bundle patch, and a mount-only Host plugin.
3. **Pinned source pipeline**: vendor the selected upstream runtime files, write the lock/sync/materialization/resource-closure gates, and prove deterministic output.
4. **Catalog vertical slice**: package all eight original skills, discover them through the real DSH provider, preserve policy, build/pack, and run a clean import smoke.
5. **Host-neutral port**: adapt `prompt-engineering`, `hypershot-protocol`, and `spark-steering`; add catalog and trigger snapshots.
6. **Orchestration port**: adapt `subagent-composition`, `judge-composition`, and `self-play`; add cold/fork and visibility-matrix fixtures.
7. **Lifecycle port**: adapt `upsum`, its script paths, and session-close fixtures.
8. **Evaluation port**: adapt `better-skill-creator`, introduce the DSH runner abstraction, prove clean treatment/baseline construction, and retain blind grading.
9. **Assembled proof**: install/remove in clean `web` and `headless` profiles, keyless snapshots, package inspection, documentation, and evidence record.
10. **Behavioral release gate**: bounded opt-in live evaluations, platform claim review, final notices, and owner decisions.

Do not stop after scaffolding while safe independent implementation work remains. Do not merge milestones by weakening their evidence requirements.

## 18. Definition of done

The first stable release is complete only when all of the following are true:

- one private-to-release npm package contains the Host plugin, bundle patch, generated skills, notices, and documentation;
- the package builds offline from pinned vendored source and reviewed overlays;
- all eight skills are load-, instruction-, behavior-, and distribution-compatible;
- all eight parse through the real DSH provider with the required policies;
- no catalog description is truncated;
- project/user skill precedence over the bundle is preserved;
- no operational skill path depends on Claude/Codex tools, hooks, homes, agents, or subprocess commands;
- cold-child blindness and fork unsuitability are explicit and behaviorally tested;
- `upsum` resolves its script from the package resource base;
- `better-skill-creator` runs paired DSH treatment/baseline evaluations without catalog contamination;
- static, keyless snapshot, package, assembled-profile, and bounded behavioral gates pass;
- install and remove leave the DSH checkout and user skill homes unchanged;
- the tarball contains every required runtime resource and license and excludes development residue;
- README, compatibility record, and third-party notice match the implementation; and
- unmet publication/platform/license decisions remain explicit rather than being guessed.

## 19. Open owner decisions before publication

Implementation may begin without these decisions, but npm publication and a stable public release remain blocked until the owner:

- selects a license for new adapter/build/test code without relicensing upstream skills;
- approves the repository and npm ownership/name;
- chooses private, unlisted, or public npm release visibility; GitHub repository visibility is already public;
- approves `THIRD_PARTY_NOTICES.md` and the vendored/adapted file list;
- decides which successfully tested operating systems may be claimed; and
- approves the cost and model/provider used for the final live behavioral evaluation.

## 20. Sources and evidence

### OpenCnid Dovetail at the pinned commit

- [Repository tree and README](https://github.com/OpenCnid/dovetail/tree/69f89e3322847fb11665980c16598494a9eacca0)
- [Skills source](https://github.com/OpenCnid/dovetail/tree/69f89e3322847fb11665980c16598494a9eacca0/skills)
- [Provenance record](https://github.com/OpenCnid/dovetail/blob/69f89e3322847fb11665980c16598494a9eacca0/docs/provenance.md)
- [Release-integrity notes](https://github.com/OpenCnid/dovetail/blob/69f89e3322847fb11665980c16598494a9eacca0/docs/release-integrity.md)
- [Root licensing explanation](https://github.com/OpenCnid/dovetail/blob/69f89e3322847fb11665980c16598494a9eacca0/LICENSE.md)

### DeepSeek Harness at the pinned release

- [Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/docs/architecture.md)
- [Skill subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/docs/subsystems/skills.md)
- [Filesystem skill provider](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/packages/skill/skill-filesystem/README.md)
- [Model-facing skill consumer](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/packages/skill/tool-skill/README.md)
- [Subagent subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/docs/subsystems/subagent.md)
- [Subagent tool](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/packages/subagent/tool-subagent/README.md)
- [Agent presets](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/packages/preset/agent-presets/README.md)
- [App boot and out-of-tree bundles](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/packages/boot/app-boot/README.md)
- [Developing and publishing external bundles](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/docs/user/develop/basic/publish.md)
- [CLI profile/plugin workflow](https://github.com/deepseek-ai/deepseek-harness/blob/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/apps/cli/README.md)
