---
name: self-play
description: >-
  Run a clean-room search over an unsolved design with blind gatherer, adversary, evaluator, and judge roles, controls, pre-registration, and an input-visibility matrix. Use to test whether a rubric, gate, classifier, router, retrieval strategy, prompt template, judge, summarizer, or agent policy really discriminates when the builder's own opinion is not evidence. Do not use for deterministic checks or when cold-child isolation costs more than the decision.
---

# Self-Play for DSH

Self-play is a search around a candidate, not a ceremony that certifies it. Apply the `subagent-composition` delegation gate first. Blind roles require cold DSH `subagent`; `subagent_fork` inherits completed parent history and is forbidden. If cold spawn or required tool isolation is absent, disclose the limitation and stop.

Before authoring player prompts, load `prompt-engineering` and `hypershot-protocol` with lowercase `skill` unless their `<skill_content>` blocks are already present. Use `judge-composition` for the judge seat when utility must be assessed.

## One iteration

1. Pre-register the prediction, falsifying cell, condemning cell, stopping rule, and measurement floor before prompts or evidence exist.
2. Have a cold gatherer build neutral ground without the hypothesis.
3. Compose only roles that buy distinct blindness. Record an input-visibility matrix for every role.
4. Run controls before live items. Stop if a negative control fails. A null result is `UNMEASURED`/no detectable effect until a positive control proves the instrument can fire across the manipulated axis.
5. Launch independent cold players together with `run_in_background: false` when the next step requires their returned results.
6. Have a blind evaluator score an undifferentiated item list without condition labels or the prediction.
7. Have a blind judge assess utility on the manipulated axis without the builder's stake; verify its load-bearing claims against source bytes.
8. Compare results with the pre-registration, record contamination and abstentions, and choose the next variable through evidence rather than the builder's wish.

Stop when the axis is inert across spanning conditions, the effect is below a priced measurement floor, or the next variable costs more than the decision.

## Role blindness

| Role | Work | Must be blind to |
|---|---|---|
| Gatherer | assemble reference ground | hypothesis and desired outcome |
| Adversary | construct the strongest attack | builder's intent and expected failure |
| Executor | run candidate over items | only what execution requires; decide explicitly whether it may also score |
| Evaluator | apply the metric | prediction and condition labels |
| Judge | score returned utility | prediction, arm identity, and builder's stake |

## Input-visibility matrix

For each role record yes/no plus evidence for: per-call prompt, completed parent history, current parent turn, workspace files, user/project skills, package skills, repository instructions, candidate artifact, condition label, prediction, builder authorship/stake, other player outputs, and answer key. A cold call alone does not close filesystem, project-skill, user-skill, or repository-instruction leaks.

## Player frame

```md
{Role_Disposition_And_Reporting_Duty}

## Ground
- {Real_Addressed_Artifact_Or_Public_Corpus}
- {What_Counts_As_Evidence_Without_Revealing_The_Hypothesis}

## Task
{One_Bounded_Objective_With_No_Desired_Outcome}

## Return
{Literal_Frame_Where_Every_Claim_Has_An_Address_And_Every_Gap_Has_A_Slot}

If {Blocking_Condition}: report it and stop.
```

Never install the artifact under test as a discoverable skill for blind players. Deliver it as controlled prompt data or in an isolated workspace, and verify from the outside that hidden skill bodies, catalogs, and files did not reach the role. Byte difference between candidate versions is not proof of non-contamination.

Operational isolation checks are in `references/dsh-isolation.md`. Inherited measurement and failure references remain under `references/` with the adjacent CC BY license and attribution.
