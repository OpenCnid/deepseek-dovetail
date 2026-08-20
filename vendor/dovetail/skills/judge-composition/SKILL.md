---
name: judge-composition
description: Compose an adaptable four-role judge panel (grounding, coherence, corroboration, audit) to evaluate a candidate for promotion — a belief, claim, record entry, or artifact — against novel or arbitrary content such as a REPL state, corpus, document set, or codebase. Use whenever the user asks to judge, vet, adjudicate, or promote a claim or candidate; mentions spawning judges, judge panels, promotion candidates, belief-to-fact promotion, or a reconciliation record; or wants an impartial evaluation of content they authored themselves — the self-invested-claimant case is exactly what this skill hardens against. Pairs with the prompt-engineering and hypershot-protocol skills, which must be invoked first in any session that authors judge prompt bytes.
---

# Judge Composition

## Ground

**This repository is canonical for this skill and for the records mirrored in [`references/`](references/)**, which ship byte-for-byte so a rule cited by number resolves here. Read by the section a citation names — the mirrors run to 347 KB, and §6 is a section, not a file. `JUDGE_COMPOSITION_GAME.md` §6's twenty rules are cited by number, never restated — a paraphrased copy is drift. Thesis and standing falsifier, distillation, reconciliation, and the 2026-08-01 authority correction: [`references/thesis-and-provenance.md`](references/thesis-and-provenance.md), [`references/README.md`](references/README.md).

## The invariant skeleton — the blindness structure, not a cast

Invariant is the **blindness structure**, never a standing roster: four roles differently blind by construction, so no seat's failure — including the composer's — survives composition unobserved. Everything else is composed per context (§ *What adapts per context*); there is no default cast, and a stored composition is a record, never a roster a later ceremony selects from. Four is the current cover, not a required number: a cover grows only when a new seat buys a blindness the others lack (`FOUR_JUDGE_DESIGN.md` §9 falsifier; `COMPOSITION_FROM_PRIMITIVES.md`).

- **J1 Grounding** — do the cited bytes contain what the candidate claims? Fidelity only, identical across claim modes. Truth is never its business.
- **J2 Coherence** — does the candidate hold together internally and against the live record? Entailment only; no empirical weighing.
- **J3 Corroboration** — does evidence *independent of the candidate's own citation chain* support it? Its base is the record minus that chain, plus whatever external channel the user's allowlist grants.
- **J4 Audit** — judges the judges and the composer. Renders findings, **never verdicts; never gates**. Its *name and angle* compose with the context like any seat; only its **failure taxonomy** stays invariant — `rubric_gamed`, `convention_blind`, `systematic_drift`, plus coverage findings — because how judges fail does not depend on what they judge.

A judge is a sparse selection of **qualified parameters** (`registry.parameter/aspect`) from four registries — Emotional, Logical, Sensorial, Ethical — plus claim modes, an orientation block, a closed drawback taxonomy, and an explicit blindness statement. Verdicts are ternary (`clean | drawback | abstain`); abstentions carry a typed reason (`jurisdiction | evidence`); drawbacks come only from the closed taxonomy. Qualified selections are pairwise disjoint across roles — that is what licenses composition: cross-role disagreement is data and both verdicts stand (Step 3 *Overlap* for what happens where they are not).

## What adapts per context

Registry selections and aspects, orientations, evidence channels, belief-facing taxonomies (defined fresh, closed before judging), and judge names. **The driving question sets registry access**: an epistemic question keeps the Emotional and Ethical planes out; an aesthetic or human-impact question pulls them in — always against the user's own corpus or record, never the judge's taste. External-verification allowlists are user, not panel, configuration.

## The protocol

> **Worked runner.** `complexity-convocation` runs this ceremony end to end (`JUDGE_COMPOSITION_CEREMONY.md` §3), with the driving question fixed at *is this complexity warranted?* — invoke it when that is the question, otherwise read it as the reference implementation of the primitives below.

### Step 0 — File the claim

Filing is a write operation on someone else's idea; the composer's paraphrase is a corruption channel that in the live run strengthened the claimant four-for-four and produced six of the panel's eight drawbacks.

