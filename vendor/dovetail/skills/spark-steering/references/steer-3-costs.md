# Steer 3 — What capabilities charge after they're installed

Source: `D:\PCF\spark-map-corpus\ALL-PRIMITIVES.json` (373 primitives, 7 wave files, CLI 2.1.215). Every claim below traces to a primitive heading in that corpus; heading names are exact and greppable.

Framing debt this file pays down: installation is a one-time line item and gets scrutinized like one. The recurring charge — paid on every subsequent turn whether or not the capability does anything that turn — is the one nobody budgets for. Twelve classes below; none is free, none scales to zero.

---

## Cost classes

### 1. Context-Tax-Per-Turn
**Charged:** every turn, before any work happens, regardless of relevance to that turn's task.
**Bearer:** agent (context budget consumed up front); user secondarily (slower, costlier turns with less headroom left for the actual task).
**Examples:** `Skill-tool namespace assembly (mixed provenance)`, `Claude_Md_Project_Instruction_File`, `Compaction_Survival_Table`
**Basis:** stated — the skill listing is described as "injected once per turn"; the compaction survival table gives the literal re-injection accounting (invoked skill bodies "re-injected, capped at 5,000 tokens per skill and 25,000 tokens total; oldest dropped first").

### 2. Retrieval/Dispatch Dilution
**Charged:** every time the model (or a router/classifier) must pick the right skill, command, or tool out of a growing, undifferentiated catalog.
**Bearer:** agent.
**Examples:** `Skill_Definition_File`, `Skill_Invocation_Control_Fields`, `Mcp_Tool_Naming_Convention`, `ToolSearch_Deferred_Schema_Loader`
**Basis:** reasoned — the corpus states the mechanism (skills merge into "one undifferentiated listing each turn"; deferred MCP tools are name-only until fetched) but never measures a degradation in match quality as the catalog grows. `ToolSearch` is a mitigation for one slice of this (schema payload deferred), not a fix for the underlying dispatch-accuracy problem.

### 3. Permission-Rule Evaluation Surface
**Charged:** every tool call, for the life of the configuration — rules don't get "used up," they get re-evaluated forever.
**Bearer:** both — agent pays the per-call check; user pays for having to write/predict correct rules as the rule set grows.
**Examples:** `Permission_Allow_Deny_Rule_Syntax`, `Permission_Rules_Merge_Exception`
**Basis:** stated — permission rules are the one settings category documented to *merge across every scope rather than override*, so adding a rule anywhere in the five-layer hierarchy is additive and permanent, never silently superseded by a narrower scope.

### 4. Approval/Interruption Load (on the user)
**Charged:** each side-effecting action the agent reaches for that isn't pre-approved — grows with the number of installed capabilities capable of reaching something new.
**Bearer:** user.
**Examples:** `Permission_Mode_Cli_Flags`, `user-invocable / disable-model-invocation matrix`, `Security_Approval_Dialog_Managed_Settings`, `fewer-permission-prompts`
**Basis:** stated — the existence of a dedicated skill ("scan your transcripts for common read-only Bash and MCP tool calls, then add a prioritized allowlist... to reduce permission prompts") is itself corpus evidence that unmanaged prompt volume is a recognized, named cost worth a countermeasure.

### 5. Autonomous-Action Audit Burden
**Charged:** after the fact, once, per background/scheduled/classifier-approved action — someone has to check that unsupervised work did the right thing.
**Bearer:** user.
**Examples:** `Background_Task_Completion_Notification`, `Scheduled_Task_Recurring_Cron_Creation`, `Auto_Mode_Permission_Classifier`, `Agent_Teams_Implicit_Session`
**Basis:** reasoned — the corpus states the delivery mechanics ("the completion notification arrives in a later turn; it is never something you write yourself") but does not itself name "verification burden" as a cost; that follows from an action having occurred with no one watching in real time.

### 6. Hook Execution Overhead Per Matching Event
**Charged:** every time a matching lifecycle event fires (`PostToolUse`, `UserPromptSubmit`, …), for as long as the hook stays configured — unconditionally, task-relevance notwithstanding.
**Bearer:** both — agent's turn is held up to the configured timeout; user experiences the resulting latency or an async rewake interruption.
**Examples:** `Hook_Command_Type`, `Hook_Prompt_Type`, `Hook_Conditional_If_Gate`, `Hook_Output_Contract`
**Basis:** stated — the command form carries an explicit `timeout` that "bounds how long the gate can hold up the turn"; the prompt form additionally spends "the hook's own small reasoning pass" (a second model call) on every firing, not just install.

