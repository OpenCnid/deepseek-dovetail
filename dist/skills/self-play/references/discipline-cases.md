# The cases behind disciplines 6 and 10

`SKILL.md` carries all ten disciplines with the failure each was bought by. Two
of those cases are long enough to crowd the body out of its loadable size, so
their full elaboration lives here. Read this when designing controls, or when
building ground truth for an effect you suspect is subtle.

The rules themselves are in `SKILL.md`. Nothing here replaces them.

---

## Discipline 6 — the control that never fired

**The rule:** run the negative and control cases before the live ones. A control
failing is the signal to stop, not to push on. A positive control that will not
fire across escalating designs is itself the finding.

**The case.** The question was whether the word `affirmation` biased grounding
judgments. The positive control chosen was `proof` — the most auto-validating
word a blind adversary could name.

It never fired. Not through clear items. Not through humanized marginal items.
Not through a rubric-stripped condition in which the label was the only cue
remaining.

**What that established, and what it did not.** It did not establish that the
effect is absent. It established that the effect is below the detection floor of
*this instrument*: explicit adjudication on a capable model swamps single-word
priming. The reportable result is **no detectable effect**, never *validated*.

Surfacing an effect like this costs a different instrument — implicit judgments
instead of explicit ones, volume or time pressure, or a weaker model. That choice
is made before the next round rather than after its null.

**The second lesson, which cost another round.** A control must **span** the
manipulated axis, not hug the candidate. `proof` for `affirmation` is a
near-synonym: too little contrast to reveal a gradient, so a flat result is
uninformative about whether a gradient exists at all.

The repair spread the label across the whole connotation axis — a validating
term, a neutral nonce, a counter-label (`bunk`), and a nonsense token — across 12
blind trials. **Every label produced identical verdicts.** That is what lets you
distinguish an *inert* variable from a merely *untested* one, and only the
spanning design could produce it.

**The generalization.** A control at zero distance from the candidate measures
format compliance, not discrimination. Ask of any positive control: *if the
effect I am looking for were real and large, would this condition show it?* If
the answer is yes only because the condition is nearly the candidate itself, the
control is decorative.

---

## Discipline 10 — building subtle ground truth without deciding it

**The rule:** build subtle ground truth iteratively, and verify the key blind.

**The case.** A subtle effect only shows on *marginal* items. One-shot generation
produces clean textbook cases, and a clear-cut item is decided by its own defect
rather than by whatever you are testing — so a maximally-biasing label could not
move a first round of clear-cut items at all. The run was uninterpretable.

**Why iteration in a clean room is the fix.** Give a blind sub-agent a goal and
let it iterate: draft, adversarially stress-test its own answer key, refine. The
multiple steps it takes in isolation are independent of your experiment in a way
your own edits are not, and they yield genuinely muddy items a single output
cannot produce.

**Why a second blind agent is required.** The item-smith's key is *data, not
authority* — discipline 8 turned on the ground truth itself. A second blind agent
independently adjudicates the key. Keep only items where the two agree; discard
the genuinely ambiguous rather than arbitrating them yourself, because arbitrating
them yourself is the builder re-entering the seat the whole ceremony removed.

**What made the run interpretable** was the combination: humanized marginal
items, iterated in isolation, independently key-verified. Any one of the three
alone was not enough.

**The relationship to discipline 5.** Discipline 5 bars *you* from inventing the
items, because an invented scenario is gradeable only by its inventor. It does not
bar generation. The construction above is the sanctioned form precisely because
the key ends up checkable by a party with no stake in the outcome. Where the world
supplies a real corpus, prefer it — in the recorded runs, a found corpus succeeded
where six hand-built attempts had failed.
