---
name: upsum
description: >-
  Close a changed working session by appending what happened to a durable record, re-deriving a fixed-budget summary at descending resolution, rewriting the open-work projection, and running pre-publish checks that distinguish findings from measurement failures. Invoke /upsum at session end, before publishing, or for handoff. If repository work is unchanged, report that and create no close record.
disable-model-invocation: true
---

# Upsum for DSH

This workflow is explicit-only. It preserves work, not conversation. First inspect the target repository's status and diff. If repository work did not change during the session, say so and stop without creating a record entry.

## Paths

Follow an existing repository convention when present. Otherwise use:

| Path | Rule |
|---|---|
| `.upsum/RECORD.md` | append-only; never edit earlier entries |
| `.upsum/SUMMARY.md` | rewrite whole under a fixed budget |
| `TODO.md` | rewrite whole as the current open-work projection |

## 1. Append the changed work

Derive **Did** from the diff and filesystem evidence, not from chat intent.

```md
## {ISO_Date} · {Session_Label}

**Did** — {Repository_Changes}
**Learned** — {New_Evidence}
**Decided** — {Decision_And_Owner}
**Left** — {Deliberately_Open_Work_And_Reason}
```

Append only. Preserve uncertainty and distinguish an observation from a measurement failure.

## 2. Re-derive the fixed-budget summary

Read the entire record and rewrite `.upsum/SUMMARY.md` to the repository's fixed budget, defaulting to about 250 words. Keep the newest entry near full detail, compress middle entries to outcomes and distinguishing facts, and collapse the oldest work toward labels. No entry disappears; it loses resolution with age. The budget must not grow with the record.

## 3. Project open work

Rewrite root `TODO.md` from the record and current session. Every item names the concrete work, its blocker/condition, and who can unblock it. Remove completed items.

## 4. Run package-relative checks

The loaded DSH `<skill_resources>` block reports this installed skill's base directory. Resolve `scripts/checks.py` against that base, and pass the target workspace explicitly:

```text
python {DSH_Reported_Skill_Base}/scripts/checks.py {Absolute_Target_Workspace}
```

Do not infer the skill base from the target workspace, a user home, or a development checkout. Do not run the script merely because the plugin loaded; run it only as this explicit close step.

Exit status reports measurement integrity: `0` means all checks ran with no withheld coverage, `1` means at least one check was unmeasured or partially blind, and `2` means the script failed. Findings do not change the exit status and still require review. Never translate `UNMEASURED` into clean.

## 5. Publishing refresh

Only when the session publishes, verify the documented install path against a scratch location, confirm the repository inventory, and recheck the limitations section. Do not change unrelated prose.

## Failure modes

- summarizing the discussion instead of the changed repository;
- growing the summary instead of reducing older resolution;
- narrating findings without acting or explicitly dismissing them;
- turning **Left** into an apology rather than a handoff;
- writing a close entry for an unchanged session; or
- resolving `checks.py` from a user-home or Claude/Codex path.
