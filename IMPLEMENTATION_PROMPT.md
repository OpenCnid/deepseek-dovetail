# Fresh-session implementation prompt

Copy the prompt below into a new Codex session whose workspace is this repository.

---

You are in the `deepseek-dovetail` repository. Implement [`SPEC.md`](SPEC.md) end to end as a standalone, out-of-tree compatibility bundle for DeepSeek Harness.

This repository begins with the normative specification and this handoff prompt, not a finished implementation. Read `SPEC.md` completely before editing anything. Inspect the workspace for `AGENTS.md` and other repository instructions, inspect Git status, preserve any user changes, and create a milestone plan tied directly to sections 17 and 18 of the specification. Implement working code and evidence—not another design proposal.

## Required outcome

Build one private-first npm package named `deepseek-dovetail` that:

- packages DSH-compatible ports of all eight OpenCnid Dovetail skills;
- mounts package-local generated skills through DSH's existing `ctx.skills` registry and `@deepseek-ai/dsh-skill-filesystem` provider;
- installs through its own `dsh.bundle` patch with one `deepseek-dovetail` Cordis row;
- preserves project and user skill precedence over the packaged bundled copies;
- keeps `spark-steering` and `upsum` user-only and the other six model-invocable;
- uses complete descriptions of at most 480 parsed characters;
- replaces unsupported Claude Code and Codex operational assumptions with verified DSH skill, subagent, preset, resource, and CLI behavior;
- vendors a deterministic, licensed runtime subset of the pinned Dovetail source and applies explicit DSH overlays;
- performs no runtime network fetch, update, user-home installation, or script execution at plugin load;
- requires no tracked change to DeepSeek Harness or upstream Dovetail; and
- supplies static, package, keyless snapshot, assembled-profile, and opt-in behavioral evidence.

Do not create a Codex `.codex-plugin/plugin.json`, personal marketplace entry, MCP server, app, browser card, or hook. This is a DSH bundle, not a Codex plugin.

## Pinned baselines

Use these exact baselines unless `SPEC.md` has been intentionally updated with evidence:

- DeepSeek Harness: `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` (`dsh-v0.1.0-rc.7`)
- Cordis: `4.0.1`
- OpenCnid Dovetail: `69f89e3322847fb11665980c16598494a9eacca0`
- Node.js: `^22.19.0 || >=24`
- pnpm: `11.x`

The existing checkout at `D:\deepseek-harness-custom-plugins-setup\dsh-99f6f02-patched` may contain unrelated uncommitted user work. Treat it as read-only source evidence only. Do not edit, reset, clean, build into, or use it as the clean assembled acceptance fixture. Clone or materialize a separate clean checkout of the pinned DSH commit for integration testing. Likewise inspect Dovetail at the exact pinned commit in a disposable/read-only location; do not build against a floating branch.

Read the applicable upstream `AGENTS.md` files and exact public package contracts before coding. Do not infer DSH APIs from names. Use public exports only and keep local `file:`, `link:`, workspace, absolute-path, and floating Git dependencies out of committed package metadata and the packed artifact.

## Architectural constraints

DeepSeek Harness remains the sole harness and owns the agent loop, skills registry, catalog, tools, policy, sessions, subagents, persistence, and UI. `deepseek-dovetail` owns only its package plugin, pinned skill material, DSH overlays, evaluation scripts, build gates, documentation, and evidence.

Implement the runtime path required by `SPEC.md`:

```text
DSH profile
  -> deepseek-dovetail bundle row
  -> deepseek-dovetail Cordis plugin
  -> dsh-skill-filesystem over package-local dist/skills
  -> ctx.skills bundled layer
  -> existing DSH skill consumers
```

Resolve the packaged skill root relative to built code with `import.meta.url` and `fileURLToPath`. Mount the existing filesystem provider as an effect-owned child with provider name `dovetail`, default roots disabled, the package root supplied as `bundledSkillDir`, and watching disabled. Do not reimplement DSH's YAML parser, precedence algorithm, watcher, catalog, `skill` tool, or explicit `/name` injection.

Keep the package `private: true`. Do not choose a license for new adapter/build code, publish npm, push, open a PR, or alter upstream license terms without explicit owner approval.

