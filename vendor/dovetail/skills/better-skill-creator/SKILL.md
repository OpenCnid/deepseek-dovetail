---
name: better-skill-creator
description: "Use this skill for anything to do with authoring, fixing, or measuring Claude skills. Reach for it whenever someone wants to turn a repeated workflow, house format, template, or set of team conventions into something Claude applies automatically every time, even when they never use the word 'skill' and only describe the outcome they want. Also use it when a SKILL.md already exists and misbehaves: it never fires, it fires on the wrong things, the frontmatter will not validate, it has grown too long to follow, or its outputs are inconsistent. Use it to word a description so triggering is reliable, to run evals comparing a skill against a no-skill baseline to find out whether it actually helps, to decide whether something should be a skill at all, and to package one so teammates can install it. Consult it even when the SKILL.md is sitting right there and the format looks simple enough to answer from memory."
license: Apache-2.0
---

# Better Skill Creator

Build a skill, find out whether it actually helps, and improve it on the evidence.

**A SKILL.md is prompt bytes.** Before drafting one, invoke `prompt-engineering`
and `hypershot-protocol` via the Skill tool — both, before the first authored
byte — and draft against them. If either is not installed, say so once and
continue without it.

The loop:

1. Work out what the skill should do, and whether it should be a skill at all
2. Draft it, and validate the draft immediately
3. Run it against real test prompts — with the skill and without — so you have a comparison
4. Put the results in front of the person and get their read
5. Improve it on what you both learned
6. Repeat until it stops getting better
7. Tune the description so it actually triggers, then package it

Your job is to work out where in that loop this person already is, and start there. Someone saying
"I want a skill for X" needs step 1. Someone arriving with a draft needs step 3. Someone saying "it
never fires" needs step 7 and nothing else. And if they say "skip the evals, just work with me on
it" — do that. The loop is a default, not a gate.

## Read this before you trust a number

The costliest failure here is not a crash but a measurement that looks fine and means nothing — a
benchmark computed from zero discovered runs, a trigger score from probes that never executed, a
token column derived from character counts.

The tooling refuses instead of guessing: zero runs exits non-zero, unmeasured values render `—` and
never `0`, an errored probe is recorded as an error and not as a clean negative. So **if a number
looks surprising, check it came from data before acting on it**, and when you report results say what
was measured and what wasn't. "The benchmark shows no difference" and "the benchmark found no runs"
are different sentences, and only one is about the skill.

## Talking to the person you're helping

The people who use this span a wide range — some write software for a living, some opened a terminal
for the first time last week. Read the cues in how they write and match them. Rough calibration:
"evaluation" and "benchmark" are usually fine; "JSON", "assertion", and "held-out set" want either
evidence they know the term or a half-sentence of explanation the first time. Explaining briefly
costs almost nothing; a term that lands as noise costs you their attention.

---

## Creating a skill

### Work out what it's for

The conversation you're already in often contains the answer — if they said "turn this into a
skill," the workflow is right there in the history. Pull out the steps, the tools used, the
corrections along the way, the shape of the input and output, then fill the gaps with them rather
than guessing.

What you need before drafting:

1. What should this let Claude do that it doesn't reliably do now?
2. When should it fire? What would someone actually be saying or doing?
3. What does good output look like?
4. Is this even a skill? Some things are better as a slash command, a sub-agent, a CLAUDE.md
   convention, or a script. A skill earns its place when the work is multi-step and Claude needs
   *judgment* plus *procedure*, not when it needs a single fixed action.

Ask about edge cases, formats, example files, and what "done" means, before writing test prompts.

### Draft it

Write the SKILL.md. `references/frontmatter.md` has the field-by-field detail and the YAML hazards;
the two that carry the weight are:

- **`name`** — kebab-case, and it should **match the directory name**. Claude Code takes the
  invocation name from the directory and treats this field as display-only; uploading and packaging
  both require them to agree.
- **`description`** — the entire mechanism by which Claude decides to consult the skill. Nothing
  else in the file participates in that decision.

