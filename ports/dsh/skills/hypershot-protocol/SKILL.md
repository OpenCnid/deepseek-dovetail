---
name: hypershot-protocol
description: >-
  Author contamination-free structural examples for prompts, templates, workflow schemas, agent instructions, and model-facing documents. Use when a concrete few-shot example could leak topic or answer content, or when output shape should be primed with free variables ranging from spread (...) through categoric to instruction-bearing names. Pair with prompt-engineering; skip it for simple declarative or one-off tasks that need no reusable frame.
---

# Hypershot Protocol

A hypershot teaches form without supplying task content. If `prompt-engineering` is applicable and no `<skill_content name="prompt-engineering">` block is present, load it with the lowercase DSH `skill` tool before authoring. Do not reload a body already injected by `/hypershot-protocol` or another explicit gesture.

## Variable continuum

- **Spread:** `...` is an unbounded structural slot. Use it when the surrounding frame already carries the behavior.
- **Categoric:** `{Finding}` constrains the kind of content without prescribing the result.
- **Instruction-bearing:** `{Two_Sentence_Assessment_With_Confidence_And_One_Citation}` embeds the behavior needed where the frame is otherwise ambiguous.

Use the lightest variable that works. A frame may mix all three levels.

## Construction

1. Abstract every concrete noun, answer, example value, and expectation that could bias the real task.
2. Make the structure visible with headings, lists, tags, punctuation, whitespace, and literal output slots.
3. Put the hypershot before the generation it shapes.
4. Keep invariant names, schema keys, enums, and tool names concrete; they are system vocabulary, not examples. Keep task-varying content downstream.
5. Apply the invariance test: if a token will not be identical across a hundred invocations, abstract it at the instruction layer or supply it as task data.

## Example

```md
### {Finding_Label}
`{path}:{line}`
> {Shortest_Deciding_Excerpt}

{Two_Sentence_Assessment_With_Confidence}

### ...

## Uncovered
- {Scope_Not_Reached_And_Why}
```

The repeated heading is a structural cue, not a sample finding. A concrete expected defect in this frame would contaminate the evaluator.

## Check before shipping

- No variant content appears at the invariant layer.
- Each variable carries neither more nor less instruction than its slot needs.
- The frame is legible with the variable names removed.
- The frame precedes output generation.
- A simple plain instruction would not be clearer or cheaper.

The technique and variable-loading continuum are inherited from Matthew Murphy's Lexideck work through OpenCnid. See the adjacent `LICENSE.md` and the package notice.