## Start with the compatibility preflight

Before scaffolding implementation code:

1. Inspect the pinned DSH skill registry, filesystem provider, model-facing skill consumer, subagent providers/tools, agent presets, app boot, bundle publishing guide, and CLI plugin workflow.
2. Verify the exact published DSH/Cordis package versions and public exports needed by an external package.
3. Inspect every pinned upstream Dovetail `SKILL.md`, its reachable runtime resources, scripts, per-skill license, `better-skill-creator/NOTICE`, provenance, and install/test scripts.
4. Record a compatibility matrix in `COMPATIBILITY.md`: upstream behavior, DSH equivalent, port action, evidence, and remaining limitation for every skill.
5. Record the exact direct and peer dependency plan before building on it.

If an essential DSH API is not public or cannot be used from a clean external package, do not patch the DSH fixture or depend on an internal `src/*` path. Document the exact missing export and smallest upstream requirement, continue every independent milestone, and report the blocked acceptance criterion.

## Implement by specification milestone

Follow `SPEC.md` section 17 in order while keeping each milestone runnable:

1. compatibility preflight;
2. repository and private package scaffold;
3. pinned source, lock, sync, materialization, deletion, and resource-closure pipeline;
4. eight-skill load-compatible vertical slice through the real DSH provider;
5. host-neutral skill ports;
6. DSH orchestration skill ports;
7. `upsum` lifecycle and resource-path port;
8. `better-skill-creator` and the DSH treatment/baseline runner;
9. clean packed-artifact and assembled `web`/`headless` proof; and
10. bounded behavioral release gates and documentation.

Do not stop after repository scaffolding or discovery if safe implementation work remains. Implement the smallest complete vertical behavior in each milestone, add its focused tests, run them, fix failures, and then advance.

## Upstream source and overlay rules

- Vendor only the runtime subset required by the packaged skills, byte-identical to the pinned Dovetail commit.
- Record repository, full commit, included paths, excluded classes, materializer format, and SHA-256 per vendored file in `upstream.lock.json`.
- Never edit files under `vendor/dovetail`; DSH changes belong under `ports/dsh`.
- Represent removals through an explicit reviewed deletion manifest.
- Generate `dist/skills` deterministically and without network access.
- Treat generated output as disposable build output, never the editing source.
- Exclude upstream tests, scratch fixtures, historical iteration output, captured streams, and generated evaluation results unless a retained runtime script proves it needs one.
- Preserve every packaged per-skill license, `better-skill-creator/NOTICE`, Lexideck/Matthew Murphy attribution, SPARK provenance, and adapted-file provenance.
- Reject symlink and path-traversal escapes and prove every relative skill resource resolves inside its packaged skill directory.

## Skill-port rules

Implement the detailed contracts in `SPEC.md` sections 10 and 11. In particular:

- Use DSH `/skill-name` for explicit human invocation and lowercase `skill` for companion loading.
- Prevent double loading when DSH already injected a `<skill_content>` block.
- Keep each parsed description at or below 480 characters while retaining function and trigger conditions.
- Keep `spark-steering` and `upsum` explicit-only with `disable-model-invocation: true`.
- Resolve scripts and references from DSH's reported package resource base; never hardcode `~/.claude`, `~/.agents`, a development checkout, or a user-specific path.
- Keep `SKILL.md` concise and route detailed evidence to directly linked references.
- Do not add redundant READMEs, changelogs, installation guides, or quick references inside skill directories.

For `subagent-composition`, `judge-composition`, and `self-play`, preserve actual blindness and lifecycle semantics:

- DSH `subagent`/spawn is the cold-child path.
- `subagent_fork` inherits completed parent history and must not be used when the parent's conclusion or hidden variable must stay blind.
- Independent foreground calls can be emitted together with `run_in_background: false` when the next step needs their returned outputs.
- Continuable background work uses DSH child ids, follow-up/report surfaces, and settlement behavior.
- Prompt fields must match the tool schema actually visible in the pinned host; do not advertise fixed deployment configuration as arbitrary call arguments.
- Persistent specialization maps to DSH agent presets/profile composition, not `.claude/agents`.
- If the effective composition lacks cold spawn or another required surface, disclose the limitation and stop that path instead of substituting a weaker mechanism.