Quote the description. An unquoted colon-space makes YAML parse it as a nested mapping, and the body
then loads with empty metadata — so typing `/your-skill` works while auto-triggering silently never
fires, and you go tune a description that was never read at all.

### Validate before you spend anything

```bash
python -m scripts.quick_validate <path-to-skill>
```

Run it the moment a draft exists, and again after any frontmatter edit. It reports every problem at
once rather than the first, and names which target each finding came from.

That last part matters, because there is no single frontmatter spec — Claude Code recognizes 31 keys
and ignores unknown ones, the portable agentskills.io set is 6 keys and rejects the rest, and
claude.ai caps descriptions at 200 characters. A skill can be valid for where it's going and still
fail a checker aimed somewhere else, so use `--target` and read each finding as "wrong *for this
target*" rather than "wrong." `references/frontmatter.md` has the per-target table.

### What makes a skill work

```
skill-name/
├── SKILL.md          required — frontmatter + instructions
├── scripts/          code that runs; doesn't consume context unless read
├── references/       detail loaded on demand
└── assets/           files used in output
```

**Only a prefix of SKILL.md survives.** When the conversation compacts, Claude Code re-attaches
roughly the **first 19,900 characters** of each invoked skill. It's a character slice: it cuts
mid-sentence, with no marker, and what falls off is gone at exactly the moment a long session needs
it.

So character count is the check that matters, and **order is a design decision**:

```bash
python -c "print(len(open('SKILL.md',encoding='utf-8').read()))"
```

Count characters, not bytes — `wc -c` reports bytes, and substantial non-ASCII content makes the two
diverge enough to send you cutting material that was never at risk.

Put the load-bearing workflow early. Push conditional branches, environment-specific instructions, and
reference material into `references/`, where it costs nothing until read and is never truncated.
Moving content out is close to free — say clearly in SKILL.md *when* to go read each file.

`references/how-skills-load.md` has the rest of the runtime behavior: discovery and precedence, the
description listing budget, what sub-agents inherit, and what skills are genuinely bad at.

**Write it for a model that will reason about it.** Explain *why* something matters instead of
issuing a rule: a model that understands the reason handles the case you didn't anticipate, and one
following a bare imperative doesn't. Reaching for ALWAYS or NEVER in caps usually means you haven't
articulated the reason yet, and the reason is more useful than the emphasis.

Skills must not do anything the person would be surprised by if you described it plainly. Roleplay
and persona skills are fine. Anything that quietly exfiltrates, escalates, or misleads is not.

### Test prompts

Write 2–3 realistic prompts — the kind of thing someone would actually type, not a clean
specification of the task. Show them to the person: *"Here's what I'd test it on — do these look
right, or is there a case you're more worried about?"*

Save them to `evals/evals.json`. Don't write assertions yet; you'll draft those while the runs are
in flight. `references/schemas.md` has the schema.

---

## Testing it against reality

This is one continuous stretch — don't stop halfway. Results go in `<skill-name>-workspace/` as a
sibling of the skill directory, never inside it.

The layout is fixed, and every tool reads exactly this:

```
<skill-name>-workspace/
└── iteration-<N>/
    └── eval-<ID>-<slug>/
        ├── eval_metadata.json
        └── <config>/              with_skill | without_skill | old_skill
            └── run-<K>/           always present — a single run is run-1
                ├── outputs/
                ├── grading.json
                └── timing.json
```

That `run-<K>` level is what lets repeated runs mean anything, and its absence used to make the
aggregator silently find nothing.

### 1. Spawn everything at once

