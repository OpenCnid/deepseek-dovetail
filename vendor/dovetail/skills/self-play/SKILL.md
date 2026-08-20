---
name: self-play
description: >-
  Run a clean-room self-play search over a problem space you have not solved
  yet — an AlphaGo-shaped loop over text where isolated sub-agent players (a
  blind gatherer, an adversary, a blind evaluator, a blind judge) probe a
  candidate design and each iteration picks the next variable to vary.
  Isolation is what makes the output evidence: each player is blind to the one
  thing that would let it serve the builder's wish, so your reasoning, intent
  and stake cannot leak into the evidence or the scoring. Use when "does this
  actually work / discriminate / hold up?" is open and your own read is not
  trustworthy evidence — a rubric, admission gate, classifier, router,
  retrieval strategy, prompt template, judge, summarizer, or agent policy.
  Triggers include "explore this design space", "red-team this design", "does
  this rubric hold", "clean-room eval", "validate this without fooling myself."
  Do NOT use for a deterministic feature directly checkable without a clean
  room, or when the ceremony costs more than the answer.
---

# Self-Play

## What this is — a search, not a checkup

Isolated players attack a candidate, feed it, and score it, and what comes back
is a reading of the *space around* the candidate, not a verdict on it. Run it only
where you do not already know the answer: an outcome entailed by the design is not
a search. The five moves below are **one iteration**, not the whole search.

## Why isolation — the precondition, not the purpose

**The builder cannot be trusted to evaluate their own LLM feature.** Reasoning and
stake leak into the evidence and into the scoring and read as rigor the whole way
down, so a search run by the builder alone returns the builder's prior with
apparatus around it. Isolation removes the builder by construction: each player
lacks exactly the knowledge that would let it serve the wish (table below).

### Important — epistemic blindness is not environmental isolation

Blindness is what a player *knows*; it says nothing about what it can *reach*. A
player perfectly blind to the hypothesis still returns the builder's prior if it
can read the artifact under test off the disk.

Measured on Claude Code, 2026-08-04, not inferred: **a spawned player receives the
full skills listing** — sent twice per run, to parent and to worker — **and can
invoke any installed skill.** Given a task matching an installed skill's triggers
and no mention of skills in the prompt, a worker invoked it unprompted on 3 of 3
trials, output carrying the skill's house format. A working-directory
`.claude/skills/` loads too, as a project skill. Neither path needs prompting;
neither is visible from inside the player. So an artifact under test that is
installed, or near-duplicates something installed, makes **every player a leak
path.**

- **Deliver the artifact under test as prompt text** — never installed, never a
  project skill in a directory a player runs in.
- **Close four holes, not one.** Settings sources (kills user and project skill
  directories and skill-injecting hooks); the `Skill` tool; bundled skills, which
  survive every other mechanism; and filesystem reads of the skills directory,
  which defeat all of the above alone — a player told to try fallbacks reached for
  Read, then Grep, then Bash.
- **Verify per run, from outside**, on the player's own debug log: attachment
  count zero, skill-tool count zero. Per run, not per configuration.
- **Byte comparison is not a contamination check** — revisions share most of their
  lines, so a diff says "different" while the player reads the same things.
- **Keep a content fingerprint**: the artifact's distinctive shapes in a
  supposedly isolated player's output means a leak. This channel works when
  transcripts do not — sub-agent transcripts can be zero bytes, and a search over
  an empty file returns a confident, meaningless zero.

*(Bought by a 2026-08-04 run whose no-instruction control could reach both
versions under test and returned the protocol's markers as if untutored. Void, and
nothing inside it could have said so.)*

### Important — establish headroom before you search

A search over a competence the model already holds returns nothing, and the
nothing looks like a result. Before composing players, run the bare task once and
check that the failure you intend to measure occurs at all; if the untutored run
already scores at ceiling, move the target before spending anything. *(In that run
every artifact scored perfectly, control included — parameterised dispatch is
saturated, and one cheap trial would have shown it.)*