- File claims as **verbatim byte spans with addresses**. Decomposition is mode-tagged annotation *over* spans, never prose rewrite: compound candidates must decompose — applicability gates cannot run on a conjunction — but by cuts and tags, not rewording.
- Annotations state filed content **positively**. Never phrase one as the negation of a known failure class ("no necessity is filed") — that pre-asserts the pass-condition inside judge-visible evidence.
- Span boundaries are a judged surface: a span cut to exclude an adjacent qualifier tilts by omission. J1's remit includes the fairness of the cut.
- Preserve garbles as garbles. An intent-reading is a labeled filer artifact judged **against the indeterminate bytes**, not against rival repairs — any determinate reading is a strengthening.
- If the claimant cannot state the claim properly, state it **as intended — not inflated, not deflated** — and ask *before* judges launch. Only the claimant upgrades intent; a judge can only detect the gap. Never silently file a steelman.
- The case file is testimony; the bytes are evidence. Enumerate the bundle from bytes; file-vs-bytes mismatches are J1 verdicts, not clerical fixes.
- **Substrate note.** Where the engine copies the candidate's bytes there is no retype step and the filer's-pen rules hold structurally; the full discipline binds any surface that reintroduces one — loose prose, a pasted corpus, a REPL rendered to text ([`references/substrate-and-cases.md`](references/substrate-and-cases.md)).

### Step 1 — Set the driving question, and characterize the pool for a candidate-blind composer

**You**, holding the filed candidate, name what promotion would assert, decompose it into labeled sub-claims with modes (`fact | inference | prediction | value | belief | experience`), and let the driving question open or close registries — watching for the mode split hiding inside single sentences.

**The composer must not compose from the candidate — only from the domain it lives in.** An isolated characterizer reads the fact and belief space and returns a **descriptive, not expository, summary**: the pool's domains, vocabulary, claim kinds, evidence shapes, authority structure. An expository summary carries claims the composer would build criteria around. The candidate's *domain* stays in scope — else the cover has a hole exactly where the candidate sits — while *which* claim is under test is withheld: no marking, no weight, no position. **Anonymity, not exclusion**, is the safeguard against a composer tailoring criteria to the claim.

### Step 2 — Compose the seats and their anchors, blind to the candidate

The composer receives only the Step-1 characterization and the invariant schema — never the candidate's identity — and composes one judge per seat *for the domain*, plus its anchors. Use S10's schema as the hypershot it is: invariant field names, free-variable values, no concrete content at the frame layer.

```yaml
judge: {Purpose_Bearing_Name}
  purpose: {The_One_Question_This_Judge_Answers}
  claim_modes: [...]
  select:
    - {registry.parameter/aspect}        # sparse — each entry must earn its place
  orientation:
    evidence_standard:        {What_Counts_As_Evidence}
    uncertainty_posture:      {How_Doubt_Resolves_Never_Rounding_Up}
    temporal_horizon:         ...
    stakeholder_scope:        ...
    reversibility:            {What_Binds_The_Verdict_And_What_Reopens_It}
    contradiction_sensitivity: ...
    abstention_boundary:      {Condition_That_Forces_Abstain_With_Reason}
  taxonomy:
    {Closed_Drawback_Class} -> {Qualified_Parameter}
  blind_to: {Everything_Unselected_Stated_Explicitly}
```

Per seat compose a **ten-item anchor set improvised from the domain's own content space** — five clear drawbacks, five clean positives — whose only priors are the categories that compose them. Anchors are per composition, not per role, and are calibration data, not frames: they show the seat discriminates before it judges anything load-bearing.

A judge that cannot fail is not a judge — Step 3 gates it. Why not fewer roles: folding corroboration into grounding makes citations self-vouching; folding coherence in lets well-cited contradictions through. Why not more: the blindness test above.

### Step 3 — Gate the composed cover (zero-model, before any judging)

Check the composed cover and **refuse, typed, on failure**, then retry composition; repeated failure ends the ceremony with a report rather than judging with a defective cover:

