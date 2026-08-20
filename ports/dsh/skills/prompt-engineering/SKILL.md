---
name: prompt-engineering
description: >-
  Design or improve prompts, templates, system instructions, agent instructions, and output schemas with semantic tags, explicit hierarchy, structured placeholders, attention control, uncontaminated ground, and iterative refinement. Use when precision matters or the user asks to write, debug, restructure, or review prompt bytes. Pair with hypershot-protocol when an example should teach form without leaking content.
license: CC-BY-4.0
---

# Prompt Engineering for DSH

Use this protocol whenever you author bytes that another model will treat as instructions. If `hypershot-protocol` is also applicable and no `<skill_content name="hypershot-protocol">` block is already present, load it with the lowercase DSH `skill` tool before drafting. A user-explicit `/prompt-engineering` injection already supplied this body; never load it again.

## Structural toolkit

1. **Semantic containers.** Put distinct categories in named XML-style tags such as `<context>`, `<task>`, `<constraints>`, `<evidence>`, and `<output_instructions>`. Name what a block is and close every boundary.
2. **Visible hierarchy.** Use headings for nested topics, numbered lists for sequence, bullets for parallel facts, and tables only when exact field-to-field comparison helps.
3. **Structured placeholders.** Treat a placeholder as a container plus a fill: `${...}` for supplied input, `{...}` for an object or conceptual operation, `[...]` for a collection, and `(a|b)` for a choice. Increase a variable's instruction load only when the surrounding frame does not already determine behavior.
4. **Collections.** Use lists, key/value mappings, nested objects, or tables to express repeated data without prose ambiguity.
5. **Attention.** Put the highest-priority constraints near the beginning and end, group related constraints, and state conflict priority explicitly. Use prohibitions sparingly and pair them with the required positive behavior.

## Authoring sequence

1. Map the distance between the available context and the required result: structure, operation, reasoning depth, bounds, and required knowledge.
2. Separate invariant instruction from invocation-specific data.
3. State the objective, evidence, authority, constraints, and output form at the narrowest useful level.
4. Use a hypershot before generation when a structural example helps but concrete content would contaminate.
5. Run or inspect the result, locate the first divergence from intent, revise that instruction, and repeat.

## Ground without expectations

A cold DSH subagent prompt includes facts the child cannot derive and needs to inspect the task: addresses, provenance, definitions, accepted prior decisions, and what counts as evidence. Do not include the parent's expected conclusion, suspected defect, desired verdict, or the probe that produced it. Ask: *does this let the child look, or tell it what looking will find?* If it tells, withhold it from the prompt and ask the collaborator instead.

## Hypershot frame

```xml
<request type="{Operation}">
  <context>
    {Invariant_Ground_Required_To_Act}
  </context>
  <task>
    {One_Bounded_Objective}
  </task>
  <constraints>
    - {Non_Negotiable_Constraint}
    - ...
  </constraints>
  <output_instructions>
    {Literal_Structural_Frame_For_The_Answer}
  </output_instructions>
</request>
```

## Attribution

This adapted protocol derives from OpenCnid's compression of Matthew Murphy's Lexideck Prompt Engineering Curriculum, “Talking to AIs Effectively.” The adjacent `LICENSE.md` and `NOTICE` govern attribution. OpenCnid's uncontaminated-ground guidance and the DSH operational translation are identified in the package notice.