### 7. MCP/Tool-Surface Registration Overhead
**Charged:** every session that loads the registering scope — schema discovery at startup, plus a permanently wider reach surface every permission/audit pass must now account for.
**Bearer:** both — agent carries the schema/discovery cost; user carries the larger trust surface to reason about.
**Examples:** `Project_Mcp_Server_File`, `Global_Mcp_Server_Registration`, `Mcp_Allow_Deny_Server_Lists`
**Basis:** stated — "each server registered here becomes a whole new reachable tool surface for the session," and registration has three separate standing tiers (project `.mcp.json`, global `~/.claude.json`, plugin-bundled) that all persist simultaneously rather than replacing one another.

### 8. Subagent/Orchestration Token Multiplier
**Charged:** every spawn — each delegate gets a fresh, full context window paid for cold, not a discounted continuation of the parent's.
**Bearer:** both — agent/compute budget directly; user pays the resulting bill.
**Examples:** `Agent_Team_Token_Multiplier`, `Agent_Spawn_Subagent`, `Dynamic_Workflows_Orchestration_Runtime`, `Subagent_Transcript_Nesting`
**Basis:** stated — agent teams are quantified at "approximately 7x more tokens than standard sessions... because each teammate maintains its own context window"; dynamic workflows can fan out to "up to 1,000 agents total per run"; the `Agent` tool's own schema calls itself "the expensive path" precisely because "each spawn starts cold and re-derives context you already have."

### 9. Persistent-State Accretion
**Charged:** continuously — every session, every subagent, every externalized tool-result blob adds to a store that never shrinks on its own and must eventually be read back, searched, or reconciled.
**Bearer:** agent (future retrieval/context cost of a growing corpus).
**Examples:** `Session_Filesystem_Persistence`, `Externalized_Tool_Result_Blobs`, `Per_Project_Memory_Directory`, `Memory_Consolidation_Skill`
**Basis:** reasoned — the corpus documents the storage mechanism directly (one `.jsonl` per session, one file per externalized blob, a per-project `memory/` folder created lazily and never observed to self-prune) but the claim that this becomes a *cost* is inferred from the fact that a dedicated skill exists whose stated job is "merge duplicates, fix stale facts, prune the index" — maintenance work that would not be needed if accretion were free.

### 10. Settings-Layer Reasoning Cost
**Charged:** every time a human or the agent must predict what a setting actually resolves to, given how many scopes are in play — cost scales with the number of active scopes, not with any one setting.
**Bearer:** user primarily (this is the person debugging "why didn't my rule take effect").
**Examples:** `Settings_Precedence_Order`, `Managed_Settings_Delivery_Precedence_Ladder`, `Sandbox_Boolean_vs_Array_Managed_Merge`
**Basis:** stated — a five-layer precedence order (managed policy > CLI flags > local settings > project settings > user settings) where "arrays merge across layers; scalars override," plus a *second*, differently-shaped four-tier delivery ladder for managed policy specifically, plus a documented per-key-type exception where booleans are managed-only but arrays merge and can be locally widened.

### 11. New Failure-Mode Surface From Escalation/Bypass Flags
**Charged:** every subsequent turn the bypass stays reachable — this is a standing risk carried forward, not a single decision made once at install.
**Bearer:** both — the agent takes the escalation action; the user bears the consequence if it's wrong.
**Examples:** `Bash_Sandbox_Bypass_Flag`, `PowerShell_Sandbox_Bypass_Flag`, `DangerouslyDisableSandbox_Escape_Hatch`, `Bypass_Permissions_Root_Guard`
**Basis:** stated — the escape hatch is not a one-off human override; documentation says "when a command fails because of sandbox restrictions, Claude analyzes the failure and **may retry** the command with the `dangerouslyDisableSandbox` parameter" — an autonomous, repeatable decision, closeable only by an administrator setting `allowUnsandboxedCommands: false`.

### 12. Compaction/Recovery Overhead From Larger Loaded State
**Charged:** compaction fires more often, and loses more per pass, the more state (skills, memory, subagent output, tool results) is loaded into a session; checkpoint snapshots accumulate every single prompt regardless of whether the prompt changed anything.
**Bearer:** agent (fidelity loss, thrashing risk).
**Examples:** `Automatic_Context_Compaction`, `Auto_Compaction_Thrashing_Error`, `Checkpoint_Automatic_Snapshot`, `Checkpoint_Bash_Blindspot`
**Basis:** stated — the thrashing error is an explicit, named failure mode: "if a single file or tool output is so large that context refills immediately after each summary, Claude Code stops auto-compacting after a few attempts and shows an error instead of looping"; checkpointing snapshots "before every prompt" and keeps only "the 100 most recent," with shell-driven file changes silently excluded from the safety net.

---

