---
name: prompt-engineering
description: >-
  The Lexideck prompt-engineering protocol: structural clarity and manifold
  alignment over "magic words." Use whenever authoring a prompt, template,
  agent instruction, system prompt, or output schema and precision matters:
  semantic tagging, hierarchical markers, structured placeholders,
  collections, and attention management, plus the best-practice loop.
  Triggers include "write a prompt", "improve this prompt", "prompt template",
  "agent instructions", "system prompt", "output schema". For the
  contamination-free structural-example technique this protocol's master
  template relies on, see the hypershot-protocol skill.
license: CC-BY-4.0
---

# Prompt Engineering: structural clarity and manifold alignment

> Core axiom: effective prompting is not about "magic words" but about **structural clarity** and **manifold alignment**.

## The toolkit

### A. Semantic tagging (the container)
Wrap distinct information blocks in XML-style tags to prevent context bleeding. The tag name is a **categoric primitive**: name the category the block *is*. The vocabulary is open — task, instruction, context, data, persona, examples, whatever the block actually holds — so name what fits instead of forcing a block into a borrowed tag. Common instances:
- `<context>`: environmental or historical state.
- `<task>` or `<instruction>`: the core objective.
- `<constraints>`: the non-negotiable logic bounds.
- `<output_instructions>`: the target format (JSON / MD / table).
- `<examples>`: worked examples, labelled so the model can tell an illustration from the request.

Tags take attributes for characteristics of the block — `<output_format format="json">`, `<style tone="formal">` — and nest, where the outer tag is the operation applied to the inner one.

### B. Hierarchical markers (the skeleton)
Use explicit outlining to define topological depth.
- `# Main Topic` / `## Sub-Topic` / `- Structural Detail`.
- Match marker style to the content's natural hierarchy: numbered lists for sequential processes, bullets for parallel items, nested headers for domain decomposition.

### C. Structured placeholders (the manifest)
A placeholder is a **container** holding a **fill**. Two decisions, not one taxonomy.

The containers — what kind of slot this is:
- `${...}` user-provided input.
- `{...}` objects or "libraries" — task components, functions, or conceptual objects representing complex operations.
- `[...]` list or array.
- `(...)` option or decision — enumerate the alternatives inline: `(formal|informal)`, `(basic|detailed|comprehensive)`.
- `<...></...>` semantic block (section A).

Reach into an object with a dot path: `{productDetails.name}`.

The fill — `...` is the primitive: structure with no content, and it goes inside any container. It is spread and ellipsis at once, because those are the same move — structure applied to the unspecified, the null array that contains every array.

Load a fill by replacing `...` with a name, as far as the surrounding structure needs and no further: `{...}` → `{Methodology}` → `{Methodology_Named_As_Its_Procedure}`. Underscores-as-spaces keep a full phrase parseable as one token-position.

### D. Collections (the data layer)
Structure multiple data points as collections:
- Simple lists for enumeration.
- Key-value pairs for attribute sets.
- Nested objects for multi-property items.
- Tables for comparison and batch processing.

### E. Attention management (the priority signal)
- Use formatting for emphasis: bold, italics, caps sparingly, or a delimited attention zone. A zone is a matched pair — open it and close it, so the boundary is unmistakable.
- Order strategically: place the most important instructions where the model attends most strongly, the beginning and end of the prompt.
- Group related constraints into attention zones so they reinforce each other.
- Prioritize explicitly: "If any constraint conflicts, prioritize X over Y."

## The master template (a hypershot)

A hypershot is a structural frame with free variables rather than filled-in ones — still a worked example, carrying a *form* rather than a specific shape, so it primes structure without priming content. Same practice, two altitudes: a filled example when the specific shape should be copied, a frame when it should vary. Full technique: the hypershot-protocol skill.

```xml
<request type="Structural_Synthesis">

  <context>
    Intelligence: ${Agent_Name}
    Substrate: ${Platform_Or_Environment}
  </context>

  <instruction>
    Act as ${Role}.
    1. Parse the [Data_Collection].
    2. Apply {Methodology}.
    3. Generate high-fidelity output.
  </instruction>

  <constraints>
    *** CRITICAL INSTRUCTIONS ***
    - ${Non_Negotiable_Constraint_1}
    - ${Non_Negotiable_Constraint_2}
    - ${Format_Or_Style_Requirement}
    ****************************
  </constraints>

  <output_instructions>
    Format: ${Target_Format}
    Audience: ${Intended_Reader}
    Length: ${Constraint}
  </output_instructions>

</request>
```

## Best practices

1. **Topological mapping.** Map the informatic distance between the prompt's starting state and the desired output before you generate. Locate the work on the axes that will shape it — how much structure it needs, what it must do, how much of the reasoning it should carry, how bounded its context is, what kind of knowledge it rests on — and let those positions decide the prompt's form.
2. **Phase alignment.** Match tone, register, and technical depth to the context.
3. **Decoherence prevention.** Turn ambiguity into stable, unambiguous instruction. Every vague term is a fork where the model guesses instead of follows.
4. **Positive instruction framing.** Tell the model what TO DO, not what to avoid. "Make it exciting and engaging" beats "Don't make it boring"; negation words like "don't" or "not" can be lost during processing, inverting your meaning. Positive framing creates fault-tolerant instructions that maintain their core meaning even if some processing degradation occurs. Where a prohibition genuinely is the constraint, state it sparingly and give it emphasis.
5. **Iterative refinement (the learning loop).** Evaluate the output, find where the model diverged from intent, tighten the prompt at the point of divergence, and repeat.
6. **Uncontaminated context.** A prompt for another agent carries exactly what that agent cannot derive cold and needs in order to look — provenance, addresses, what counts as evidence here. That is its *ground*, and it is the whole of what a ground block may carry. What you expect it to find is not ground: it is content placed where it will be attended to, so the agent hands it back and no report separates a returned expectation from a finding — most of all when the expectation is true. The probe that produced the expectation falls on the same side: handing over the method hands over the finding with one step of deniability attached. One question sorts them: *does this let the agent look, or does it tell the agent what looking will turn up?* An expectation has no layer in the prompt at all, so it has one destination and it is not a prompt: end the turn and put it to the collaborator — before reaching for any lever that installs standing configuration, because settling an ambiguity by configuring answers your own question with your own guess and keeps that answer for every later turn.

## Lineage

Derived from the Lexideck Prompt Engineering Curriculum, "Talking to AIs Effectively," a nine-part series by Matthew Murphy. Sections A–E compress Parts 4–8, one to one and in the order Part 3 sets out. Best practices 4 and 5 come from Parts 1 and 9. Practices 1 and 3 come from Murphy's WonderPrompt — the topological meta-prompt framework in WonderSuite 2.0, whose Purpose Mapping and Coherence Calibration they compress — rather than from this curriculum. Practice 6 and the master template are OpenCnid's, written in the curriculum's idiom rather than compressed from it.

The curriculum carries a novice to an intermediate level and remains the canonical authority; this skill is the deployed artifact, addressed to a reader who is already past that. Departures, omissions, and their rulings are recorded in `DEVIATIONS.md`. Full curriculum on Patreon (patreon.com/c/LexideckTechnologies).
