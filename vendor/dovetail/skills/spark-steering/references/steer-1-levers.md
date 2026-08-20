# Steer-1: SPARK axis diagnosis and levers

Derived from `ALL-PRIMITIVES.json` (373 primitives, 7 wave files) against
`PRIMITIVE-SCHEMA.md`. For each axis: the self-observable signature of a
deficit on that axis, then the highest-leverage-per-cost primitives that move
it. Capped at 5 levers/axis, 25 rows total. Every lever cites a corpus
primitive by its exact `### ` heading.

## S — Skills

**Signature:** the obvious tool runs, returns a correct-shaped result, and
nothing errored or was denied — but the output is shallow, generic, or wrong
in a way that re-running the same call won't fix. Nothing is missing or
blocked; the ceiling on what this configuration can *do* is just low.

| Lever | Corpus primitive | Cost |
|---|---|---|
| Raise the pinned model tier (optionally `[1m]` context) for the whole session | `Model_Selection_Setting` | one `settings.json` key edit |
| Pin just one spawned subagent to a stronger model, without changing the session default | `Agent_Model_Override_Param` | one `Agent()` call parameter |
| Spawn under a different named persona to inherit its bundled tool-allowlist / ability profile (Explore vs Plan vs general-purpose) | `Agent_Subagent_Type_Persona_Enum` | choice of `subagent_type`, no install |
| Flip an already-installed plugin's `enabledPlugins` key on to gain its whole commands+agents+hooks+tools bundle at once | `Enabled_Plugins_Toggle` | one boolean in `settings.json` |
| Author, test, grade, and package a brand-new skill when nothing existing covers the gap | `skill-creator (skill-creator:skill-creator)` | expensive: a full build-test-grade subagent loop — use only when the four cheap levers above genuinely don't reach |

## P — Personalities

**Signature:** the friction is about *who decides and when they're told*, not
about what's possible or known. The session notices it is interrupting for
things the user didn't need to weigh in on, or conversely is guessing through
a decision the user actually wanted asked — and re-running with more tool
access or more facts would not change that.

| Lever | Corpus primitive | Cost |
|---|---|---|
| Gate a side-effecting skill so only an explicit human command can trigger it, never the model deciding alone | `Skill_Invocation_Control_Fields` | one YAML frontmatter field (`disable-model-invocation`/`user-invocable`) |
| Flag an out-of-scope issue as a clickable chip instead of interrupting the current turn to ask about it | `Spawn_Background_Suggestion_Task` | one tool call, no user wait |
| Retract a previously-raised suggestion before the user acts on it | `Dismiss_Suggestion_Task` | one tool call, idempotent no-op if already actioned |
| Render a Connect-button card instead of performing a connection yourself when a call fails on auth | `MCP_Registry_Suggest_Connectors_Card` | one tool call; leaves the consent click to the user |
| Unilaterally end the session rather than continuing to defer turn-by-turn to an abusive user | `EndConversation_Tool` | expensive/rare: terminal, irreversible — the one lever here that withdraws entirely |

### The un-tool: addressing the user is itself the P lever

**Added 2026-07-19 by Matt; not present in the original 373-primitive survey.**

The five levers above all move toward *less* interruption, and the survey
concluded no lever existed for the opposite direction. That conclusion was an
artifact of the method, not a fact about the harness.

Every primitive in the corpus was found by enumerating things with a **surface**
— a tool schema, a config file, a flag. Declining to call a tool and instead
addressing the user in the chat channel has no schema, so a survey built on
surfaces could not see it. It is the **un-tool**: the P-axis move that consists
of not making a move.

| Lever | Surface | Cost |
|---|---|---|
| Ask the user the question, in the chat channel, instead of guessing through it | (none — this is the un-tool) | one turn of the user's attention; the cheapest lever in the corpus and the only one that adds no permanent configuration |

**Why this is not merely "ask a question."** In PCF's construction the base
category `I` is user instructions and task contexts, and every axis is tied to
it by an anchoring functor `p_X : C_X → I` [§2.4.2]; a covering family
`{U_i → U}` is a localized refinement [§2.4.1]. Asking the user takes an
underdetermined instruction `U` and returns a family of clarified
sub-instructions that jointly determine it — **a Grothendieck cover in the base
category.** The sheaf condition then requires those clarifications agree on
overlaps, which is exactly the constraint that a user's answers must be mutually
consistent to be usable.

This is why axis-enumeration was structurally blind to it: a cover in `I` is not
an object in any `C_X`. It does not live on an axis; it refines what the axes
are anchored to. The *decision* to ask is P. The *effect* lands in `I`.

> **Provenance.** The base category, anchoring functors, and covering families
> are the paper's [§2.4.1–2.4.2]. Reading "ask the user" as a cover in `I` is
> **our extension, not the paper's claim.** It is recorded as an extension so it
> can be rejected without touching anything the paper actually says.

**Practical consequence.** When the diagnosis is "this should have asked and
didn't," the move is available and costs almost nothing — it is not a missing
capability. Reach for it *before* any lever that installs permanent
configuration, because it is the only one that resolves ambiguity at the source
rather than routing around it.

## A — Approaches

**Signature:** the *work itself* would be identical whether it ran inline,
delegated, or parallelized — only the sequencing or ownership is wrong. The
session is doing five independent things in one linear thread, or is stalled
because step 3 needs step 1's result and nothing is tracking that dependency.