## When to use — and when not

**Use** for almost any LLM-assisted feature where "does it actually work /
discriminate / hold up?" is open and your own read is not trustworthy evidence.

**Do not use** when the feature is deterministic and directly checkable without a
clean room, or when the ceremony costs more than the answer — over-ceremony is a
real failure. Apply the **spawn gate** from `subagent-composition` first: spawning
starts an agent cold and re-derives context you already hold, so spawn only when
isolation or context economy earns it.

**Also do not A/B an engineered instruction against a base-model baseline** ("does
it help") — an instruction constrains the model to its spec, so outscoring an
unspecified run is entailed. Measure against a stated engineering target, or probe
a named failure mode (leak, over-trigger, break); version A against version B is
fine. A `without_skill` arm is not itself the error — `better-skill-creator` runs
one to find assertions that pass either way and so discriminate nothing; the error
is reading its delta as evidence the skill works. Shapes, and null arm vs required
positive control:
[`references/measurement-bounds.md`](references/measurement-bounds.md).

## The invariant skeleton — the five moves, always in this order

Each move closes a leak the previous one opened.

1. **Pre-register the prediction** — before any prompt or any evidence exists.
2. **Build the neutral ground — blind** (discipline 2).
3. **Compose the clean-context players** — each missing the one thing that would
   let it serve your wish.
4. **Evaluate blind** (discipline 3).
5. **Calibrate honestly** — score the pre-registered prediction against the
   result, including the outcome you did not want.

Invariant: these five moves and the isolation each protects. Free: the domain, the
ground, the players' selections, the metric — swap those and the same skeleton
searches a water-chemistry claim, a comedy corpus, a codebase, or a flat-Earth
argument. Four such runs, with scope limits and the three occasions the method
withdrew its own findings:
<https://github.com/OpenCnid/self-play/blob/main/docs/FINDINGS.md>.

## Across iterations — what the search actually selects

Move 5 ends an iteration, not the search. A finished run hands the next one three
things, and naming them is what turns a sequence of tests into a search: **the
axis that moved, or was shown inert across conditions that span it**; **the next
variable, chosen by an agent that cannot see your wish**, since steps an agent
takes in isolation are independent of your experiment and steps you take are not;
and **the instrument's floor**, which prices what the next round can detect. A
round returning nothing new is the boundary of the space, recorded.

**Stop when one of three is true**, and say which: the axis is inert across
conditions that span it; the effect is below the floor and you have priced a
sharper instrument; or the next variable costs more than the decision it would
inform. Iterating with no stopping rule is how a search becomes a habit.

## Before you author a player prompt

Invoke `prompt-engineering` **and** `hypershot-protocol` via the Skill tool, then
author against them. **Both must be installed, not merely readable
as text:** invoking opens the gate, reading a vendored copy does not, and a
vendored copy is derived, not an authority over its source.

**A `Skill` call that returned has not delivered anything.** The body lands as a
separate message, so a call can read as success and deliver nothing — after which
a session cites the skill from memory of what it usually says, asserting a source
it did not read. Before your first citation of either, name a section heading you
can actually see in this session's context; if none is there, invoke again — a
re-invocation has recovered a body the first call dropped.

Pinned dependencies, install commands, and what breaks without each:
<https://github.com/OpenCnid/self-play/blob/main/docs/DEPENDENCIES.md>.

## The players — composed per context, isolated by construction

A player is a clean-context sub-agent given exactly its input and blind to one
specific thing. Four roles recur; compose more or fewer, but each must buy a
blindness no other player buys, or it is decoration.

| Player | Its job | Blind to (load-bearing) |
|---|---|---|
| **Gatherer** | assemble the neutral ground / reference corpus | the hypothesis — else it curates toward the answer |
| **Adversary** | construct the strongest attack on the target | the builder's intent — else it performs to the wish |
| **Evaluator** | apply the test to each item and report | the prediction, and which condition it judges — else it marks an answer sheet |
| **Judge** | score the utility of what the run returned, on the manipulated axis, with its control state attached | the prediction and the builder's stake — else "useful" means "what I hoped for". Compose it with `judge-composition`; a run without this seat returns a verdict, not a utility score, and says so |

A fifth seat is easy to miss: **whoever runs the candidate over the items is not
automatically the evaluator.** Name it, and decide on purpose whether the seat
that executes may also score — sharing them is a defensible economy, doing it
without noticing is not.

### The isolation ledger, and the channel it does not close

From `subagent-composition`: a spawned agent starts cold, so your conversation
history, reasoning, stake, and prediction **do not cross** into a player unless
you put them there. Never hand a player the very thing it is blind to.

**The exception is the one that will catch you.** Project `CLAUDE.md` **does**
cross into every player: a hypothesis or a stake written there reaches every seat
without anyone putting it in a prompt, and no player-prompt audit will find it.
Auto-memory and skills *you* have loaded do not cross; `CLAUDE.md` does. **Read
the `CLAUDE.md` your players will inherit and audit it for the hypothesis exactly
as you audit a ground block** — discipline 1 with a specific address; the
repository's `probes/` harness keeps the claim honest on your version.

### Player prompt frame (a hypershot — free variables, no leaked content)

Author every player prompt as a frame, never a filled example; a concrete
expectation in the prompt is the leak you are searching against.

```md
{Role_As_A_Disposition_Naming_What_It_Prioritizes_Refuses_And_Reports}

## Ground
- {Real_Artifact_At_Path_Line_Or_Named_External_Corpus_Never_An_Invented_Scenario}
- {What_Counts_As_A_Fact_Here_Stated_Without_Naming_The_Hypothesis}

## Task
{One_Bounded_Objective_That_Does_Not_Reveal_What_Outcome_Is_Wanted}

## Return
Reply in exactly this shape:

{Nested_Deliverable_Frame_With_Every_Claim_Carrying_Its_Address}

If {Blocking_Condition}: report what you found and stop. Do not {Named_Wrong_Continuation}.
```

The evaluator's frame additionally withholds the condition label: it judges one
undifferentiated list and never learns which items are live and which are
controls.

### The `## Ground` block carries relevant context only

Ground is what a player cannot derive from a cold start and needs in order to
look: `{Authorship_And_Provenance_Of_The_Artifact}`,
`{Roster_Addresses_And_Where_To_Read}`, `{What_Counts_As_A_Fact_Here}`. An
expectation — `{What_You_Believe_The_Player_Will_Find}` — is never ground: a
player handed a true expectation hands it back, and nothing in the report
separates that from a finding. One question sorts them: *does this let the player
look, or does it tell the player what looking will turn up?* **The probe you
already ran falls on the second side.**

A held expectation has one destination and it is not a prompt: the un-tool
(`spark-steering` § *Ask first — the un-tool*), which ends the tool call and puts
the question to the collaborator rather than settling it by installing standing
configuration. Why, in full: `prompt-engineering` best practice 6.

*(A ceremony had every artifact this skill asks for — pre-registration held
separate, isolated players, an audit seat — and its independence was still ruled
unestablishable, because one ground block carried the composer's probe. Audit the
ground blocks, not the apparatus:
[`references/ground-block-failure.md`](references/ground-block-failure.md).)*

## The ten disciplines

1. **Pre-register before the prompts exist.** A forecast that shares bytes with
   the prompt *or with the evidence the players see* is a work order, not a
   forecast. **The channel moves — audit for the leaked content, not its
   location.**

2. **Build the ground blind.** Whoever assembles the reference material must not
   know the hypothesis, or they select toward it.

3. **Evaluate blind.** The scorer sees neither the prediction nor which condition
   it judges. Otherwise it grades against a key.

4. **Never curate your own evidence universe.** The builder alone in the curation
   seat is the unauditable layer. Disclose your conflict and run blind *whenever
   you have a stake* — which, if you built the thing, you do.

5. **Real variables.** Bind each game to a real artifact at `path:line` or a real
   external corpus: a wrong answer must be checkable by anyone, and an invented
   scenario is gradeable only by its inventor. **What this bars is you inventing
   the items**, not generation as such — discipline 10's blind item-smith with an
   independently adjudicated key is sanctioned, because that key is checkable by a
   party with no stake. Prefer a corpus the world supplied: harder to fake, and it
   succeeded where six hand-built attempts had failed.

6. **Controls first** — run the negative / control cases before the live ones. **A
   control failing is the signal to STOP, not to push on**: the test itself is
   broken and any live result would be noise. **A positive control that will not
   fire across escalating designs is itself the finding**: the effect is below
   your detection floor, not absent-because-you-say-so, so report *no detectable
   effect*, never *validated*. That is the **positive-control duty** — *a null
   result is meaningless until the experiment has demonstrated it can produce a
   positive one.* **A control must also *span* the manipulated axis, not hug the
   candidate**: zero distance measures format compliance, and only a spanning
   control separates an *inert* variable from a merely *untested* one.
   [`references/discipline-cases.md`](references/discipline-cases.md)

7. **Sound-target discipline.** To isolate a degenerate case you need a *sound*
   target; against a defective one, legitimate findings are always available and
   the degenerate case never appears. *(Six probes failed this way.)*

8. **Sub-agent output is data, not authority.** Players find real defects *and*
   overreach in the same report, both in fluent, confident prose. Verify every
   load-bearing claim against the bytes before acting.

9. **Label the operationalization.** Turning a claim into a testable rule is
   interpretation, and it is yours. Disclose it as the builder's reading; never
   smuggle it in as the claim itself.

10. **Build subtle ground truth iteratively, and verify the key blind.** A subtle
    effect only shows on *marginal* items, but one-shot generation produces clean
    textbook cases the real variable can't move, since a clear-cut item is decided
    by its own defect. Give a blind sub-agent a goal and let it **iterate in its
    clean room** (draft, adversarially stress-test its own answer key, refine) —
    steps it takes in isolation are independent of your experiment. Then have a
    **second** blind agent independently adjudicate that key: the item-smith's key
    is *data, not authority* (discipline 8, turned on the ground truth itself).
    Keep only items where the two agree; discard the genuinely ambiguous rather
    than arbitrating them yourself, which is the builder re-entering the seat.
    [`references/discipline-cases.md`](references/discipline-cases.md)

## The cell that matters — pre-commit it

Pre-commit **two** cells, as cells in the result table rather than as vibes. They
are different cells, and collapsing them is a real error because they coincide
only when you predicted the candidate would work:

- **The falsifying cell** — the result that would show your *prediction* wrong,
  whichever direction it points; this is what calibration is scored against. A
  builder who predicts the candidate is broken has a falsifying cell showing it
  works, and that cell is just as binding.
- **The condemning cell** — the result that makes the *candidate* insufficient
  regardless of the headline verdict. *If ≥1 item lands here, the feature is
  insufficient however good the summary number looks.*

Naming them separately is what stops a headline outcome every candidate design
would produce (the tautological win) from reading as evidence that yours works.

**Say what fills a cell before you can see who fills it.** If a cell turns on a
word — *corrosive*, *unsafe*, *hallucinated* — put the sorting rule into the
pre-registration and have a blind seat apply it; a cell adjudicated after
unblinding by the person with the stake is scored by the stake, however blind the
run that produced the items was.

## Failure modes — run this when a search feels like it is working

- **Leak by evidence** — task text clean, tell in the corpus or in `CLAUDE.md`
  (discipline 1).
- **Curating your way to the answer** — three broken experiments in a row usually
  means you are still in a seat you should have vacated (disciplines 4, 7).
- **Reading the outcome you wanted** — score the pre-committed cells, not the
  story. **Trusting the player** — confidence is not verification (discipline 8).
- **Ceremony for its own sake** — if the answer is directly checkable, a clean
  room is theater. **A search stopped at one iteration** has mapped nothing.
