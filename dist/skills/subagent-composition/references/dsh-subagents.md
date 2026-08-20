# DSH subagent surfaces

## Contents

- Cold and inherited children
- Foreground and continuable scheduling
- Prompt visibility checklist
- Persistent roles

## Cold and inherited children

At DSH `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca`, the `subagent` tool is bound to the in-process `spawn` provider. Its child begins without the parent's conversation. The `subagent_fork` tool is bound to the in-process `fork` provider and seeds the child with the balanced prefix ending at the last completed parent turn. The current turn is absent, but earlier conclusions and expectations are not.

Both tools accept a display `description`, a task `prompt`, and—when enabled—`run_in_background`. Model, persona, tool filter, and maximum depth belong to the configured tool row. A prompt must not invent additional call fields.

## Foreground and continuable scheduling

Independent tool calls in one assistant message run through DSH's parallel tool pool and their results commit in model order. `run_in_background: false` returns the foreground child's final output after disposal. Continuable background mode instead returns a stable child id at inbox acceptance. It has no collect-result operation on the delegation tool.

`send_message` queues the child's next FIFO turn and returns acceptance, not a reply. `interrupt_agent` requests interruption of the current turn while keeping the child and queued messages. `list_agents` lists continuable identities. The optional child-scoped `report` tool returns selected content to the direct parent. Runtime settlement notices are distinct from child-authored reports.

## Prompt visibility checklist

Record this before a blind run:

| Input | Cold child sees it? | Allowed for this role? |
|---|---:|---:|
| Per-call prompt | yes | |
| Parent completed turns | no (`subagent`); yes (`subagent_fork`) | |
| Current parent turn | no | |
| Workspace files reachable by its tools | composition-dependent | |
| Parent's loaded skill results | not through history in a cold spawn; packaged/project skills may still be discoverable | |
| Expected conclusion or hidden variable | only if leaked through prompt or reachable artifacts | must be no for a blind role |

Blindness is invalid if a hidden input remains readable from the workspace, user/project skills, instructions, logs, or evidence bundle.

## Persistent roles

An agent preset is a directory containing `agent.cordis.yml`. The roster mounts its composition under a standing scope and sessions join that scope. Presets are privileged plugin compositions; author them only when the role recurs and verify every named public package and fixed tool configuration. Variant task content stays in the call prompt.
