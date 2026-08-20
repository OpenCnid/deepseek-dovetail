---
name: judge-composition
description: >-
  Compose a differently blinded panel for grounding, coherence, independent corroboration, and audit of a claim, belief, record entry, or artifact. Use when asked to judge, vet, adjudicate, promote, reconcile, or impartially evaluate a self-authored claim; when a judge panel or promotion candidate is mentioned; or when authorship and expected verdict must stay out of evaluator prompts. Requires cold DSH subagents for blinded seats.
---

# Judge Composition for DSH

Load `prompt-engineering` and `hypershot-protocol` with the lowercase `skill` tool before authoring judge prompts unless their `<skill_content>` blocks are already present. Apply the `subagent-composition` delegation gate. If the effective DSH composition lacks cold `subagent`, disclose that blindness cannot be established and stop rather than using `subagent_fork`.

## Differently blinded responsibilities

- **Grounding:** decide whether cited bytes say what the candidate claims. It checks fidelity, not truth.
- **Coherence:** test internal consistency and entailment against the admitted record. It does not weigh external evidence.
- **Corroboration:** seek support independent of the candidate's citation chain, within the user's evidence allowlist.
- **Audit:** examine the other prompts, admitted evidence, disclosures, verdicts, abstentions, and composition choices. It reports findings; it never supplies or gates the panel verdict.

Roles are jurisdictions, not characters. Each has a declared blindness, evidence boundary, abstention path, and falsifiable way to fail. Use `clean | drawback | abstain`; an abstention says `jurisdiction` or `evidence` rather than becoming a clean score.

## Ceremony

1. File the candidate as verbatim addressed spans. Decompose compound claims with annotations over the spans; do not silently strengthen, weaken, or repair them.
2. State the driving question and claim modes. Keep authorship, the expected result, and desired verdict out of blinded inputs.
3. Have a cold characterizer describe the domain's vocabulary, claim kinds, authority, and evidence forms without marking which claim is under test.
4. Compose seats from that characterization, blind to the candidate's identity. Gate coverage, overlap/gluing, anchor discrimination, abstention, and falsifiability before spending model calls.
5. Pre-register expected outcomes and the result that would falsify them in an artifact the prompts cannot read.
6. Launch ready, independent non-audit seats together as cold `subagent` calls. Use `run_in_background: false` when the audit step needs all their returned outputs.
7. Verify every load-bearing child claim against its cited bytes.
8. Run the audit seat only after all judge prompts, evidence bundles, disclosures, verdicts, and pre-registration artifacts exist.
9. Compose without averaging away jurisdiction conflicts. Preserve typed forks, abstentions, dependency notes, and audit caveats.

## Seat input frame

```md
{Seat_Purpose_And_Jurisdiction}

## Blindness
You do not receive {Withheld_Input_That_Would_Steer_This_Seat}.

## Evidence
- {Permitted_Address_Or_Bundle}

## Task
Evaluate only {Seat_Question}. Abstain outside that jurisdiction.

## Return
item: {id}
verdict: {clean|drawback|abstain}
drawbackClass: {Closed_Class|null}
abstainReason: {jurisdiction|evidence|null}
rationale: {Shortest_Deciding_Span_And_One_Sentence}
```

The same evidence bundle goes only to seats whose jurisdiction admits it. The corroboration seat excludes the candidate's own citation chain. No belief-facing seat sees another verdict; only audit does.

The adapted checklist is in `references/dsh-ceremony.md`; upstream thesis, failure-mode, and provenance references remain available on demand under `references/`.