- **Validity** — no seat's anchors are all-pass, all-fail, or all-abstain. This is the **positive-control duty applied at composition time**: a seat that cannot fire on its own anchors is a blind instrument, and its `clean` is noise.
- **Coverage** — the seats cover the characterized domain; the candidate lies inside it by construction, so coverage is checkable without ever privileging the claim.
- **Overlap** — seats are pairwise disjoint in their qualified parameters, **or** overlapping with a declared gluing rule. A cover normally overlaps, and gluing happens there: the no-global-section outcome withholds same-jurisdiction conflicts as typed forks rather than blending them.
- **Falsifiability** — every seat has an abstention path and a way to fail.

#### Important — a gate that cannot fail certifies nothing

- **Randomize anchor order and record it.** A set that alternates clean/drawback or walks the taxonomy in listed order is passable by pattern, and 10/10 then shows arithmetic, not detection.
- **Gate on a stated hit-rate against known labels**, not on "not all one way" — the weak form is satisfied by a seat that fires once, and firing once is not discrimination.
- **Anchors must resemble the evidence.** One-line hypotheticals test whether a seat understood its definitions, not whether it can find those conditions in 40 KB of artifact. Draw them from real artifacts of a prior run.
- **Every anchor must be reachable by some class in the seat's taxonomy**, or it can only ever score clean and silently inflates the split.

### Step 4 — Pre-register, separately

Pre-register expected verdicts **before** the run, in a timestamped place the prompts cannot see. A pre-registration whose content appears in a prompt is a work order, not a forecast. Predictions that merely restate the consequences of gates you authored (a value claim will jurisdiction-abstain; an unreachable claim will evidence-abstain) are tautologies — strike them from any accuracy tally.

#### Important — the decision rule has to be able to come out the other way

Name the dataset that would violate the rule you pre-registered; if you cannot, you have written a description of your design and meeting it later tells you nothing. Aggregation has a specific trap: ternary verdicts summed across a handful of seats give small integers, so a rule requiring between-group spread to exceed within-group spread needs every member of a group on one identical value — near-unreachable at three members and a two-value range, so almost any data satisfies it.

- **Say in advance what separation the design can detect**, and pick the number of runs from that rather than from cost. If the answer is "none at this n," report the run as descriptive.
- **Keep resolution.** One `drawbackClass` per item censors magnitude — one defect and four score identically — and destroys the ordering the seats produced. Carry a defect count alongside the class, or every class that fired.
- **Watch for ceiling before you start.** A metric already perfect on an untreated control cannot discriminate anything.

### Step 5 — Execute in clean contexts

Each judge runs as an isolated sub-agent receiving exactly: an identity preamble, its definition, the evidence its input allowlist permits, and the output schema. Nothing else — not the claimant's identity (authorship is never a parameter: partitioned out by address where the substrate has one, masked in the evidence where it does not), not the other judges, not the composer's expectations, not the purpose of the exercise. **Definitions carry all rigor; task text carries none** — no highlighted questions, no named drawback classes, no embedded expectations.

**The seat's ground block carries relevant context only.** What a cold-started seat needs in order to look is ground — `{Authorship_And_Provenance_Of_The_Bundle}`, `{Addresses_And_Where_To_Read}`, `{What_Counts_As_Evidence_Here}`. What the composer believes it will find is not: a seat handed a true expectation returns it, and the record cannot separate that from a verdict. One question sorts them: *does this let the seat look, or does it tell the seat what looking will turn up?* **The probe the composer already ran falls on the second side** — failure mode 2's channel moving once more. A held expectation has one destination and it is not a prompt: the un-tool, which ends the tool call and addresses the collaborator instead ([`references/AMBIENT.md`](references/AMBIENT.md) rule 21(a); the `spark-steering` skill, § *Ask first — the un-tool*; why, in full: `prompt-engineering` best practice 6). The run where pre-registration, clean contexts and an audit seat were all in place and none of them discharged this: [`references/substrate-and-cases.md`](references/substrate-and-cases.md).

Output schema per item:

```
item: <id>
verdict: clean | drawback | abstain
drawbackClass: <closed class> | null
abstainReason: jurisdiction | evidence | null
rationale: <shortest deciding span, plus one sentence of why>
```

At the session layer a short rationale citing the deciding span aids the human read. Where a record layer exists, **keep model prose out of it** and render explanations at read time over the typed fields ([`references/substrate-and-cases.md`](references/substrate-and-cases.md)).

Blindness to the candidate is a *composition-time* property, not a standing one: criteria are built without knowing which claim is under test, then applied to it on the judgement forward pass, where the instantiated judge does see it. The temporal split is the safeguard.

Two blindnesses, never conflated: evidence-facing (J3's base excludes the candidate's own citation chain) and verdict-facing (no belief-facing judge ever sees another's output — that is J4's seat alone).

### Step 6 — Audit

J4 runs after, over the judges' prompts and verdict records **plus** the composer's artifacts — the Step-1 characterization, the composed definitions and anchors, the composer's disclosures (masking edits, digest curation, non-spawn rationales), and the pre-registrations. The composer's packaging is a first-class target — leakage, steering, filing direction, curation tilt — and so is the characterization, read for the **salience leak** below. Non-spawn rationales are demonstrated, not asserted: "untestable as composed" must be shown against the pool's contents, never by the party whose filing created the unreachability. Bias is conserved under correction — audit the vector, not just the magnitude.

### Step 7 — Compose and dispose

Compose by the gates: registered judges only; a J4-role verdict in composition input refuses; a verdict from an excluded or inapplicable judge refuses (an inapplicable judge may only jurisdiction-abstain); zero surviving verdicts is a typed refusal — a selection failure, not an opinion. Then dispose per item:

- **promote** / **promote-refined** / **promote-weakened** — with dependency notes and audit caveats carried, never dropped
- **merit-refuse** — value-mode merit refuses on all-jurisdiction-abstain; the panel records the user's values as grounded declarations, never ratifies them; keystone values (load-bearing for other items' coherence) are surfaced to whoever gates
- **abstain-disclosed** — an abstention guaranteed by the composition's own design is disclosed as "untestable as composed," never as neutral silence
- **remand** — misquote-family grounding drawbacks indict the filing, not the claimant; refile and re-judge, and a remand interpreted-around is a paraphrased verdict
- **thesis-with-falsifier** — universality claims promote carrying their standing counterexample challenge; corroboration for them is failed counterexamples, honestly attempted
- Construal forks — two isolated judges resolving the same ambiguity oppositely — compose like overlaps: a typed fork in the record, never a silent blend

### Standing-model reframing (dated pointer — July 20, 2026)

Ratified as principle, builds nothing: the enum tokens and the Step-7 grammar stand until a separately gated build changes them, with **the user gating whether standing moves**. Full statement: [`references/standing-model-reframing.md`](references/standing-model-reframing.md).

## Failure modes — watch for these in yourself

Eight, each bought by a real run. **Filing inflation** — "adding rigor" to the user's claim before judging it, the most damaging because it feels like service. **Steering** — expectation content in task text, or relocated into annotation phrasing after task text is cleaned; the channel moves, so audit for the content, not the location. **Tautological calibration** — counting the consequences of your own gates as forecasts. **Designed silence read as neutrality.** **The friendlier vector** — after a harshness correction, residuals flipping uniformly claimant-favorable. **The unauditable layer** — evidence-universe curation is invisible from inside the panel, and that seat belongs to humans. **The salience leak** — the candidate made conspicuous by rarity, vocabulary, or ordering once the direct channel is closed. **The censored dimension** — a drawback class that could not fire, logged as a wording error; a dead class is a filter and filters have direction, so map what it censored onto whatever you are comparing, and audit silence with the same weight as findings. Each in full, with its run: [`references/failure-modes.md`](references/failure-modes.md).

## Range

The same skeleton composed water-chemistry, comedy, and methodology judges in consecutive hands, with no judge, taxonomy, or anchor carried between them. When the context surprises you, compose new judges into the seats.
