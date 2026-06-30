# Agent Skills

Bundled [Agent Skills](https://agentskills.io) for AI coding agents working with `ts-openapi-codegen`.

After install:

```bash
cp -r node_modules/ts-openapi-codegen/skills ./openapi-codegen-skills
```

## Install paths by agent

| Agent | Typical path |
|-------|--------------|
| Cursor | `.cursor/skills/` or global `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` |
| Codex / other | project `skills/` or agent-specific skills dir |

Copy or symlink the skill folders from `node_modules/ts-openapi-codegen/skills/`.

## Available skills

| Skill | Purpose | Human docs |
|-------|---------|------------|
| `request-executor-openapi-codegen` | RequestExecutor config, M0–M12, codegen/runtime matrices | [EN](../docs/en/request-executor.md) · [RU](../docs/ru/request-executor.md) |

## RequestExecutor

**Canonical human documentation:** [docs/en/request-executor.md](../docs/en/request-executor.md) · [docs/ru/request-executor.md](../docs/ru/request-executor.md)

The skill is an agent-optimized cheatsheet — decision trees, matrices, and file pointers. Do not duplicate the hub in agent responses; link users to the human doc when explaining concepts.

## Related

- [README.md](../README.md) — project landing
- [docs/README.md](../docs/README.md) — documentation index
