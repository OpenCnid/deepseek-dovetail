# Retained failed and incomplete acceptance evidence

- A peer-only package draft installed into the isolated profile but failed bundle import with `ERR_MODULE_NOT_FOUND` for `@deepseek-ai/dsh-home-paths`. Pinned profile pnpm sets `autoInstallPeers: false`; this evidence caused the exact filesystem-provider runtime/peer closure to become direct dependencies and caused the corresponding correction in SPEC.md and COMPATIBILITY.md.
- The first corrected-package boot reached the clean DSH checkout but failed because the freshly cloned host had no generated `lib` output (`typert.host.js` was absent). Building the exact pinned checkout fixed the fixture, without a tracked DSH edit; the checkout remained clean.
- `evidence/keyless/raw/self-play-v2` is retained as an incomplete cold-child probe. PowerShell passed only `/self-play`; the marker line was not part of the CLI argument, so the keyless adapter returned without calling a child. `self-play-v3` and the final `self-play-v4` use one whitespace-bounded argument and prove cold `subagent` selection.
- One intermediate typecheck failed because a test indexed a one-item directory list without narrowing `undefined`; the guard was added and the repeated typecheck passed.
- One intermediate `verify` failed because its smoke script incorrectly expected `Host` itself to be a function. The public export is the Cordis plugin object `{ name, inject, apply }`; the smoke now checks `Host.apply`, and the repeated verification passed.
- The first in-app browser discovery attempt timed out. The bounded retry connected, the real web UI exposed all eight entries exactly once, and the browser ended with zero warning/error logs.

No baseline or grader contamination was observed in the final keyless runs. Unit tests intentionally exercise contaminated, failed-grader, and timed-out runner states and assert loud failure plus retained partial evidence.
