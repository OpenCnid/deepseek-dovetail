# Third-party notices and licensing posture

This public source repository combines verbatim OpenCnid Dovetail material with DSH-specific adaptations and new package/build/test code. No single replacement license is asserted over those distinct bodies of work.

## Source and provenance

- Repository: `https://github.com/OpenCnid/dovetail.git`
- Commit: `69f89e3322847fb11665980c16598494a9eacca0`
- Commit date: `2026-08-11T11:19:05-05:00`
- Materializer lock: `upstream.lock.json` (SHA-256 for every vendored file and reviewed deletion)

The upstream repository root states CC BY 4.0 for covered prose/scripts, while every packaged skill's adjacent license remains authoritative for that skill. `better-skill-creator` is Apache-2.0 and its required `NOTICE` is preserved byte-for-byte. The other seven generated directories preserve their adjacent `LICENSE.md` byte-for-byte. Prompt Engineering also preserves its upstream `NOTICE`.

Prompt Engineering, Self Play, and Subagent Composition preserve attribution to Matthew Murphy/Lexideck in their adjacent notices/licenses. SPARK Steering preserves the inherited SPARK provenance, including *The Design Space of Agentic Systems* (arXiv:2508.01581), in the adapted references and adjacent license.

Nothing in this package implies endorsement by OpenCnid, Anthropic, Matthew Murphy/Lexideck, the SPARK authors, or DeepSeek. Existing upstream terms are not altered.

## Runtime dependency notice

The package directly depends on `yaml@2.9.0` by Eemeli Aro to parse DSH-compatible YAML in the `upsum` package-resource helper. It is distributed under the ISC license:

> Copyright Eemeli Aro <eemeli@gmail.com>
>
> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Verbatim generated files

The following package paths are copied byte-for-byte from the pinned source:

- `dist/skills/better-skill-creator/LICENSE.txt`
- `dist/skills/better-skill-creator/NOTICE`
- `dist/skills/hypershot-protocol/LICENSE.md`
- `dist/skills/judge-composition/LICENSE.md`
- `dist/skills/judge-composition/references/failure-modes.md`
- `dist/skills/judge-composition/references/substrate-and-cases.md`
- `dist/skills/judge-composition/references/thesis-and-provenance.md`
- `dist/skills/prompt-engineering/LICENSE.md`
- `dist/skills/prompt-engineering/NOTICE`
- `dist/skills/self-play/LICENSE.md`
- `dist/skills/self-play/references/discipline-cases.md`
- `dist/skills/self-play/references/ground-block-failure.md`
- `dist/skills/self-play/references/measurement-and-reporting.md`
- `dist/skills/self-play/references/measurement-bounds.md`
- `dist/skills/spark-steering/LICENSE.md`
- `dist/skills/subagent-composition/LICENSE.md`
- `dist/skills/subagent-composition/references/provenance.md`
- `dist/skills/upsum/LICENSE.md`

## Adapted generated files

Every `SKILL.md` under `dist/skills` is a DSH adaptation. These additional generated paths are DSH adaptations or new compatibility resources under `ports/dsh/skills`:

- `better-skill-creator/requirements.txt`
- `better-skill-creator/references/dsh-distribution.md`
- `better-skill-creator/references/dsh-evaluation.md`
- `better-skill-creator/references/dsh-frontmatter.md`
- `better-skill-creator/scripts/quick_validate.py`
- `better-skill-creator/scripts/run_eval.py`
- `judge-composition/references/dsh-ceremony.md`
- `self-play/references/dsh-isolation.md`
- `self-play/references/README.md`
- `spark-steering/references/steer-1-levers.md`
- `spark-steering/references/steer-3-costs.md`
- `subagent-composition/references/dsh-subagents.md`
- `upsum/scripts/checks.py`
- `upsum/scripts/parse-frontmatter.mjs`

Original pinned bytes for every adapted upstream file remain under `vendor/dovetail` and are hashed in `upstream.lock.json`; generated output is never the editing source. The reviewed-deletion manifest and lock enumerate incompatible or unreachable upstream resources omitted from the runtime artifact.

## New code

`src/`, `scripts/`, `tests/`, the bundle patch, DSH overlays without an upstream counterpart, and repository documentation are new adapter/build/test work. The owner has not selected public license terms for that work. The GitHub repository is publicly visible, while the npm package remains `private: true`, unpublished, and declared `SEE LICENSE IN THIRD_PARTY_NOTICES.md`. Do not infer a license grant from public visibility or publish the npm package without owner approval.
