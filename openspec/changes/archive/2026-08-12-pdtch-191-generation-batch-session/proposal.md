## Why

`generateCodeForItems` всё ещё владеет полным multi-item Generation lifecycle (~240 LOC mutable bag): cache/Reuse setup, warm skip, цикл, post-steps, report, GC, ESLint. Недавние extracts (`postGenerationSteps`, `buildGenerationReport`) — shallow adapters; depth и locality остались в методе. Финальный Generation report пишется **до** `reuseStore.gc`/`save`, поэтому `phases.gcMs` / `manifestSaveMs` в отчёте остаются 0.

## What Changes

- Ввести **Generation batch session**: класс `GenerationBatchSession` в `src/core/GenerationBatchSession.ts`, владеющий полным batch lifecycle (setup → ESLint / `shutdownLogger`).
- `OpenApiClient` становится фасадом: normalize/defaults, `generateSingle`, skip/fingerprint helpers; session вызывается из `generate()`.
- Seam к per-item: callbacks `generateItem` / `shouldEntitySkip`; Spec analysis accumulator живёт в session и передаётся в **`itemRunContext`**.
- **Report finalize:** early dump при `ReuseConflictError` сохраняется; финальный report пишется **после** GC/save с полными `phases` при `cacheDebug`.
- Path/validate/warn helpers, нужные только batch setup, переезжают в session; `eslintFixOptions` инжектится явно.
- Session **не** реэкспортится из `src/core/index.ts`.
- Unit-тесты через interface session (fake callbacks): порядок шагов, phases после GC, early dump, warm skip, all-entity-skipped gates, GC keys.

**Out of scope:** unify fingerprints (entity vs reuse), collapse Reuse bag на Write seam, перенос `generateSingle`, Plugin config injection, Context init factory.

## Capabilities

### New Capabilities

- `generation-batch-session`: Ownership и seam Generation batch session (lifecycle, callbacks, internal visibility, test surface).

### Modified Capabilities

- `document-service-baseline/generation-cache-and-reuse`: финальный Generation report после Reuse GC/save; early conflict dump без требования полных phase timings.

## Impact

- `src/core/GenerationBatchSession.ts` — новый module
- `src/core/OpenApiClient.ts` — extract `generateCodeForItems` + связанных batch helpers; `generateSingle` принимает `itemRunContext`
- `src/core/__tests__/` — unit-тесты session
- `CONTEXT.md` — термин Generation batch session (уже заведён)
- Нет **BREAKING** публичного API / CLI / конфигов
