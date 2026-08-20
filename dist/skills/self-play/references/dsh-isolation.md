# DSH clean-room isolation

## Visibility record

For each child, retain a JSON or Markdown matrix with the role, DSH provider/tool name, foreground/background choice, workspace root, allowed tools, discoverable skill roots, candidate delivery path, and every withheld variable. Record how each assertion was verified. A claim that a configuration *should* hide something is not run evidence.

## Cold-child requirement

Use the tool instance bound to the DSH `spawn` provider. Reject the run if only `subagent_fork` is visible. Fork seeds all completed parent turns and therefore can carry the builder's prediction, authorship, candidate analysis, or hidden label even though the current turn is absent.

## Files and skills

Cold conversation history does not imply a clean filesystem. A child can still read candidate files, project instructions, project/user skills, package-bundled skills, logs, and fixtures allowed by its tool view. Use distinct disposable workspaces, remove or hide the exact skill consumer when a no-skill arm is required, and inspect the resulting session messages for catalogs and `<skill_content>` blocks.

## Honest outcomes

- `VALID`: every required withheld input was absent and the run settled.
- `CONTAMINATED`: a withheld input, candidate marker, skill catalog, or body reached the role. Retain the run and exclude it from conclusions.
- `UNMEASURED`: the run may be usable, but a claimed usage, duration, catalog/body check, or other measure was unavailable.
- `FAILED`: a required role did not settle or a control invalidated the instrument.

Never translate missing data to zero or a clean verdict.
