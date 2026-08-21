# Skill example capture manifest

These screenshots are documentation examples, not acceptance results or universal effectiveness claims.

- Captured: 2026-08-20
- Host: DeepSeek Harness `v0.1.0-rc.7` web profile
- Bundle: locally packed `deepseek-dovetail@0.1.0`
- Model: GPT-5.6 Terra, default reasoning effort
- Workspace: repository fixture titled `Dovetail Skill Gallery`
- Framing: 1280 × 720 in the real DSH UI; no compositing or fabricated responses

Each example started in a fresh session. The prompt requested a bounded design or preview so documentation capture could not cause unrelated implementation work. Upsum additionally ran with DSH's **Read Only** access preset.

| Screenshot | Prompt |
|---|---|
| `prompt-engineering.png` | `/prompt-engineering Rewrite this vague request into a production-ready prompt: "Review this API." Return the final improved prompt plus three short design notes. Keep the response under 220 words and do not modify files.` |
| `hypershot-protocol.png` | `/hypershot-protocol Create a contamination-free structural example for an incident postmortem. Show the reusable frame and briefly explain three placeholder choices. Keep the response under 220 words; do not modify files.` |
| `better-skill-creator.png` | `/better-skill-creator Draft a minimal DSH skill named release-note-sanitizer. Show valid frontmatter and a three-step workflow; do not install, test, or modify files. Keep the response under 240 words.` |
| `subagent-composition.png` | `/subagent-composition Decide whether to delegate a two-file documentation typo fix. Apply the delegation gate, choose the execution mode, and give a compact return frame. Do not spawn agents or modify files. Keep the response under 200 words.` |
| `judge-composition.png` | `/judge-composition Design a four-seat evaluation panel for a claim that a cache change reduced API latency by 20%. Show each seat's evidence visibility, question, and verdict flow. Do not run the panel.` |
| `self-play.png` | `/self-play Decide whether a self-play experiment is warranted for an untested agent routing threshold. If so, design the smallest controlled gatherer/adversary/evaluator/judge setup with visibility boundaries and a stopping rule. Do not run agents.` |
| `spark-steering.png` | `/spark-steering A shell tool ran successfully, but the resulting incident report is shallow and repetitive. Diagnose the short SPARK axis, test the adjacent alternatives, and recommend one low-cost lever. Keep the response under 220 words; do not use tools or modify files.` |
| `upsum.png` | `/upsum Preview the closeout for this changed documentation session using the current git status. Do not write files. Show the durable record entry, descending-resolution summary, open-work projection, and pre-publish check result. Keep the response under 260 words.` |

The Upsum response reports seven example PNGs because its repository inspection occurred before `upsum.png` itself was saved.
