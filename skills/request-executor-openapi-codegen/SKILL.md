---
name: request-executor-openapi-codegen
description: >-
  Agent cheatsheet for RequestExecutor (2.0.0+): createClient, request/customExecutorPath,
  M0–M12, codegen A–F, runtime R1–R5. Canonical human docs in package docs/en/request-executor.md
---

# RequestExecutor — agent cheatsheet

**Canonical human docs:** `node_modules/ts-openapi-codegen/docs/en/request-executor.md` · [GitHub](https://github.com/ozonophore/openapi-codegen/blob/master/docs/en/request-executor.md)

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

See hub scenario picker (link above) or [reference.md](reference.md).

## Agent workflow

1. Read `openapi.config.json` — `httpClient`, `request`, `customExecutorPath`
2. Classify Input axis (transport signature) + Output Raw axis (`requestRaw` → `ApiResult`)
3. Assign M0–M12; minimal config diff
4. `check-config` → `preview-changes` → `generate`
5. Runtime: `createClient({ openApi, interceptors?, executorFactory? })`

## Generated client layout (after codegen)

| Scenario | Typical path in `{output}/` |
|----------|----------------------------|
| M0 default transport | `core/request.ts`, `core/executor/createExecutorAdapter.ts` |
| M2 custom transport | `core/request.ts` (copied from config `"request"`) |
| M7 custom adapter | `core/executor/createExecutorAdapter.ts` (copied from `customExecutorPath`) |
| Types | `core/executor/requestExecutor.ts` |

## Additional resources

- [reference.md](reference.md) — types and config fields
- [examples.md](examples.md) — inline copy-paste snippets
- Human migration checklist: `node_modules/ts-openapi-codegen/docs/en/migration.md`