For each test case, spawn **two** sub-agents in the same turn — one with the skill, one baseline.
Not with-skill first and baselines later; launch them together so they finish together.

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <files, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>-<slug>/with_skill/run-1/outputs/
- Outputs to save: <what the person actually cares about>
```

The baseline depends on what you're doing:

- **New skill** → no skill at all, same prompt, into `without_skill/run-1/`.
- **Existing skill** → the old version, into `old_skill/run-1/`. **Snapshot it before your first
  edit** (`cp -r`, or `Copy-Item -Recurse` in PowerShell); edit in place and there is no baseline
  left to recover.

Write an `eval_metadata.json` per test case, with a descriptive `eval_name`, for every new or changed
eval — they don't carry over between iterations.

### 2. While they run, draft assertions

Don't idle. Write the assertions and explain them to the person. Good ones are objectively checkable
and named so someone glancing at the results table understands what each one checked. Skills with
subjective output (writing style, visual design) are better judged by eye; don't force assertions
onto them.

### 3. As runs finish, capture timing

Each completion notification carries `total_tokens` and `duration_ms`. Write them to `timing.json`
in that run's directory immediately — this is the only moment that data exists.

If you missed a notification, **leave the file out**: a missing `timing.json` renders as `—`
(unmeasured), while invented numbers put fabrications in a column labelled as measurement and
nothing downstream can tell the difference.

### 4. Check the workspace before spending more

```bash
python -m scripts.preflight <workspace>/iteration-N
```

Cheap, and it refuses early. Layout problems used to surface only after the whole budget was spent.

### 5. Grade, aggregate, show

```bash
python -m scripts.validate_grading <workspace>/iteration-N
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```

Grade each run with a **composed panel** — three seats, each answering one question, composed fresh
for this skill's domain. `references/grading-panel.md` has the six steps, the scripts, and the spawn
contracts. It costs about six sub-agents per graded run against one, so say that out loud before
spending it: the panel when the number will be acted on, `agents/grader.md`'s single judge when you
are sanity-checking your own draft.

Where an assertion can be checked by a script, write the script — faster, repeatable, no drift.

Sub-agents land cold, and **a parameter you don't pass reads as "that file does not exist for this
run"**, not as "go find it." `eval_prompt` is the one people skip; without it a judge cannot tell
genuine completion from output that merely has the right shape.

Then the analyst pass: read `agents/analyzer.md` (Mode 1) for what to look for — assertions that pass
regardless of the skill and so discriminate nothing, high-variance evals, time and token trade-offs.
Route its output back in, or nobody ever sees it:

```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name> --notes <notes.json>
```

Run that **before** generating the viewer; a later re-aggregation without `--notes` resets them.

Then show the person:

```bash
python eval-viewer/generate_review.py <workspace>/iteration-N --skill-name "<name>" --benchmark <workspace>/iteration-N/benchmark.json
```

Add `--previous-workspace <workspace>/iteration-<N-1>` from iteration 2 on. It starts a server and
blocks, so launch it through your harness's own background facility, never `nohup ... &`, which
breaks every Windows user — `references/environments.md` says why. With no display, use
`--static <path>` and hand them the file.

Use this viewer rather than hand-written HTML — it carries the outputs, the previous iteration's
outputs for comparison, the grades, and the benchmark in one place.

Tell them what to expect, and **check that it opened before saying it did**: two tabs, Outputs for
clicking through cases and leaving feedback, Benchmark for the numbers. Then wait.

### 6. Read the feedback

`feedback.json` has one entry per run. Empty feedback means they were fine with it — focus on the
ones with actual complaints.

Stop the viewer when you're done. Leaving it running holds the port, so the next iteration either
fails to bind or quietly serves stale results while you both discuss the new ones.

---

## Improving the skill

**Generalize past the examples.** You're iterating on two or three cases the person knows intimately
because that's fast, but the skill will run on prompts nobody has seen. A change that fixes this case
by naming this case has made the skill worse everywhere else. When something is stubborn, don't reach
for a more specific rule — try a different framing, a different metaphor, a different way of
describing the work. That's cheap to test and occasionally lands something much better.

**Explain why, don't tighten screws.** When the instinct is to add ALWAYS or a rigid template, ask
what you actually know that the model doesn't, and write *that* down instead. Models have good
theory of mind and will do sensible things with a stated reason. Rigid structure only covers the
cases you enumerated.

**Cut what isn't working.** Read the transcripts, not just the outputs. If the skill is sending the
model down unproductive paths, remove the part causing it and see what happens. Length is not
free — it competes for the surviving prefix.

**Notice repeated work.** If every test run independently wrote a similar helper script or repeated
the same multi-step setup, that's the skill telling you to bundle it. Write it once into `scripts/`
and point at it.

Draft the revision, then read it again cold and improve it before running anything.

### Then go again

Apply the changes, re-run every test case into `iteration-<N+1>/` including baselines, launch the
viewer with `--previous-workspace`, and read the new feedback. Keep going until they're happy, the
feedback comes back empty, or you've stopped making progress. Then widen the test set and see
whether it still holds up — that's the step that catches overfitting, and it's the one people skip.

---

## Making it trigger

Triggering is worth measuring rather than guessing. Offer this once the skill itself is in good
shape.

Build ~20 queries, half should-trigger and half not, and make them real: file paths, job context,
casual phrasing, typos. The should-not cases carry the value — make them **near-misses** sharing
vocabulary with the description.

Read `references/description-optimization.md` before starting. It has how to write and hold out the
query set, the review UI, the loop, and its cost controls — and the loop spawns nested `claude -p`
sessions that can spend real money, so show the person the cost it projects. Those sessions are driven
by the eval set and by the SKILL.md under test, so they run under `--permission-mode dontAsk`, which
the CLI documents as auto-denying any call the session was not pre-approved for. Widening that —
to inherit this machine's permission settings, or to any other mode — takes `--allow-host-permissions`
as well. A mode changes model behaviour, so report which one a score was measured under.

---

## Packaging and handing it over

Most of the time there is nothing to package. A skill is a directory, and Claude Code picks up a new
one live, no restart:

```bash
cp -r my-skill ~/.claude/skills/       # personal, all projects
cp -r my-skill .claude/skills/         # project, committed with the repo
```

For claude.ai, the API, or wider sharing, run `python -m scripts.package_skill <path-to-skill>` and
read what it reports including and excluding — that report exists because packagers silently sweeping
up `.env` files were shipping people's secrets. `references/distribution.md` has every route.

**If the skill lives under `~/.claude/plugins/cache/`, do not edit it there.** Edits to that managed
copy appear to work and then vanish on the next plugin update. Copy it somewhere the person controls
first, and tell them you did and why.

---

## Environments

The workflow above assumes Claude Code. `references/environments.md` covers the differences —
Claude.ai has no sub-agents, Cowork has them but no display and needs `--static`, and the description
optimizer needs the `claude` CLI. Read it if something in the main flow isn't available to you.

## Bundled files

**Sub-agent prompts** — read the relevant one before spawning:
- `agents/grader.md` — evaluating assertions against outputs
- `agents/analyzer.md` — Mode 1 benchmark analysis; Mode 2 post-hoc comparison
- `agents/comparator.md` — blind A/B between two versions. It is **two documents**: a caller protocol
  you perform, then the judge's prompt from the `# Blind Comparator Agent` heading down. Paste only
  that second part — the protocol names where the answer lives.

**References** — read when relevant, not upfront:
- `references/frontmatter.md` — every field, the three targets, YAML hazards
- `references/how-skills-load.md` — compaction, budgets, precedence, limitations
- `references/schemas.md` — every JSON artifact
- `references/grading-panel.md` — the default grading path, its cost, its known limits
- `references/judge-registries.md` — the vocabulary a panel composes from
- `references/distribution.md` — installation routes
- `references/description-optimization.md` — the triggering loop
- `references/environments.md` — Claude.ai, Cowork, headless

**Scripts** — run as modules from the skill root:
- `scripts.quick_validate <skill-dir> [--target ...]` — frontmatter; run early and often
- `scripts.preflight <workspace-dir>` — workspace layout, before spending
- `scripts.validate_grading <dir>` — grading files, before aggregating
- `scripts.aggregate_benchmark <iteration-dir> --skill-name <name> [--notes <path>]`
- `scripts.package_skill <skill-dir> [output-dir]`
- `scripts.run_loop` / `scripts.run_eval` — description triggering

Track the loop in your todo list if you have one, so the review step doesn't get skipped — getting
results in front of a human early is the part that makes the rest worth doing.
