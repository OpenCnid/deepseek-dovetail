---
name: hypershot-protocol
description: >-
  Meta-prompting technique using zero-contamination structural examples. A
  hypershot is a frame with free variables; the variables range across a
  continuum from unbounded spread operators (...) to fully-loaded
  instruction-bearing variables ({Concise_Action_Oriented_Reply_With_No_Fluff}).
  Use whenever authoring a prompt template, workflow output schema, agent
  instruction, wiki entry another agent will read, or any artifact that primes
  a model's generation, even when the user does not explicitly say "hypershot."
  It is the right move anytime you would otherwise reach for few-shot examples
  and risk semantic contamination of the context window. Pairs with the
  prompt-engineering skill, whose master template is a hypershot.
---

# Hypershot Protocol

> The art of priming structure without priming content.

## 1. Why this exists

Few-shot prompting shows the model concrete input/output pairs — and by construction contaminates. Show it "the answer to 2+2 is 4" and it picks up an arithmetic prior even when the real task is a poem; the example's content leaks into the response distribution.

A hypershot instead gives a **frame**: a structural skeleton with **free variables** in place of filled-in examples. The model learns the shape of the response space with no topical bias from invented filler. One zero-semantic frame implicitly enumerates every valid instantiation — the model inhabits the equivalence class directly instead of interpolating between scattered sample points.

The mechanism is **primacy**: what sits earliest in the context sets the strongest prior for everything after. A hypershot placed before generation seeds the desired shape *before any output begins*, so undesired patterns (terminal-art equals-bars, throat-clearing preambles, whatever you are designing out) never become live options — the basin of attraction is already set.

## 2. The continuum

Each hypershot variable sits somewhere on a dial:

- **Spread (unbounded):** `...` — pure structural slot; no type, no instruction load; the frame carries all shaping.
- **Categoric primitive (mid):** `{Greeting_Input}` — abstract type, no instruction; constrains the *kind* of content, not the behavior.
- **Instruction-bearing (loaded):** `{Warm_Professional_Response_With_No_Fluff}` — the name carries its own generation rule; type and behavioral spec in one token-position.

**Which setting depends on how much load the frame itself already carries.** If the markdown structure (heading hierarchy, list shape, rhythm, punctuation) already tells the model what each slot wants, spread is sufficient and cleanest; where the frame is ambiguous, push toward instruction-bearing names to compensate. A single hypershot mixes settings freely — each slot picks its own point. Use the lightest variable that does the job; over-specifying when the frame already carries load just adds noise.

## 3. Construction rules

### Rule A: Abstraction over specificity
Never use a concrete example unless the skill is specifically about that thing — concrete tokens in a hypershot are contamination by definition.
- Weak: `User: "Hello" -> AI: "Hi there!"`
- Hyper: `User: "{Greeting_Input}" -> AI: "{Warm_Professional_Response}"`
- Also valid (spread): `User: "..." -> AI: "..."` *when the surrounding frame already says what kind of exchange this is*

### Rule B: Instruction-bearing variables describe behavior, not data type
Past pure spread, the variable name should describe *how to generate*, not just *what slot this is*.
- Weak: `{Response}`
- Hyper: `{Concise_Action_Oriented_Reply_With_No_Fluff}`

Underscores-as-spaces keep a full phrase parseable as one token-position. Treat the name as a tiny embedded prompt.

### Rule C: Make the structure visible
The frame is the other half of the hypershot; if the structure is not legible, the variables cannot work. Use markdown (headings, lists, code fences, blockquotes), explicit brackets around variables, and intentional whitespace so the shape reads at a glance.

### Rule D: Place the hypershot before the generation it shapes
Primacy is part of the mechanism, not a nice-to-have — a hypershot buried mid-context has weaker priors than the surrounding noise. Put it at the start: the system prompt, or the head of the user message, wherever it lands before the model begins generating.

## 4. Worked examples

### Minimal (spread-dominant)
The frame carries all the load; the variables are pure spread.

```md
# {Project_Name} v{Version}

...

1. ...
2. ...
3. ...
4. ...

...?
```

The model learns: titled-with-version, brief intro, four-item list, brief outro, open-ended trailing question — zero contamination from filler. The trailing `...?` cues that the close is an invitation, not a declaration. This is the exact form that solved the Nexus Singularity Engine TTS bar-of-equals problem: the engine learns *not* to generate ornament because no ornament appears in the seeded frame.

### Mid-range (categoric primitives)
The frame is informative but the slots need typing.

```md
**User Request:** "{Complex_Ambiguous_Query}"

**AI Thought Process:**
1. Analyze "{Ambiguity_Source}".
2. Consult "{Relevant_Knowledge_Base}".
3. Formulate strategy.

**AI Response:**
"I have analyzed {Topic} and found {Key_Insight}. I recommend {Actionable_Step_1} and {Actionable_Step_2}."
```

