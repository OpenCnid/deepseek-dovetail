---
name: upsum
description: "Close a working session: append what happened to a growing record, re-derive a fixed-length summary that holds the newest entries at full detail and collapses the oldest toward a label, carry forward what is still open, and run the pre-publish checks that catch what a session forgets. Invoke by name at the end of a session, before publishing, or when handing work to a later session. UPdate and SUMmarize."
disable-model-invocation: true
---

# Upsum

> A session ends whether or not anyone writes it down. This decides which parts survive.

Two jobs, and they are opposites. The **record** grows and never forgets. The **summary** stays the same size forever and forgets on purpose. Running them together is what stops a project's memory from becoming either a swamp or a slogan.

**This does not fire on its own.** It is typed, like `spark-steering`, because a close ceremony that volunteered itself would run on every throwaway session and become the tax it exists to prevent.

The cost is that it has to be remembered, and that is worth stating as a standing reminder rather than filing as a flaw: **if work happened, close the session.** The loop below is not a proposal — it comes from two years of daily practice; what is new is only its wiring into a skill.

## Where things live

Repo-relative, and stated so a reader can change them:

| Path | Lifetime |
|---|---|
| `.upsum/RECORD.md` | append-only, never edited |
| `.upsum/SUMMARY.md` | rewritten whole, fixed length |
| `TODO.md` | rewritten whole, repo root, human-visible |

If a repo already uses different paths, follow the repo. Do not create a second convention beside an existing one.

## 1. Append to the record

One entry per session, appended, dated. Nothing above it is ever edited — an append-only file is the only kind whose history you can trust without reading a diff.

```md
## {ISO_Date} · {Short_Phrase_Naming_The_Session}

**Did** — {What_Changed_In_The_Repository_Not_What_Was_Discussed}
**Learned** — {What_Is_Now_Known_That_Was_Not_Known_Before}
**Decided** — {Decision_And_Who_Made_It}
**Left** — {What_Was_Deliberately_Not_Done_And_Why}
```

Write **Did** from the diff, not from memory of the conversation. A session that discussed a great deal and changed three files did three things. Conflating intent with change is how a record starts lying, and it lies in the flattering direction.

**Left** is the slot people skip and the one a later session needs most. A thing not done for a reason is different from a thing forgotten, and only the record can tell them apart.

## 2. Re-derive the summary at descending resolution

Rewrite `.upsum/SUMMARY.md` whole, from the *entire* record, under a fixed budget — 250 words unless the repo sets another. Treat it as a target with slack rather than a boundary; a hundred characters either way is fine, and trimming a good sentence to hit a number is worse than the number. What must not happen is the budget growing *because the record did*. That is the whole mechanism: a summary allowed to grow stops being a summary and becomes a second record, and nobody reads two.

**Resolution is allocated by recency. The newest entry keeps nearly all its detail; the oldest collapse toward a label.** Old work is done, and what stays useful about it is that it happened. Recent work is what you are still holding, so its specifics are still actionable — that is what makes it worth the words.

An entry therefore ages by *losing resolution*, never by being dropped. Nothing falls out of the summary; things get smaller until they are a name:

```
oldest   {Whole_Stretch_Of_Work_Collapsed_To_Its_Label}
  ⋮      {Compressed_To_Its_Outcome_Only}
  ⋮      {Kept_In_Brief_With_Its_One_Distinguishing_Detail}
newest   {Near_Full_Detail_Lightly_Trimmed_Of_Redundancy}
```

This is what keeps the word count honest without anyone policing it: every session, the old end shrinks by a little and frees exactly the room the new end needs. The budget holds by construction rather than by discipline.

The newest pass is a *trim*, not a rewrite. Drop redundancy and tighten phrasing; keep the specifics. A newest entry that has been summarized down to its topic has lost the thing that made it worth keeping at full resolution.

## 3. Carry forward what is open

Rewrite `TODO.md` whole from the record plus this session. Every item states what it is blocked on and who can unblock it, because an item with no owner and no blocker is a wish.

```md
- [ ] {What_Would_Be_Done} — blocked on {Named_Person_Decision_Or_Condition}
```

Close items that are done. An accumulating TODO nobody prunes is read once and then never again.

## 4. Run the checks before publishing

```bash
python "$SKILL_DIR/scripts/checks.py" .
```

`$SKILL_DIR` is this skill's own directory — Claude Code names it as **Base
directory for this skill** when the skill loads. The trailing `.` is the
repository being checked, which is the working directory, not the skill.

Those two are different places and the script only lives in one of them. A
repository-relative path resolves only inside a clone of `upsum` itself, which
is the one place this ceremony is not being run: installed, the script sits at
`~/.claude/skills/upsum/scripts/checks.py` and nothing under the working
directory answers to it.

Four checks, each of which exists because it caught something real that no one was looking for:

- **Inside baseball** — references that resolve only for readers inside one organisation: a private repository by name, a rule number in a document the reader does not have, a local filesystem path, a citation whose target does not ship. A pointer is fine if its target ships in the same repository, is a public URL, or is a separately installable skill named plainly.
- **Repo state** — uncommitted work, unpushed branches, and installed copies that have drifted from their source. Work that exists in one place is work you are one reinstall from losing.
- **Skill health** — for any `SKILL.md`: body length against the ~19,900-character surviving prefix, frontmatter validity, and `name` matching its directory. A skill over the prefix loses its tail silently, and the tail is usually the newest thing in it.
- **Credit and licence travel** — whether `LICENSE` and attribution survive the install path the README documents. Credit that stays behind in the repository is not credit.

The script reports `UNMEASURED` for anything it could not measure and never `clean`. A check that could not run is not a check that passed, and the difference is the whole point of running it.

The exit code follows measurement, not findings — `0` every check ran, `1` at least one could not, `2` the script itself failed. So a non-zero exit is a gap in the evidence, not a verdict on the repository.

Findings are yours to act on or dismiss — the script does not gate. But dismissing one silently is how it comes back.

## 5. Refresh the README, if this session publishes

Only when the session ends in a commit, push, or release. Check three things and change nothing else:

- The install path still works from a clean machine — run it against a scratch directory rather than reading it.
- What the repository says it carries matches what it carries.
- The limits section is still true. A limits section that has quietly become false is worse than none, because it was believed.

## Failure modes

**Summarizing the conversation instead of the work.** The record is about what changed. A session can be long, interesting, and correctly recorded as one line.

**Letting the summary grow.** The moment the budget is treated as a target rather than a ceiling, the summary becomes a worse copy of the record.

**Running the checks and narrating the output.** Findings are for acting on. A close that lists four warnings and does nothing has cost a session and bought a paragraph.

**Writing `Left` as an apology.** It is a handover slot, not a confession. "Not done because the owner gates it" is complete; "sorry, ran out of time" is not.

**Closing a session that changed nothing.** Then there is nothing to append. Say so and stop — an entry recording that a session happened is noise in a file whose value is that it contains only signal.