For `upsum`, retain the append-only record, fixed-budget descending-resolution summary, open-work projection, measurement/finding distinction, and unchanged-session no-op. Port `checks.py` to an explicit package-resource path plus explicit target-workspace argument.

For `better-skill-creator`, replace Claude frontmatter/discovery/install facts and nested `claude -p`. Preserve the author-test-measure-improve workflow, paired treatment/baseline comparison, blinded grading, evidence artifacts, and `UNMEASURED` behavior.

## DSH treatment/baseline runner

Implement `SPEC.md` section 12 as a runner abstraction in the retained evaluation scripts, with a DSH runner rather than another model-facing tool or agent loop.

For each case:

- use independent clean workspaces/sessions with identical task bytes, model/provider, ordinary tools, limits, and allowed environment;
- treatment begins with `/<target-skill>` so DSH injects the skill deterministically;
- baseline uses a DSH overlay that hides/removes the exact `skill` tool consumer, thereby suppressing both catalog and body;
- never tell the baseline it is a baseline or that a skill exists;
- verify keylessly that the treatment received the target body and the baseline received neither catalog nor skill content;
- randomize output position before grading and keep arm identity hidden until verdict;
- capture sanitized output, stop reason, duration, and available usage;
- bound runs, subprocess duration, captured bytes, and artifact sizes; and
- fail loud or report `UNMEASURED` exactly as the specification requires.

Do not put credentials in command lines, artifacts, snapshots, logs, or test fixtures. Real-provider evaluation must be opt-in, cost-bounded, and self-skip when credentials are absent.

## Testing and evidence

Testing is part of implementation, not a follow-up. Build the static/unit, keyless DSH snapshot, package, assembled-profile, and behavioral coverage in `SPEC.md` section 15.

At minimum run and pass:

```sh
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run verify
pnpm pack --dry-run
```

Also:

- inspect the actual tarball file list;
- install the tarball into a clean consumer and import its public Host export;
- install it into clean pinned DSH `web` and `headless` profiles through the actual `dsh plugin --profile ... add` workflow;
- verify `--dump-config`, keyless boot, eight human-visible skills, six model-catalog skills, `/upsum`, package-relative resources, baseline catalog suppression, and removal;
- prove the clean DSH fixture remains unchanged; and
- ensure install/remove never writes into user or project skill homes.

Use fresh sessions and raw artifacts for forward tests. Do not tell a validating agent the intended answer, suspected defect, expected winner, or proposed fix. Retain failed and contaminated runs as evidence instead of silently discarding them.

If real-model credentials are unavailable, finish every keyless and assembled requirement that does not need them. Mark the exact stable-release behavioral gates as unrun; do not simulate or claim them.

## Working discipline

- Use `apply_patch` for manual file edits.
- Preserve unrelated user work.
- Keep registrations and child plugins effect-owned and disposal-safe.
- Validate config, filesystem, subprocess, generated, and durable boundaries; trust typed same-process values.
- Prefer maintained dependencies when they remove owned code and tests.
- Use cross-platform Node/Python path and subprocess APIs.
- Do not commit, push, publish, or open a PR unless the user explicitly asks.
- Keep `SPEC.md`, `README.md`, `COMPATIBILITY.md`, notices, and implementation synchronized.
- When implementation evidence requires a design correction, update `SPEC.md` in the same change and explain the concrete evidence; do not silently narrow a requirement.

## Handoff requirements

At completion, report:

- implementation status by specification milestone and skill;
- exact DSH and Dovetail revisions and all vendored/adapted paths;
- package architecture and dependency versions;
- every command actually run and its result;
- packed-artifact contents and clean-consumer result;
- assembled `web`/`headless` install, config, boot, invocation, and removal evidence;
- behavioral evaluations run, including contamination or unmeasured results;
- security, trust, platform, and licensing limitations;
- every unmet acceptance criterion with exact evidence and the next required change; and
- paths to the tarball, compatibility record, notices, snapshots, and primary tests.

Begin now by reading `SPEC.md` and repository instructions completely, then perform the compatibility preflight and proceed through the implementation milestones as far as the environment safely permits.

---

