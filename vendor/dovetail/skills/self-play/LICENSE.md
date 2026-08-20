# License

The prose in this skill — `SKILL.md`, the reference files under `references/`,
and this file — is licensed under **Creative Commons Attribution 4.0
International (CC BY 4.0)**:
https://creativecommons.org/licenses/by/4.0/

© OpenCnid Labs.

You are free to share and adapt this material for any purpose, including
commercially, provided you give appropriate credit, link to the license, and
indicate if changes were made.

## What this license does not cover

The **prompt-engineering toolkit and the hypershot technique** that this skill
applies, and the **framing of self-play as an AlphaGo-shaped search over text**,
are the work of [Matthew Murphy](https://github.com/gusthemole), published as the
Lexideck prompt engineering curriculum. This repository's contribution is the
application of that method to clean-room evaluation of LLM-assisted features, and
the record of what running it produced. Credit the source of the method, not just
the application.

The **mirrored records under `references/`** are copied byte-for-byte from the
repositories they originated in, so that a claim and the bytes it was written
against travel together. [`references/README.md`](references/README.md) says
which files are mirrors and which are this skill's own prose, and records a blob
SHA for each mirror. A mirror is a derived artifact and never an authority over
its source, and its internal links point at the layout it came from rather than
this one — deliberately, since repairing one would end the byte-identity the
recorded SHA exists to verify.

This paragraph used to describe vendored skills under `vendor/`, pointing at a
`NOTICE` and a `docs/DEPENDENCIES.md`. None of the three ship with this skill;
the clause covered nothing and is replaced rather than kept.

The **Claude Code sub-agent mechanics** the probes exercise are Anthropic's
product behavior, documented at https://code.claude.com/docs/en/sub-agents.
Observations about that behavior are ours; the behavior is theirs.
