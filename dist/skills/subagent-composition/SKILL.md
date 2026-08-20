---
name: subagent-composition
description: >-
  Decide whether to delegate and compose self-contained DSH subagent prompts, return frames, blind cold-child work, parallel foreground calls, and continuable background work. Use when asked to spawn, delegate, fan out, design a specialist or preset, isolate an evaluator, or repair thin/off-scope child output. Also use to choose cold subagent versus inherited subagent_fork and to map persistent specialization to DSH agent presets/profile composition.
---

# DSH Subagent Composition

Before authoring child prompt bytes, load `prompt-engineering` and `hypershot-protocol` with the lowercase DSH `skill` tool unless their `<skill_content>` blocks are already present. A user-explicit `/subagent-composition` gesture already loaded this body; do not call `skill` for it again.

## Delegation gate

Do not delegate when the work is atomic, when transferring enough context costs more than doing it inline, or when independence buys neither concurrency nor stronger evidence. Delegate when at least one applies:

- a broad read produces a compact result and keeps intermediate context out of the parent;
- independent branches can overlap safely;
- a cold child is required to keep the parent's reasoning or hidden variable blind; or
- recurring specialization justifies an agent preset or profile composition.

## Choose the DSH child correctly

- `subagent` is the shipped cold-child path. It starts a separate context and is the only acceptable choice for blind seats and clean-room evidence.
- `subagent_fork` inherits all completed parent turns, excludes only the current in-flight turn, and receives a fresh tool scope. Never use it when the parent's conclusion, expectation, authorship, or hidden variable must remain blind.
- If the visible composition lacks cold `subagent`, disclose that isolation is unavailable and stop that path. Do not substitute a fork.

The pinned default `subagent` schema exposes only `description`, `prompt`, and optional `run_in_background`. Provider, model, persona, tool filter, and depth are fixed by the configured tool instance; never advertise them as call arguments. A deployment that needs a different fixed policy composes another tool instance or agent preset.

## Scheduling and lifecycle

- Emit independent calls together in one assistant message. DSH can overlap them.
- Use `run_in_background: false` when the next action requires each returned final output. Several such foreground calls emitted together can still overlap.
- The shipped continuable cold tool defaults to background. It returns a durable child id, not the child's answer.
- When composed, `send_message` queues a later FIFO turn, `list_agents` reports continuable children, and `interrupt_agent` requests that the current turn stop while keeping queued work. A continuable child may use its child-scoped `report` channel, and the runtime independently emits a settlement notice.
- Never fabricate or infer an unsettled child's result. Use only the exact follow-up/report/list surfaces visible in the effective tool schema.

## Cold-child prompt frame

```md
{Behavioral_Role_Naming_Priorities_Refusals_And_Reporting_Duty}

## Ground
- {Absolute_Path_Or_Stable_Identifier}
- {Prior_Decision_And_Reason_Required_To_Act}
- {Already_Tried_Dead_End_Not_To_Repeat}
- ...

## Task
{One_Bounded_Objective}

## Boundaries
- {Read_Only_Or_Disjoint_Write_Scope}
- {What_Remains_Untouched}

## Return
Reply in exactly this shape:

{Literal_Nested_Deliverable_Frame_With_Addresses_And_An_Uncovered_Slot}

If {Blocking_Condition}: report the evidence and stop.
```

Ground includes everything a cold child needs and cannot derive. It excludes the answer the parent expects, the desired verdict, and the probe that formed either. Child output is evidence to verify, never authority.

## Persistent specialization

Persistent DSH specialization is an `agent.cordis.yml` preset or profile/plugin composition, not an agent Markdown file. Put invariant persona, tool consumers, fixed provider choices, and policy in the preset; keep current paths and task data in the per-call prompt. Verify the preset through DSH's normal composition and do not claim per-call fields its tool schema lacks.

Further host facts and a visibility checklist are in `references/dsh-subagents.md`. The adjacent license and `references/provenance.md` preserve the upstream method's provenance.