## Saturation symptoms

A session can notice each of these about itself, from inside, without instrumentation:

1. **A loaded skill's body sat in context for the whole turn and nothing in the response drew on it.** — K oversubscribed (retrieval surface returned something, but not something used) — reasoned.
2. **The same tool name gets resolved through `ToolSearch` twice in one session.** — R oversubscribed (a resource-fetch step repeated because its own result wasn't tracked) — reasoned, from the tool's own guidance against loading tools "one at a time" / redundantly.
3. **Predicting whether a specific command will prompt requires checking more than one settings file.** — A oversubscribed (the gating logic has more active layers than can be held in working reasoning) — stated, given the documented five-layer precedence plus a named merge exception.
4. **The same command prefix has triggered an approval prompt more than once this session.** — P oversubscribed (the interruption channel is being spent on a question already answered) — stated, this is exactly the pattern `fewer-permission-prompts` is built to scan for and eliminate.
5. **Auto-compaction fires twice in quick succession and frees little the second time.** — R oversubscribed (the context resource is genuinely exhausted, not merely full) — stated, this is the documented precondition for the thrashing error.
6. **A subagent is about to be spawned for a task finishable in the next one or two direct tool calls.** — A oversubscribed (delegation overhead exceeds the work being delegated) — reasoned, from the `Agent` tool's own framing of itself as "the expensive path" for exactly this reason.
7. **A background or scheduled result lands and the session has to reconstruct why it was started.** — P oversubscribed (audit/context debt from unsupervised action) — reasoned, from the notification arriving strictly "in a later turn" with no carried rationale.
8. **A routine, previously-successful action gets re-blocked or re-prompted by a classifier/hook gate later in the same session.** — A oversubscribed (the gating layer has stopped distinguishing signal from noise) — stated, per Auto Mode's own documented trade-off: "fewer interruptions, but repeated blocks re-engage prompting."

---

## The cheap move first

- **Need one independent fact or read:** reaching for `Agent_Spawn_Subagent` (cold full-context spawn) → a direct `Read`/`Grep`/`Glob`, or a single `ToolSearch` fetch, when the need is one lookup, not a decomposed task.
- **Want to stop re-approving the same command:** reaching for `Permission_Mode_Cli_Flags` in bypass form or session-wide `dontAsk` → one scoped `Permission_Allow_Deny_Rule_Syntax` entry for the specific prefix, or running `fewer-permission-prompts` once.
- **Want an action to happen automatically going forward:** wiring a new MCP server plus a hook into every session → a single project `CLAUDE.md` instruction, or one narrowly-`if`-matched `Hook_Conditional_If_Gate` scoped to the exact trigger.
- **Context is running out mid-task:** standing up `Agent_Isolation_Worktree_Mode` or `Dynamic_Workflows_Orchestration_Runtime` to offload the rest of the work → `Manual_Compact_Command` with a focus instruction, reclaiming budget without adding a new orchestration layer to maintain.
- **Want fewer interruptions on a long unattended run:** switching the whole session to `Auto_Mode_Permission_Classifier` or `DontAsk_Mode` → scoping `permissions.allow` to the specific tool patterns the task actually needs.
- **Want a capability "always available":** installing a new `Skill_Definition_File` / `Agent_Definition_File` / MCP server that auto-loads every session → a one-off inline instruction for a single task, or `disable-model-invocation` so the capability only activates on explicit `/name` call instead of sitting in the auto-dispatch pool diluting every future match.

---

## Uncovered

- **Quantified retrieval-accuracy degradation.** No primitive measures how much larger a skill/command/MCP-tool catalog actually degrades correct dispatch; the corpus documents the mechanism (flat, undifferentiated, re-injected listing) but never a rate or threshold. This is precisely the SPARK-paper territory (tier collapse under complexity) the Ground section forbids importing as evidence for this system.
- **Hook/classifier latency in wall-clock terms.** Timeout *ceilings* are documented (`Hook_Command_Type`'s `timeout` field); typical observed run time, and how much of perceived turn latency hooks/classifiers actually add in practice, is not.
- **Plugin/marketplace supply-chain review cost.** `Plugin_Marketplace_Managed_Restrictions` documents the *controls* an org can apply (allowlist marketplaces, block sideload flags) but nothing on the recurring human cost of vetting a plugin before installation.
- **Disk-growth rate for persistent state.** `Session_Filesystem_Persistence`, `Externalized_Tool_Result_Blobs`, and `Per_Project_Memory_Directory` establish that these stores exist and grow unbounded absent `Memory_Consolidation_Skill`, but no primitive gives a size/session or a point at which the accretion becomes operationally expensive (slow search, slow load) rather than merely present.
