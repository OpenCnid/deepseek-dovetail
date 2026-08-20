# What a self-play run is allowed to measure

Read this before choosing the shape of a run, and again before reporting a
number. It expands § *When to use — and when not* in `SKILL.md`.

## The two legitimate shapes

A test of an instruction takes one of exactly two shapes:

1. **Conformance to a stated engineering target.** The target is a threshold the
   instruction's own specification fixes, readable off a single run. A session
   that finds no target stated **states one before choosing the shape of the
   test.**
2. **A named failure-mode probe.** Leak, over-trigger, break. You name the
   failure in advance and go looking for it.

**Ordering is the whole countermeasure.** Name the target first, and the
familiar with-versus-without comparison stops being the only available shape.
The tell that you skipped this: a test about to run whose outcome is already
entailed, reached for because a comparison was closer to hand than a target.

## The barred shape, and why

An arm that is the artifact's **absence** — no skill, no prompt, an unspecified
base model — is a *null*, not a version. A run holding a null arm asks "does the
instruction help", and the answer follows from what an instruction is rather
than from anything the run observed. It reports the design, not the behaviour,
and it spends credits doing so.

"Does it help", "with versus without", and "beats the baseline" each name that
same premise.

## The carve-out, at its boundary

These stay in scope, because both arms are shipped artifacts each carrying its
own spec:

- **Version A of an instruction against version B.** Iterating on a skill
  requires confirming the new version still does what the old one did, which is
  why regression and functional-equivalence comparisons sit inside.
- **Reachability checks** — that a surface validates, and that a named
  non-test caller reaches it.

A zero-cost harness of this kind establishes reachability and equivalence. It
reports nothing about adoption or benefit, and saying otherwise is the barred
claim wearing the carve-out's clothes.

## What a published claim carries

A measured claim reads with its raw numbers attached and its control state
visible:

```
{Metric_Name}: {Raw_Numerator}/{Raw_Denominator} · tool calls {Count}
· control {discriminated | silent} · target {Threshold_And_Where_Stated}
```

A claim whose control field reads `silent` publishes as **noise**. A run that
found no target stated publishes the target it set before running.

## Correctness is the whole score

A scoring function has one term: correctness. Tool-call counts, token counts,
and dollars are descriptive figures that travel beside every correctness figure
in the same table, and what they describe is the *cost* of that correctness. An
arm that cuts tokens or calls while correctness drops has failed on the one term
there is.

## When a null becomes a finding

Exactly one thing turns a null, a win, or any surprising result into a finding:
**the same run's positive control discriminated on the same instrument** — a
condition built so that an instrument which works would visibly catch it, then
shown to be caught.

### The positive control is not the barred null arm

These look identical and are not, and confusing them makes the rule above appear
to contradict the rule two sections up. The difference is **what is on trial**:

|  | The barred null arm | The required positive control |
|---|---|---|
| On trial | the **candidate** | the **instrument** |
| The arm removes | the artifact under test | nothing — it *adds* a case whose answer is already known |
| Answers | "is the candidate better than nothing?" — entailed | "can this apparatus detect the thing at all?" — not entailed |

A positive control does **not** require removing the candidate, and it does not
require a treated/untreated pair at all. It requires a case where **the correct
answer is known in advance and is the one the instrument claims it can produce.**

For a single candidate with no second arm, that is: a flagrantly easy item the
candidate must get right, or a planted defect it must catch. If it misses that,
every "absent", "clean", and "no effect" the run produced is noise rather than
evidence, because the run has not shown it can produce a positive at all.

**And it must span, not hug.** A positive control at zero distance from the
candidate — an item the candidate authored, a canary in the instrument's own
prompt — measures format compliance, not detection. Place it far enough along the
manipulated axis that passing it means something.

**A negative control is the mirror:** a case the instrument must *reject*. If it
fires, the apparatus is contaminated and the run stops. Note the asymmetry with a
planted defect *inside the target*, which is a different object — there, tripping
the trap is the finding. Say which of the two any given control is, because "the
control fired" means stop in one case and success in the other.

A run whose control stayed silent was a blind test. Its output is noise, the
report names it noise, and the number stays unbelieved until a discriminating
control exists. An outlier earns belief by reproducing on a re-run.

This is discipline 6 of `SKILL.md` stated as a reporting rule rather than a
design rule; they are the same duty read from two ends.

## Provenance

These bounds are the self-play skill's portable, installable measurement
contract. The requirements a run depends on are stated here in full; the related
`measurement-and-reporting.md` preserves the detailed rule discussion as a local
restatement. Neither document needs an external research record or a byte-pinned
mirror to determine how a self-play run is measured or reported.

The named sections are local navigation labels. They preserve the distinctions
the skill needs — engineering target versus failure-mode probe, correctness
versus cost, positive versus negative control, and a verification observed to
fail — without claiming authority from an unrelated research track.
