---
name: request-executor-openapi-codegen
description: >-
  Agent cheatsheet for RequestExecutor (2.0.0+): createClient, request/customExecutorPath,
  M0–M12, codegen A–F, runtime R1–R5. Canonical human docs: docs/en/request-executor.md
---

# RequestExecutor — agent cheatsheet

**Canonical human docs:** [docs/en/request-executor.md](../../docs/en/request-executor.md) · [docs/ru/request-executor.md](../../docs/ru/request-executor.md)

Use the hub for prose, FAQ, copy-paste recipes, and `check-config` warning decode. This file is optimized for classification and config diffs.

## Stack

```
Service.method() → RequestExecutor → createExecutorAdapter → core/request.ts
```

| Layer | Input |
|-------|-------|
| Transport | `ApiRequestOptions`, `TOpenAPIConfig` |
| Adapter / Executor | `RequestConfig`, `TOptions?` |

**Two "request" names:** config key `"request"` (transport path) ≠ method `executor.request()` (returns body).

## Quick decision

```
No custom HTTP → M0: generate + createClient({ openApi })
Custom request.ts, canonical signature → M2: "request" in config
No requestRaw, dev only → M2b: createLegacyRequestAdapter via executorFactory
ky / mapOptions → M7: customExecutorPath
Auth without regen → M6: createClient({ interceptors })
Mock tests → M9: new Service(mockExecutor)
Status on success → methodRaw(), not method()
```

## Codegen A–F (summary)

| Variant | request | customExecutorPath |
|---------|---------|-------------------|
| A | — | — (default) |
| C | ✓ | — |
| D | — | ✓ |
| E | ✓ | ✓ |

**D ≠ R4:** `customExecutorPath` = codegen adapter swap (R1). `executorFactory` = runtime full swap (R4).

## Runtime R1–R5 (summary)

- R1: default + always `withInterceptors` + `apiErrorInterceptor` (2.1.0-beta.10+)
- R2: + custom interceptors
- R3: executorFactory wrap
- R4: executorFactory replace
- R5: createLegacyRequestAdapter

## M0–M12 table

See hub [scenario picker](../../docs/en/request-executor.md#scenario-picker-m0m12).

## Agent workflow

1. Read `openapi.config.json` — `httpClient`, `request`, `customExecutorPath`
2. Classify Input axis (transport signature) + Output Raw axis (`requestRaw` → `ApiResult`)
3. Assign M0–M12; minimal config diff
4. `check-config` → `preview-changes` → `generate`
5. Runtime: `createClient({ openApi, interceptors?, executorFactory? })`

## Ground truth files

| Scenario | Path |
|----------|------|
| M2 transport | `test/custom/request.ts` |
| M7 adapter | `test/custom/createExecutorAdapter.ts`, `example/executor.ts` |
| Architecture pointer | `example/REQUEST_EXECUTION_ARCHITECTURE.md` |
| validateExecutorSetup | `src/cli/checkAndUpdateConfig/utils/validateExecutorSetup.ts` |

## Additional resources

- [reference.md](reference.md) — types and field tables
- [examples.md](examples.md) — short code snippets
- [Migration](../../docs/en/migration.md) — Path B checklist
