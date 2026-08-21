# Repository guide for agents

## Purpose

This repository is an out-of-tree DeepSeek Harness bundle that ports eight OpenCnid Dovetail skills. DeepSeek Harness must remain the sole runtime and orchestrator. The package contributes one Cordis bundle row and mounts package-owned skill resources through `@deepseek-ai/dsh-skill-filesystem`.

## Start here

1. Read `README.md` for the human-facing contract.
2. Read `COMPATIBILITY.md` before changing host integration or a skill port.
3. Read `THIRD_PARTY_NOTICES.md` before touching vendored or adapted upstream material.
4. Use Node.js `^22.19.0 || >=24` and pnpm `11.x`.
5. Inspect `git status --short` before and after work. Preserve unrelated changes.

## Repository map

- `src/index.ts` — the small Cordis Host plugin. Keep it mount-only.
- `cordis.patch.yml` — the single `deepseek-dovetail` bundle row.
- `ports/dsh/skills/` — editable DSH adaptations and package-owned resources.
- `vendor/dovetail/` — pinned upstream bytes. Never edit these files by hand.
- `dist/skills/` — deterministic generated output. Edit `ports/dsh`, then materialize.
- `scripts/` — sync, materialization, verification, and package checks.
- `tests/` — static and real-provider integration coverage.
- `evidence/` — retained acceptance snapshots and bounded behavioral results.
- `docs/assets/` — README artwork and verified UI captures.

## Invariants

- Do not add a second agent loop, registry, provider stack, or DSH source import.
- Keep exactly one bundle row and one effect-owned filesystem-provider child.
- Keep `providerName: 'dovetail'`, `includeDefaultRoots: false`, and `watch: false` unless the host contract changes and new evidence justifies the change.
- Package load must not fetch, update, execute retained skill scripts, watch files, or write into project/user skill homes.
- Resolve package resources from installed code with `import.meta.url`/`fileURLToPath`; never depend on a development checkout or user home.
- All eight skills remain user-invocable through `/name`. Keep `spark-steering` and `upsum` explicit-only unless an intentional policy change is documented and tested.
- Cold-child blindness requires DSH `subagent`; `subagent_fork` inherits parent history and is not a substitute.
- Preserve the package's exact public runtime closure. Pinned DSH profiles disable automatic peer installation.
- Keep `package.json` set to `private: true` unless the owner separately authorizes npm publication and resolves licensing. The GitHub repository being public does not change package-publication or license status.

## Editing skills

Treat each `ports/dsh/skills/<name>/SKILL.md` as model-facing instruction:

- Keep frontmatter valid, descriptions trigger-focused, and bodies compact.
- Put directly linked detail in `references/` and executable helpers in `scripts/`.
- Use DSH names for tools, providers, presets, profiles, permissions, and skill invocation.
- When a body is already injected through `/name`, do not tell it to reload itself through the lowercase `skill` tool.
- Preserve adjacent upstream licenses, notices, attribution, and SPARK provenance.
- Run materialization after changes; do not patch `dist/skills` directly.

To refresh upstream material, use only an exact detached, clean checkout of the commit recorded in `upstream.lock.json`:

```sh
corepack pnpm run sync:upstream -- --source {ABSOLUTE_PINNED_DOVETAIL_CHECKOUT}
```

The sync is expected to fail on a wrong commit, dirty tree, symlink, path escape, unclassified file, or hash mismatch. Do not weaken those checks to make a refresh pass.

## Validation

Install once with:

```sh
corepack pnpm install --frozen-lockfile
```

For code, port, dependency, or resource changes, run the complete gate:

```sh
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run test
corepack pnpm run build
corepack pnpm run verify
corepack pnpm pack --dry-run
```

For documentation-only changes, inspect Markdown rendering and links, then run at least `corepack pnpm run verify:package`. Run the full gate when documentation changes commands, paths, packaged files, policy, or runtime claims.

When changing installation behavior, also build the artifact, install it into a disposable DSH profile with the real `dsh plugin --profile <name> add <absolute-tarball>` workflow, inspect `--dump-config`, verify the slash catalog, and remove it again. Do not install test skills into user or project skill homes.

## README rules

Keep `README.md` lean and human-first:

- lead with the value and supported host versions;
- keep one copy-pasteable source-build/install path;
- describe every skill in one short table row;
- link detailed compatibility, evidence, provenance, and limitations instead of duplicating them;
- keep public-repository status distinct from npm publication and license status;
- update the hero, screenshot, version badges, and captions when their claims change;
- use screenshots from a real assembled DSH profile, with no secrets or fabricated UI.

## Evidence and claims

- Do not upgrade `UNMEASURED`, partial, or bounded evidence into a passing or universal claim.
- Retain sanitized failure artifacts needed to explain a gate result.
- Never place credentials in commands, logs, evidence, screenshots, or committed configuration.
- A clean evaluation arm is not an adversarial secrecy sandbox. Exclude RLM/IPython or use an outer OS sandbox/container when hostile readable host data is in scope.

## Scope discipline

Prefer the smallest change that preserves these contracts. Do not modify pinned DeepSeek Harness or Dovetail checkouts from this repository. Do not publish to npm, select a license, change upstream license text, or alter repository visibility without explicit owner authorization.
