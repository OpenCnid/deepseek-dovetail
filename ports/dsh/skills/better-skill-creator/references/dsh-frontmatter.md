# DSH skill format

## Contents

- Discovery and precedence
- Frontmatter
- Invocation and loading
- Resources

## Discovery and precedence

The pinned `@deepseek-ai/dsh-skill-filesystem@0.1.0-rc.7` scans one level below each configured root. A directory bundle is `<root>/<name>/SKILL.md`; a flat `<root>/<name>.md` is also supported. Within one host/scope layer, lower rank wins: project `.dsh/skills` 100, project `.agents/skills` 200, custom roots 300, user DSH 400, user agents 500, and bundled 600. The Dovetail provider supplies only its package-local bundled root, so project and user copies keep precedence.

## Frontmatter

Required:

```yaml
---
name: kebab-case-name
description: >-
  Complete function and trigger conditions, at most 480 normalized characters.
---
```

Recognized optional fields include `whenToUse`, `metadata`, `disable-model-invocation`, and `user-invocable`. Invocation values accept YAML booleans and documented boolean strings, but portable DSH skills should use booleans. Invalid camel-case invocation keys or wrong invocation value types reject the whole skill instead of falling back to permissive behavior.

Run:

```text
python {Better_Skill_Creator_Base}/scripts/quick_validate.py {Target_Skill_Directory}
```

The adapted validator parses YAML, matches the name to the directory, normalizes the description, enforces 480 characters, validates invocation fields, requires a nonempty body, and checks direct relative resources remain inside the skill.

## Invocation and loading

The `dsh-tool-skill` consumer publishes only model-invocable names/descriptions when its exact `skill` tool is visible. A whitespace-bounded `/name` in direct user input loads a user-invocable body even when model invocation is disabled. The injected or tool-loaded result includes `<skill_content>`, `<skill_resources>`, and `<skill_instructions>`. A body already present through explicit invocation must not call `skill` again for itself.

## Resources

Directory providers report an absolute base directory. Resolve only paths explicitly referenced by the instructions, reject traversal and symlink escapes, and keep the target workspace argument separate from the package resource directory. Package load never executes scripts.
