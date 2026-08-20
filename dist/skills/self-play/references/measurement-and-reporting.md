# Measurement and reporting

> Local restatement. This file is no longer a byte-pinned mirror and does not
> require access to an external research record.

Sessions that design a test, run a drill or benchmark, or publish a number
work under `AGENTS.md` rules 8, 11, 19(c) and 20, which keep their numbers
here and stay citable by them. Two failures produced these rules: a null
published as a finding, and a test whose outcome was settled before it ran.

## Rule 20 — instructions are specifications, and a test of one names its target first

An instruction in this repository is a specification. A test of one takes
one of exactly two shapes: it measures conformance to a stated engineering
target, or it probes a named failure mode — leak, over-trigger, break. The
target is a threshold the instruction's own spec fixes, readable off a
single run; a session that finds no target stated states one before
choosing the shape of the test. Ordering is the whole countermeasure — the
target comes first, and the familiar comparison stops being the only
available shape. The tell is a test about to run whose outcome is entailed,
reached for because a comparison was closer to hand than a target: the
**nearby-attractor** trap, `docs/architecture/HARNESS_SELF_MODEL.md` §11,
where a session validated a newly authored skill against a no-skill arm and
asked whether it helped.

A well-engineered instruction constrains the model to its spec. That an
instructed run differs from, and outscores, an unspecified base-model run
follows from what an instruction is, so a run measuring that returns its
own premise and spends credits for it (rules 7 and 8 applied to testing).
"Does it help", "with versus without", and "beats the baseline" each name
that premise, and a measurement whose outcome is fixed by construction
reports the design rather than the behaviour. Measurement harnesses here
have one subject: a tooling intervention.

**The carve-out, at its boundary.** Reachability checks and
functional-equivalence or regression comparisons stay in scope — the
rule-20-safe half, `docs/architecture/SELF_DESCRIBING_SURFACES.md` §5.
The carve-out covers exactly the runs where both arms are shipped
artifacts each carrying its own spec: version A of an instruction against
version B, or a deterministic check that a surface validates and that a
named non-test caller reaches. Iterating on a skill requires confirming
the new version still does what the old one did, which is why that sits
inside. An arm that is the artifact's absence — no skill, no prompt, an
unspecified base model — is a null rather than a version, so a run holding
a null arm is the barred new-versus-null baseline and is answered by the
entailment above. Whether *exposing* a surface improves model behaviour is
a separately owner-gated paid probe (same record, §5), reached through
rule 7; a zero-paid harness records its script, so it establishes
reachability and equivalence and reports nothing about adoption.

## Rule 8 — tooling shape closes failure classes, and correctness is the whole score

Behavioral failure classes close by tooling shape, and prompt text
reinforces what tooling already holds (owner doctrine). A scoring function
in this repository has one term: correctness. Tool-call counts, citation
counts, token counts and dollars are descriptive figures that travel beside
every correctness figure in the same table, and what they describe is the
cost of that correctness. An arm that cuts tokens or calls while
correctness drops has failed on the one term there is.

## Rule 11 — a null becomes a finding once the run's own control discriminated

Reports publish the counts and the raw numbers behind every rate. Exactly
one thing turns a null, a win, or any surprising result into a finding: the
same run's positive control discriminated on the same instrument — a
condition built so the untreated arm demonstrably fails, then shown to move
under the treatment. A run whose control stayed
silent was a blind test; its output is noise, the report names it noise, and
the number stays unbelieved until a discriminating control exists. This is
19(c) applied to experiments: an experiment seen to produce a positive is
the one whose null carries information. An outlier earns belief by
reproducing on a re-run. Rule 12 owns where the resulting claim lands.

## Rule 19(c) — a check becomes a verification by having been watched failing

Rule 19's root is that an action rests on an observation of state rather
than a belief about it; clause (c) is the measurement one and travels
alone. Exactly one thing makes a check a `verification`: a run of that
check, against planted breakage, that came back red where someone read the
result. The judge-program drills — `test:judge-intake`, `test:judge-panel`,
`test:judge-convocation`, `test:support-oracle` — each ship a
`--negative-control` that exits 3 when every planted break is detected,
which is what that observation looks like once it is automated. An argument
that a check could fail is a description of the check; the observed red run
is what makes it a verification, and a check holding only the argument
reports success on whatever it is pointed at, including bytes about to
become registration hashes. Trusting a pass means knowing what would make
it fail and having watched that happen.

## What a published claim carries

A measured claim in this repository reads with its raw numbers attached and
its control state visible:

    {Metric_Name}: {Raw_Numerator}/{Raw_Denominator} · tool calls {Count}
    · control {discriminated | silent} · target {Threshold_And_Where_Stated}

A claim whose control field reads `silent` publishes as noise. A run that
found no target stated publishes the target it set before running. Rule 18
governs retrieving the record a target is read from; where the target is
underdetermined by the task, rule 21(a) is the cheaper move than inventing one.
