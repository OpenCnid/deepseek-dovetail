<p align="center">
  <a href="https://github.com/OpenCnid/deepseek-dovetail">
    <img src="docs/assets/deepseek-dovetail.svg" alt="DeepSeek Dovetail — eight agent skills in one Cordis bundle for DeepSeek Harness" width="100%" />
  </a>
</p>

<p align="center">
  <img alt="DeepSeek Harness v0.1.0-rc.7" src="https://img.shields.io/badge/DeepSeek_Harness-v0.1.0--rc.7-4968ff?style=flat-square" />
  <img alt="Cordis 4.0.1" src="https://img.shields.io/badge/Cordis-4.0.1-31c48d?style=flat-square" />
  <img alt="Eight skills" src="https://img.shields.io/badge/agent_skills-8-f0a34a?style=flat-square" />
  <img alt="Public source" src="https://img.shields.io/badge/source-public-8b5cf6?style=flat-square" />
</p>

`deepseek-dovetail` brings eight [OpenCnid Dovetail](https://github.com/OpenCnid/dovetail) workflows to [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) as one out-of-tree Cordis bundle. DSH remains the sole agent runtime; this package mounts an immutable, package-local skill tree through DSH's published filesystem provider.

## Why use it?

- **One install, eight workflows:** prompting, skill authoring, delegation, evaluation, self-play, agent steering, and session handoff.
- **Small runtime seam:** one Cordis row and one effect-owned filesystem provider—no replacement agent loop or skill registry.
- **Quiet on load:** no network access, update check, script execution, watcher, or writes to project/user skill homes.
- **Reproducible:** upstream content is commit-pinned and hash-locked; package, integration, UI, and bounded behavioral evidence live in the repository.

## Quick start

Requirements: DeepSeek Harness `v0.1.0-rc.7`, Node.js `^22.19.0 || >=24`, and pnpm `11.x`.

```sh
git clone https://github.com/OpenCnid/deepseek-dovetail.git
cd deepseek-dovetail
corepack pnpm install --frozen-lockfile
corepack pnpm run build
corepack pnpm run verify
corepack pnpm run pack:artifact
```

Install the generated tarball into any DSH profile:

```sh
dsh plugin --profile web add {ABSOLUTE_PATH}/artifacts/deepseek-dovetail-0.1.0.tgz
dsh --profile web --dump-config
```

Replace `web` with another profile name as needed. Remove the bundle with:

```sh
dsh plugin --profile web remove deepseek-dovetail
```

In a DSH session, type `/` to browse skills or invoke one directly, for example `/prompt-engineering`. Six skills are model-discoverable; `spark-steering` and `upsum` are intentionally user-only.

## Included skills

| Skill | What it does | Invocation |
|---|---|---|
| `prompt-engineering` | Designs precise prompts and instruction schemas with explicit structure and clean ground. | Model + `/prompt-engineering` |
| `hypershot-protocol` | Creates structural examples that teach form without leaking task content. | Model + `/hypershot-protocol` |
| `better-skill-creator` | Authors, validates, packages, and compares DSH skills against clean baselines. | Model + `/better-skill-creator` |
| `subagent-composition` | Chooses when and how to delegate across cold, forked, foreground, or background agents. | Model + `/subagent-composition` |
| `judge-composition` | Builds differently blinded grounding, coherence, corroboration, and audit panels. | Model + `/judge-composition` |
| `self-play` | Tests unsolved designs with controlled gatherer, adversary, evaluator, and judge roles. | Model + `/self-play` |
| `spark-steering` | Diagnoses the short SPARK axis before changing an agent or its environment. | `/spark-steering` only |
| `upsum` | Closes changed sessions with a durable record, summary, open-work projection, and checks. | `/upsum` only |

## Skill discovery in DSH

![The spark-steering skill displayed as a user-only entry in the real DeepSeek Harness slash catalog](docs/assets/dsh-spark-steering.png)

The screenshot comes from the pinned DSH web profile used for assembled acceptance. The repository also retains a machine-readable [UI snapshot](evidence/assembled/web-ui.snapshot.json) covering all eight entries.

## Architecture

```text
DSH profile
  -> deepseek-dovetail bundle row
  -> deepseek-dovetail Cordis plugin
  -> @deepseek-ai/dsh-skill-filesystem
  -> package-local dist/skills
  -> existing DSH catalog, agents, tools, sessions, and UI
```

The provider is named `dovetail`, excludes default roots, disables watching, and resolves its bundled directory from installed code. Project and user skill roots keep their normal precedence.

## Work on the bundle

Edit DSH adaptations in `ports/dsh/`; never hand-edit pinned `vendor/dovetail` files or generated `dist/skills` output. See [AGENTS.md](AGENTS.md) for repository rules and the complete validation workflow.

```sh
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run test
corepack pnpm run build
corepack pnpm run verify
corepack pnpm pack --dry-run
```

To refresh the pinned upstream subset from an exact, clean checkout:

```sh
corepack pnpm run sync:upstream -- --source {ABSOLUTE_PINNED_DOVETAIL_CHECKOUT}
```

The sync fails closed on a wrong commit, dirty source, symlink, path escape, unclassified runtime file, or manifest/hash mismatch.

## Evidence and deeper documentation

- [COMPATIBILITY.md](COMPATIBILITY.md) — pinned host contracts and the skill-by-skill port matrix.
- [evidence/REPORT.md](evidence/REPORT.md) — package, profile, UI, removal, and behavioral acceptance ledger.
- [evidence/behavioral/LIVE_REPORT.md](evidence/behavioral/LIVE_REPORT.md) — bounded real-provider comparisons and known gaps.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — provenance, retained licenses, notices, and code-license status.

## Public-source status and limitations

This GitHub repository is public. The npm manifest deliberately remains `private: true`, no npm package has been published, and no owner-selected public license currently covers the new adapter/build/test code. Public visibility does not imply a license grant; review [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before reuse or redistribution.

Initial assembled acceptance is Windows-only. The changed/unchanged live `upsum` lifecycle remains `UNMEASURED` on the pinned Windows restricted-subprocess path, and the recorded behavioral comparisons are bounded evidence—not universal effectiveness claims.