### Loaded (instruction-bearing)
The frame is structurally simple; the variables do the heavy lifting.

```md
User: "{Question_About_A_Topic_You_Have_Strong_Opinions_About}"
AI: "{Direct_Substantive_Answer_That_States_The_Opinion_First_Then_Briefly_Justifies_It_Without_Hedging}"
```

## 5. Mastery checklist

Before shipping a hypershot:

1. **Contamination.** Any specific noun, name, topic, or content that could bias the model? Abstract it.
2. **Variable load.** Does each variable carry the right instruction for its slot — not over-specifying when the frame already shapes it, not under-specifying when the frame is ambiguous?
3. **Structure visibility.** Is the frame's shape legible at a glance — headings, lists, brackets, whitespace?
4. **Primacy.** Will the hypershot land *before* the generation it shapes?
5. **Frame-vs-variable balance.** Strip the variables: does the frame alone still give useful structural information? Yes → the frame works; no → the variables carry too much and the frame needs work.

## 6. Where examples live: invariants at the system layer, data downstream

The rule is not "never use concrete examples." It is that **concrete content that varies across invocations must not live at the system layer** — primacy (§ 1) makes variant up-front content contaminate the whole session's distribution.

Split by *layer*:

**System layer** (up-front, primes everything downstream) — invariants only:
- Hypershots (frames with free variables, invariant in shape by construction).
- Tool / function / command names. `search_emails` is identical every invocation; naming the tool is not exemplifying a response.
- Schema field names and fixed enums. A `priority` field is `priority` every time; "Status must be one of: open, in_progress, done."
- Canonical entities — agent names, project names, fixed roles the system always references.

**Data layer** (downstream, bound to a specific task) — concrete examples are fine when:
- **Narrowly scoped** — one facet of behavior, not the whole output shape (the shape already came from the system-layer hypershot).
- **Not the entire output** — a voice fragment, an edge case, a reference input; never a full pair the model pattern-matches wholesale.
- **Bound to its task** — gone when the task is done; never absorbed into general behavior.

### The invariance test
Before placing any concrete token at the system layer: **across a hundred invocations, will this exact token appear identically in all hundred?** Yes → invariant, system layer is correct. No → variant; pull it to the data layer or abstract it into a hypershot variable.

### Worked example: tool naming (invariant → up-front)
Name the tool concretely in the system prompt:

```md
Available tools:
- `search_emails(query, accountId)`: search the user's mailbox.
- `read_email(email_id, accountId)`: read a specific email by ID.
```

The names are invariant — not examples of *what to generate* but the system's own vocabulary, so this is their correct place. What would be wrong here is a *sample call* with concrete arguments; that belongs in a hypershot (`search_emails("{Specific_Query}", accountId)`) or downstream as a task-bound example.

### Worked example: voice imitation (variant → downstream)
Wrong: concrete voice samples in the system prompt ("Match this style: [three paragraphs of the author]") — primacy contaminates every later response, even off-task. Right: describe the voice's *shape* up-front via an instruction-bearing variable, `{Direct_Sentences_With_Active_Voice_And_No_Hedging}`, and ship the concrete samples downstream as task-bound reference, dropped when the writing job completes.

### Ground blocks: an expected finding is a filled-in example
Context assembled for another agent takes the same argument as a frame: it carries the facts that agent cannot derive cold and needs in order to look. What you believe it will find is a filled-in example of the answer — it leaks into the response distribution and comes back as the agent's finding, most of all when true; the probe that produced it falls on the same side. One question sorts them: *does this let the agent look, or does it tell the agent what looking will turn up?* An expectation has no layer — neither system nor data — so it goes to the collaborator instead: end the turn and ask (`spark-steering` § *Ask first — the un-tool*, manual-invoke only). Why, in full: the prompt-engineering skill, best practice 6.

### When hypershots are not the tool
- **Purely declarative tasks** — "What is the capital of France?" gains nothing from a frame. Use plain instruction.
- **One-off prompts** — the authoring overhead pays off across many invocations; for a single throwaway, just write the prompt.

## 7. Relationship to other techniques

- **Zero-shot:** instruction only, no example. Hypershot adds a structural example without contamination.
- **Few-shot:** concrete examples that pattern-match and contaminate. Hypershot swaps them for abstract structural ones that prime form, not content.
- **Chain-of-thought:** specifies *steps*. A hypershot can carry a CoT scaffold in its frame (the Mid-range example above); they compose cleanly.
- **Output templates:** every hypershot is a template, but not vice versa — the hypershot-ness is the deliberate free variables (spread or instruction-bearing) that keep the frame contamination-free.
- **prompt-engineering skill:** the broader toolkit (tags, markers, placeholders, collections, attention); its master template is a hypershot, and this skill is the deep dive on that technique.
