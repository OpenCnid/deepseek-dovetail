# Reference material

Two kinds of file live here, and the difference is the whole point of this page.

- **Mirrors** — records this skill's claims cite, copied byte-for-byte from the
  originating repository so a claim and the bytes it was written against travel
  together. Never edited.
- **Restatements** — this repository's own prose, carrying the substance of
  something external in portable form. Edited freely, because they carry no
  byte-identity claim.

A reader checking a claim needs to know which one they are holding. The tables
below say so for every file in this directory.

## Why anything is mirrored at all

`docs/FINDINGS.md` records what four self-play runs bought, and every finding
names its source. Discipline 8 asks a reader to verify against the bytes rather
than trust a summary — so the bytes have to be reachable, or the discipline is
advice this repository does not itself follow.

They were reachable by link once. That is no longer good enough: the originating
repository is deprecated and will be archived or deleted, and a citation that
depends on someone else's repository resolving is a citation with an expiry date.
Mirroring moves the check inside this repository, where nothing outside it has to
survive for the check to work.

## These mirrors are canonical

**On any question about what a mirrored record says, the copy here is the
answer.** It is the artifact the claim was pinned to and the only one guaranteed
to still exist.

The originating repository is credited throughout as provenance. It is not an
authority over these copies — it cannot adjudicate a divergence it will not be
present for. The bytes were verified equal at the recorded commit, so what was
canonical there is what is canonical here; the authority moved, the bytes did not.

**A mirror is never edited, and nothing is appended inside one.** Byte-identity
is the only property that justifies copying a record rather than restating it,
and an edit — a provenance header most of all — destroys exactly that property.
Provenance lives on this page instead.

## Mirrors

Extracted at commit `07bd744` and **verified by git blob SHA against the source**,
compared rather than assumed. Sizes are the LF-normalised bytes as committed here.

| File | Origin path | Bytes | Blob SHA (verified) |
|---|---|---|---|
| `DOUBTS_WORKSPACE.md` | `docs/architecture/DOUBTS_WORKSPACE.md` | 37,176 | `083aa8d5f3d383a34205e8f4c83cb2c1c97fd2b7` |
| `earth_figure_factbase.md` | `fixtures/doubts_workspace/earth_figure_factbase.md` | 36,651 | `854b3bedd12cf6405f53aba97b50f1362e6df780` |
| `PRIMITIVE_ENCODING_AUDIT.md` | `docs/product/epistemic-support/PRIMITIVE_ENCODING_AUDIT.md` | 16,903 | `710f73212edc85a6e210f21daeba151032c732fb` |
| `COMPLEXITY_CONVOCATION_VALIDATION.md` | `.claude/skills/complexity-convocation/VALIDATION.md` | 4,292 | `0c2b97f99536788c967802e8d136c165ff3a5054` |

**Use the blob SHA, not a file digest.** A git blob SHA is computed over the
normalised content, so it is the same on a CRLF checkout and an LF one. A plain
`sha256sum` is not: this repository normalises to LF on commit, so a CRLF working
copy and its committed blob differ in byte count and digest with nothing having
changed. A digest that "doesn't match" is usually line endings rather than drift,
which is why no digest column appears above.

Check a mirror from inside this repository, with nothing else installed:

```
git hash-object references/{Mirrored_File}
```

Equal to the recorded blob SHA, or it is not the record.

## Restatements and this repository's own records

| File | What it is |
|---|---|
| `measurement-bounds.md` | The self-contained measurement and reporting contract this skill cites. |
| `measurement-and-reporting.md` | Detailed local restatement of the measurement contract; not a byte-pinned mirror. |
| `discipline-cases.md` | Worked cases behind the disciplines in `SKILL.md`. This repository's own. |
| `ground-block-failure.md` | The ground-block contamination failure at full length. This repository's own. |

## Record this skill deliberately does not carry

Cited-records-only is the scope: a record travels because a claim here needs it,
and nothing travels because it is nearby or interesting.

- **`.claude/rules/prompt-authoring.md`** — the authoring gate, restated in full in
  [`AGENTS.md`](../../../docs/self-play/AGENTS.md). No claim here cites it by rule number, so
  the restatement is sufficient and the bytes are not needed.

**The source-restatement boundary:** a claim needs external bytes only when its
meaning cannot be stated and checked locally. The measurement contract is now
fully restated in `measurement-bounds.md`; `prompt-authoring.md` is likewise
restated because no claim here needs its original rule-number surface.
