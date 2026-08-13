## Why

`GenerationBatchSession` владеет multi-item lifecycle, но per-item pipeline всё ещё на фасаде: `OpenApiClient.generateSingle` (~220 LOC) — EntitySkip → Context → strict → V2/V3 → Write → cache. Locality «один Spec item → записанный Client» плохая; batch extract item path не углубил.

## What Changes

- Класс `GenerationItemSession` в `src/core/GenerationItemSession.ts` — полный бывший `generateSingle`.
- `OpenApiClient` остаётся фасадом: normalize/defaults, `generate(rawOptions)` создаёт WriteClient + item session + batch session; `generateItem` → `itemSession.run`; **`generateSingle` удаляется**.
- Deps: `{ writeClient, eslintFixOptions }`; `run(item, generationCache, itemRunContext)` с **обязательным** `ItemRunContext`.
- Diff load/apply — private на item session; V2/V3 as-is.
- Session **не** реэкспортится из `src/core/index.ts`.
- Тесты: behavioral preserve существующих suite; отдельный unit suite deferred.

**Out of scope:** схлопывание V2/V3, Diff report lifecycle (`a6d`), WriteClient split (`186`), options resolution (`4cdd`), ctor-injection фасада, публичный API / CLI.

## Capabilities

### New Capabilities

- `generation-item-session`: ownership и seam Generation item session

### Modified Capabilities

- `generation-batch-session`: `generateItem` wired to item session, not `generateSingle` on the facade
- `pre-analyze-core`: plugin load parity vs Generation item session
- `document-service-baseline/generation-cache-and-reuse`: entity-skip write side effect принадлежит item session

## Impact

- New `GenerationItemSession.ts`; slim `OpenApiClient.ts`; batch JSDoc; EntitySkip comment; `CONTEXT.md`
- Delta specs above
- Нет **BREAKING** публичного API