| Lever | Corpus primitive | Cost |
|---|---|---|
| Add `context: fork` + `agent: <type>` to a SKILL.md so invoking it dispatches into an isolated subagent instead of loading instructions inline | `context:fork + agent:<type> skill-dispatch frontmatter` | two YAML fields, authored once |
| Flip `run_in_background: true` on a shell call to decouple its completion from the current turn's sequencing | `Bash_Background_Execution` | one boolean parameter |
| Delegate a self-contained sub-task to an independent agent with its own context instead of doing it inline | `Agent_Spawn_Subagent` | a fresh context window + tool budget per spawn — "the expensive path" by its own description |
| Resume a previously-spawned agent from its own transcript instead of respawning a cold one | `SendMessage_Resume_Or_Direct_Agent` | one message call, cheaper than a fresh spawn |
| Have Claude author and run a resumable JS orchestration script (`agent()`/`pipeline()`) fanning out up to 1,000 subagents outside the conversation's context window | `Dynamic_Workflows_Orchestration_Runtime` | expensive: a background runtime feature (v2.1.154+) — reaches decomposition scale nothing else here can |

## R — Resources

**Signature:** a tool call fails on permission or denial, a file sits outside
the working directory, a name shows up in a roster but calling it throws
`InputValidationError`, or a needed external service has no connector. What
to do next is well-defined — the session just can't reach the lever yet.

| Lever | Corpus primitive | Cost |
|---|---|---|
| Call ToolSearch on the tool's exact name to resolve a deferred tool's full schema before calling it | `ToolSearch_Deferred_Schema_Loader` | one extra tool call — the tool was already in scope, just unloaded |
| Add a `Tool(pattern)` rule to `permissions.allow` so a whole class of call stops needing an interactive prompt | `Permission_Allow_Deny_Rule_Syntax` | one `settings.json` line |
| Ask the user to approve filesystem access outside the current working directory (named path or native picker) | `Request_Directory_Access` | one tool call + a user-approval beat |
| Search the global connector registry and surface a Connect card for a not-yet-installed external system | `MCP_Registry_Search_Available_Connectors` | two tool calls (search, then suggest) + a user click to finish connecting |
| Disable the execution sandbox for one Bash call to reach whatever it was constraining | `Bash_Sandbox_Bypass_Flag` | expensive/last-resort: named "dangerously" in its own schema — try the four above first |

## K — Knowledge

**Signature:** the session is re-deriving the same fact from scratch each
time, asking the user to repaste something it was told before, or guessing at
a project convention instead of citing it. The gap is that nothing durable
holds the fact — a tool that could fetch it isn't the bottleneck.

| Lever | Corpus primitive | Cost |
|---|---|---|
| Write a `CLAUDE.md` at the project root so standing project knowledge loads automatically every session, unprompted | `Claude_Md_Project_Instruction_File` | one markdown file, zero runtime tool calls |
| Write a memory entry plus its index link so a fact survives past this session for future ones to retrieve | `Memory_Index_File` | one file write per fact + one index-line update |
| Package reusable procedural knowledge into a SKILL.md that Claude pulls into context automatically when its description matches | `Skill_Definition_File` | authoring a SKILL.md (name+description at minimum) |
| Full-text search prior sessions' transcripts for a fact or decision instead of re-deriving or re-asking for it | `Session_Full_Text_Search` | one tool call, no authoring, but scoped to what already happened |
| Check what connectors are already installed before assuming no knowledge source reaches a given system | `MCP_Registry_List_Installed_Connectors` | one tool call — inventories what you already know you can reach |

## Confusable pairs

- **S vs R** — "I can't do X" reads as a missing tool (R) when the tool is
  present and the real issue is that it was invoked shallowly or the wrong
  way (S). Tell: check the roster first. If a capable tool/skill is already
  in scope and simply produced a weak result, it's S — swap model tier or
  persona, don't go hunting for a new connector.
- **R vs K** — a search/query tool returning nothing reads as "the resource
  doesn't exist" (R) when it's actually a retrieval-formulation gap (K) — the
  registry or index has it, the query just missed. Tell: reissue with
  different keywords before concluding via `Request_Directory_Access` or a
  connector search that the resource is genuinely absent.
- **P vs A** — pausing mid-task to ask the user gets "fixed" by better task
  decomposition (A) when the real issue is that the question shouldn't have
  interrupted at all (P), or vice versa. Tell: if what's being asked is a
  values/scope call only the user can make, it's P (defer via
  `Spawn_Background_Suggestion_Task` or a gated skill, not a chat question);
  if it's "what order do these independent steps run in," it's A.
- **A vs R** — spawning many subagents and running slow reads as "need more
  compute/budget" (R) when the actual fix is fewer, better-sequenced calls
  (A). Tell: if the identical work fits into fewer calls with no new tool or
  permission, it was a decomposition problem, not a resource ceiling.

## Uncovered

- **P axis, "ask more" direction.** Every P primitive the corpus surfaced
  moves toward *less* interruption (`Spawn_Background_Suggestion_Task`,
  `Skill_Invocation_Control_Fields`, `EndConversation_Tool` as withdrawal).
  The one primitive aimed at deliberately interrupting to ask —
  `Env_Var_Enable_Ask_User_Question_Tool` — is confidence: observed-name-only,
  its behavioral effect inferred, not exercised. A session that is
  under-asking (steamrolling an ambiguous instruction) has no strong,
  demonstrated lever in this corpus; only a name-level hint.
- **K axis retrieval mechanics.** `Memory_Index_File` is a flat bulleted
  list with no scoring, ranking, or staleness signal observed. Nothing in
  the corpus documents how a session should tell "my knowledge index is
  stale" apart from "my query was just badly phrased" — both would look
  identical from the outside.
- **A axis, the top lever is undemonstrated.** `Dynamic_Workflows_Orchestration_Runtime`
  is the single highest-scoring A primitive in the whole corpus (A=10) but
  carries confidence: documented, not observed — no primitive shows an actual
  run, so the exact trigger point for "reach for a workflow script now
  instead of subagents" is inferred from docs, not demonstrated behavior.
