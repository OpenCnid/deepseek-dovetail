---
name: spark-steering
description: Diagnose which SPARK axis (Skills, Personalities, Approaches, Resources, Knowledge) is actually short before reaching for a fix, and move only that one. Invoke by name when stuck mid-task, when output is shallow despite a clean tool run, or before adding a permission rule, MCP server, plugin, subagent, CLAUDE.md, memory file, or new skill. Also for steering, adapting, tuning, or reconfiguring an agent's SPARK coordinates.
disable-model-invocation: true
---

# SPARK Steering

Diagnose before you configure. Reaching for a fix without locating which axis is short adds permanent capability to solve a temporary problem — the wrong-axis move doesn't merely fail to help, it stays installed and charges rent every future turn.

**This body carries the judgment. The data lives in `references/` and is pulled on demand** — never load a reference file whole when a targeted read answers the question.

## The question is location, not fitness

Ask *which axis is short*. Do not ask *will this help finish the task* — the task's goal is not a SPARK coordinate, and scoring a move against it misfires identically every time.

- **S — Skills**: the right tool ran, returned a correct-shaped result, nothing blocked; output is shallow or wrong anyway and re-running won't fix it.
- **P — Personalities**: the friction is about who decides and when they're told. More access or more facts would not change it.
- **A — Approaches**: the work would be identical inline, delegated, or parallel — only ownership or ordering is wrong.
- **R — Resources**: a call fails on permission or denial, a path sits outside the working directory, a name throws `InputValidationError`, no connector exists.
- **K — Knowledge**: re-deriving the same fact each time, asking the user to repaste what they already said, guessing a convention instead of citing it.

## Ask first — the un-tool

**The cheapest lever is not a tool call.** Declining to call anything and instead putting the question to the user in the chat channel is a P-axis move with no schema, no install, and no recurring cost.

It is easy to miss precisely because it has no surface. If the diagnosis is *"this should have asked and didn't,"* the move is available now and costs one turn of attention. Reach for it **before** any lever that installs permanent configuration — it resolves ambiguity at the source instead of routing around it.

Formally this is a cover in the base category of user instructions rather than a capability on any axis, which is why enumerating axes cannot find it. See `references/steer-1-levers.md` § *The un-tool* for the construction and its provenance.

## Rule out the adjacent axis first

A confident diagnosis on the wrong axis is worse than none — it installs a fix that never touches the gap and charges rent anyway. Pass the relevant gate before committing.

- **S vs R** — "I can't do this," with the tool already in the roster and already called, is S (weak result), not R (missing resource). Check the roster before hunting a new connector.
- **R vs K** — a query returning nothing looks like "the resource doesn't exist" (R) when it is a retrieval-formulation gap (K). Reissue with different terms before concluding absence.
- **P vs A** — a pause to ask gets "fixed" by reordering steps (A) when the real issue is the question shouldn't have interrupted, or should have and didn't (P). Test: a values or scope call only the user can make is P; ordering of independent steps is A.
- **A vs R** — many subagents running slow reads as "need more budget" (R) when the fix is fewer, better-sequenced calls (A). Test: if identical work fits in fewer calls with no new tool or permission, it was decomposition.

**Weight against R.** It holds 40.1% of the mapped capability mass and is dominant in 233 of 373 primitives, which makes it the cheapest and most reachable class of move — and therefore the default guess even when the gap sits elsewhere.

## Pull the lever, don't recall it

Once the axis is named, extract the current levers rather than working from memory:

```
Grep "^## {AXIS_LETTER} — " references/steer-1-levers.md -A 20
```

For what a move costs on every subsequent turn, and for the self-observable signs an axis is already oversubscribed:

```
Grep "{cost_class_or_symptom_keyword}" references/steer-3-costs.md -A 6
```

Read only the matching block. These files carry 25 costed levers, 12 cost classes, and 8 saturation tells — loading them whole spends the context the diagnosis exists to protect.

## Self-check before you move

Fill this in about actual session state, not a hypothetical. Act on the lever line only.

```
Symptom: {Concrete_Observable_Behavior_Just_Happened_Not_A_Feeling}
Axis: {S|P|A|R|K}
Confusable ruled out: {Adjacent_Axis} — {One_Clause_Discriminating_Test_And_Its_Result}
Cheaper move considered: {Asking_The_User|Named_Cheaper_Lever} — {Why_It_Does_Not_Suffice}
Lever: {Exact_Primitive_Name_From_Reference} — {What_It_Concretely_Changes}
Spends: {Cost_Tag}, paid {Once_At_Install|Every_Turn|Every_Matching_Call}
Left unmoved: {Other_Axis_That_Looked_Tempting} — {Why_Moving_It_Would_Not_Fix_This_Symptom}
```

The last two lines are not optional. An axis named and deliberately left alone, and a cheaper move considered and rejected for a stated reason, are the difference between steering and reflexive accumulation.

---

What a flag or setting actually does once flipped — as opposed to what its name implies — is outside this skill's scope. This one locates which axis is short; verify the mechanism of any fix against the harness itself before installing it.
