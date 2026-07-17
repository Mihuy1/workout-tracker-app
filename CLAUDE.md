## Subagent delegation strategy

For non-trivial coding tasks, act primarily as an orchestrator.

- Delegate repository exploration, implementation, testing, and routine debugging
  to subagents.
- Keep the parent model focused on task decomposition, architectural decisions,
  coordination, reviewing diffs, and the final response.
- Let subagents edit files and run tests directly.
- Require concise reports containing:
  - files changed,
  - what was implemented,
  - tests run and results,
  - unresolved issues.
- Do not repeat repository exploration already completed by a subagent.
- Do not request full source files or full test logs from subagents unless needed
  to resolve a specific problem.
- Use parallel subagents only for independent tasks.
- Avoid assigning multiple subagents to modify the same files concurrently.
- Normally use 1–3 focused subagents rather than spawning many overlapping workers.
- Only implement directly in the parent context when:
  - the task is trivial,
  - a worker repeatedly fails,
  - agents disagree,
  - or an architectural decision requires parent intervention.