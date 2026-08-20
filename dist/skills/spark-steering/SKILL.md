---
name: spark-steering
description: >-
  Diagnose which SPARK axis—Skills, Personalities, Approaches, Resources, or Knowledge—is short before changing an agent. Invoke /spark-steering when stuck mid-task, when a successful tool run still yields shallow work, or before adding a skill, preset, profile patch, plugin, provider, tool, permission, instruction, or persistent fact. Use it to steer or reconfigure only the deficient axis and account for recurring cost.
disable-model-invocation: true
---

# SPARK Steering for DSH

This workflow is explicit-only. Diagnose from actual session evidence before changing configuration.

## Locate the shortage

- **S — Skills:** an available operation ran correctly, but the result remains shallow or wrong and another identical call will not improve it.
- **P — Personalities:** the gap is who decides, what stance governs, or when the collaborator is consulted. More tools or facts do not settle it.
- **A — Approaches:** the work is available, but ownership, ordering, decomposition, or concurrency is wrong.
- **R — Resources:** a provider, tool, permission, filesystem scope, connector, or executable is absent or denied.
- **K — Knowledge:** a fact, convention, or state must be re-derived, recopied, or guessed instead of retrieved from an authoritative source.

## The un-tool

When an expectation, value choice, or scope decision would contaminate a child prompt, stop tool action and ask the collaborator. This is often the smallest P-axis move and creates no persistent configuration.

## Rule out adjacent axes

- S versus R: an available tool returning a weak answer is S; an absent or denied tool is R.
- R versus K: retry a search with materially different terms before concluding that the resource is absent.
- P versus A: a user-owned value or scope decision is P; rearranging otherwise identical independent work is A.
- A versus R: if fewer or better-sequenced calls perform the same work with no new capability, the gap was A.

## DSH levers

Use the narrowest verified lever. Examples include a loaded skill body (S), persona or collaborator question (P), cold-versus-fork choice and tool scheduling (A), a profile row/provider/tool/permission change (R), or repository/user instruction and durable record (K). A package, plugin, or profile patch is not a universal repair: verify its public behavior against the installed DSH revision before using it.

Read targeted details from `references/steer-1-levers.md` and `references/steer-3-costs.md`; those inherited references describe general lever/cost categories and provenance, not a promise that each surface exists in DSH.

## Decision record

```text
Symptom: {Observable_Behavior}
Axis: {S|P|A|R|K}
Confusable ruled out: {Axis} — {Discriminating_Evidence}
Cheaper move considered: {Ask_Collaborator|Named_Lever} — {Why_Insufficient}
Lever: {Verified_DSH_Surface} — {Concrete_Change}
Spends: {Once|Every_Turn|Every_Matching_Call}
Left unmoved: {Other_Axis} — {Why_It_Does_Not_Fix_The_Symptom}
```

The SPARK axes derive from arXiv:2508.01581; the adjacent license and package notice retain OpenCnid provenance.
