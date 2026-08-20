# Provenance — how the mechanics in `SKILL.md` were established

Moved out of the skill body on 2026-08-01. Nothing was cut: the body carried this
as narration, and narration in a skill body competes with the procedure for the
surviving prefix while telling a reader nothing they must *do*. It is evidence,
so it belongs where evidence is kept.

## What was checked, and how

**Documentation pass — July 19, 2026.** The mechanics were verified against the
Claude Code documentation: `sub-agents`, `agent-sdk/subagents`, `worktrees`,
`settings`, `model-config`, and `plugins-reference`.

**Live probe — CLI 2.1.214.** Five throwaway agents differing by exactly one
field, with canary tokens planted in a skill body and in a project `CLAUDE.md`,
run against a no-`skills` control.

**Second documentation pass — August 2026,** for the bundled companion-loading
plugin: `hooks`, `skills`, and `memory`, in addition to the pages above.

**Static extraction — shipped `claude.exe`, 2.1.214.** A source class the July
pass did not use: strings and configuration schemas read directly out of the
installed binary. It is treated as lead-generating only. A string in a build
shows what the build contains, not what the harness does with it, so what it
surfaced was confirmed by probe or by documentation before it entered the body.

**Hook activation probe — CLI 2.1.214, August 2026.** The plugin manifest and
its `UserPromptExpansion` hook were run before and after installation, and from
a project-local skills directory as well as a user-level one. The results are
recorded in `docs/FINDINGS.md` and are not repeated here; keeping one copy is
the point.

## What the control bought

The control earned its place twice, and both are the reason the inheritance
ledger in the body can be stated as fact rather than as belief:

1. It distinguished a **hot-reload failure** from **bad YAML** — two causes with
   identical symptoms, which without a control would have been read as whichever
   the prober expected.
2. A **positive control** distinguished a **real negative** from a **blind
   probe**. A probe that cannot demonstrate it would have detected the thing is
   not evidence of the thing's absence.

That second one is the positive-control duty, and it is why three behaviours in
the body are stated as "cost a probe to find" rather than inferred from docs:
agent registration lagging the filesystem in both directions, `--agent {name}`
silently ignoring `skills:`, and `tools:` replacing inheritance rather than
trimming it.

## Design lineage

Composition discipline here is the Lexideck toolkit applied to the agent
boundary: the frames are hypershots, the block order is attention management, and
the return contract is decoherence prevention at the one place where ambiguity is
unrecoverable — a sub-agent's final message, which has no second chance to be
corrected.

## What is still unmeasured

The probes established the **mechanics** — what crosses the boundary, what the
frontmatter fields do, what the ephemeral call cannot express. They did not
measure whether a prompt composed by these frames produces better sub-agent
output than one that is not. That is a separate question and this repository has
no evidence for it. `probes/` holds the diagnostics; there is no `VALIDATION.md`
here yet, and until there is, treat the composition guidance as engineering
judgment and the mechanics as verified.

One row of the ledger is also weaker than it reads. The body states that the
**whole `CLAUDE.md` hierarchy** crosses the boundary — user, project,
`.claude/rules/`, `CLAUDE.local.md`, managed policy. Only the project leg is
measured here: the canary was planted in a project `CLAUDE.md` and came back.
The user-level file, `.claude/rules/`, and managed policy are cited to the
documentation and were never probed in this repo. The claim is not in doubt, but
it is documentation, not measurement, and it is recorded that way. If one of the
unprobed legs is load-bearing for what you are building, plant a canary in that
leg rather than inheriting our confidence.
