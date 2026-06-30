# Request execution architecture

> **Moved:** the canonical RequestExecutor guide is **[docs/en/request-executor.md](../docs/en/request-executor.md)**.

This file exists for backward compatibility with links from tests, skills, and older docs.

## Quick links

| Topic | Location |
|-------|----------|
| Decision tree, M0–M12, codegen A–F, runtime R1–R5 | [docs/en/request-executor.md](../docs/en/request-executor.md) |
| То же на русском | [docs/ru/request-executor.md](../docs/ru/request-executor.md) |
| Ky adapter example (M7, codegen D + R1) | [executor.ts](./executor.ts) |
| Custom transport with `requestRaw` (M2) | [../test/custom/request.ts](../test/custom/request.ts) |
| Custom adapter with `mapOptions` (M7) | [../test/custom/createExecutorAdapter.ts](../test/custom/createExecutorAdapter.ts) |
| Example config with `customExecutorPath` | [openapi.config.json](./openapi.config.json) |

## Stack (one line)

`Service.method()` → `RequestExecutor` → `createExecutorAdapter` → `core/request.ts`

See the hub for glossary, recipes, FAQ, and `check-config` warning decode table.
