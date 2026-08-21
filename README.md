# deepseek-dovetail

`deepseek-dovetail` is a private, out-of-tree DeepSeek Harness bundle containing DSH-compatible ports of all eight OpenCnid Dovetail skills. DeepSeek Harness remains the sole agent runtime. This package contributes one Cordis row and mounts its immutable `dist/skills` directory through the published DSH filesystem skill provider.

The package is pinned to:

- DeepSeek Harness `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` (`dsh-v0.1.0-rc.7`)
- Cordis `4.0.1`
- OpenCnid Dovetail `69f89e3322847fb11665980c16598494a9eacca0`
- Node.js `^22.19.0 || >=24`
- pnpm `11.x`

It is `private: true`. Do not publish it until the owner chooses terms for the new adapter/build/test code and approves the licensing and provenance record.

## Runtime architecture

```text
DSH profile
  -> deepseek-dovetail bundle patch (one row)
  -> deepseek-dovetail Cordis plugin
  -> @deepseek-ai/dsh-skill-filesystem over package-local dist/skills
  -> ctx.skills bundled layer
  -> existing DSH catalog, explicit invocation, tools, agents, sessions, and UI
```

The child provider is named `dovetail`, disables default roots and watching, and supplies only the package-local bundled root resolved from built code with `import.meta.url`/`fileURLToPath`. DSH's project and user roots keep their lower precedence ranks. Package load performs no network access, update, script execution, user-home installation, or project/user skill write.

Pinned DSH profiles set pnpm `autoInstallPeers: false`, so the package declares the filesystem provider's exact public `0.1.0-rc.7` runtime/peer closure directly, together with Cordis `4.0.1`. It does not import DSH source paths or rely on dependencies from an in-tree bundle anchor; see the preflight failure and corrected plan in `COMPATIBILITY.md`.

## Build and verification

From a clean source tree with the pinned runtime:

```text
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run verify
pnpm pack --dry-run
pnpm run pack:artifact
```

`vendor/dovetail` is not edited. To refresh it from an exact detached, clean checkout of the pinned source:

```text
pnpm run sync:upstream -- --source {Absolute_Pinned_Dovetail_Checkout}
```

The sync fails on a wrong commit, dirty source, symlink, path escape, unclassified runtime file, or mismatch between the explicit source/deletion manifests. `upstream.lock.json` records every retained hash and every reviewed deletion hash. `dist/skills` is deterministic disposable output; edit `ports/dsh`, then materialize again.

## Private profile installation

Build and inspect the tarball, then use the real DSH bundle workflow:

```text
dsh plugin --profile web add {Absolute_Path_To_deepseek-dovetail-0.1.0.tgz}
dsh plugin --profile headless add {Absolute_Path_To_deepseek-dovetail-0.1.0.tgz}
dsh --profile web --dump-config
dsh --profile headless --dump-config
```

Remove it with:

```text
dsh plugin --profile web remove deepseek-dovetail
dsh plugin --profile headless remove deepseek-dovetail
```

All eight skills remain human-invocable through DSH `/name`. `spark-steering` and `upsum` are explicit-only; the other six appear in the model-facing lowercase `skill` catalog. Relative scripts and references must be resolved from the `<skill_resources>` directory reported by the loaded package, never from a development checkout or user home.

## Evaluation

Better Skill Creator includes a host-side DSH runner at `scripts/run_eval.py` within that installed skill. Use `--plan` before `--run`. Its optional fixed `dshArguments` support launcher forms such as `node path/to/dsh`, while common overlays are applied identically before every arm-specific overlay. Each live case uses separate temporary workspaces and session roots. On Windows, `workspaceTempRoot` selects an existing caller-owned scratch parent; callers must first verify that the pinned DSH restricted subprocess can read pre-created fixture files there. Session/control state stays in a separate system-temp tree. The optional `initializeGit` control creates the same clean repository in every arm before DSH starts, using a fixed local identity and timestamps. The arm overlay pins DSH to `workspace-write`, pins filesystem resolution to that arm's workspace, redirects project/user/built-in filesystem skill discovery to empty arm-local roots, and disables watching. Treatment begins with `/<target-skill>`, baseline disables the exact `tool-skill` row, and the grader also has no skill catalog. Candidate order is randomized and the arm map is written only after the grader settles.

Runs are bounded by root child count, repetitions, timeout, captured bytes, artifact bytes, and an environment-name allowlist. Credentials remain inherited in memory and are redacted from sanitized evidence; they are never command-line arguments. Missing credentials self-report `UNMEASURED`. A missing target body, contaminated baseline/grader, timeout, truncation, failed process, or missing verdict is `FAILED` and retains the partial sanitized evidence. ChatGPT subscription OAuth supplies plan usage rather than an API-dollar meter, so the runner records bounded calls and available usage but cannot enforce a literal USD ceiling; do not purchase extra credits during a run intended to stay within included plan usage. The owner-approved OAuth run and every retained failure are summarized in [`evidence/behavioral/LIVE_REPORT.md`](evidence/behavioral/LIVE_REPORT.md).

`upsum`'s Python checker takes an explicit target workspace, invokes the adjacent package-owned `parse-frontmatter.mjs`, and uses this package's pinned `yaml@2.9.0`. It therefore needs Git, Node.js, and the installed package dependency closure, but not PyYAML or Python site packages.

## Security and trust

The package trusts the pinned skill prose. Retained scripts are ordinary package resources: installation and plugin load do not execute them, and they become executable only when a user or model deliberately asks an existing DSH tool to run one. This is the intended DSH trust boundary, not a loading defect.

See [COMPATIBILITY.md](COMPATIBILITY.md) for the host contract and skill-by-skill port matrix, [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for licensing/provenance, and `evidence/` for reproducible package and assembled-profile results.

## Limitations

- The recorded live comparisons provide bounded behavioral evidence, not universal effectiveness. Results apply only to the recorded ChatGPT OAuth provider, `gpt-5.6-sol`, prompts, DSH composition, and repetitions; unrun cases and broader effectiveness claims remain `UNMEASURED`.
- A clean evaluation arm is not an adversarial secrecy sandbox. The runner removes inherited workspace/session/skill state and DSH confines writes, but the pinned filesystem seam deliberately permits reads. Cold `subagent/spawn` is required for blind children; `subagent_fork` is not equivalent. Exclude RLM/IPython from these profiles or place the entire DSH process in an OS sandbox/container when untrusted code or hostile readable host data is in scope.
- `upsum` still requires Git and a readable worktree. On this Windows host, DSH's in-process filesystem tools saw the disposable fixture while its workspace-write subprocess could not read the pre-created Git metadata, so the live lifecycle gate remains `UNMEASURED`; the package-relative checker passes its isolated static test. The checker never contacts a remote, so pushed/upstream status is local-cache evidence and is reported as partially blind rather than clean.
