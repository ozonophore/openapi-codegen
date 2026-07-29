## Why

Аудит PDD `2.1.0-beta.1` → HEAD `2.1.0-beta.13` показал: DTO/history pipeline работает, но **layout `modelsMode=classes` жёстко сводит все модели в один `models.ts`**, хотя `interfaces` сохраняет `model.path`. Это ломает ожидаемый DX (review, ownership, partial regen) и блокирует ReuseStore. Параллельно есть тихие дефекты (`analyze-usage --diff-report` no-op, мёртвый `miracles.*`, Yup boolean coercion gap), которые стоит закрыть **без ухудшения** уже работающих потребителей bundle-layout и default `interfaces`.

## What Changes

- Добавить **configurable** раскладку classes-mode: `models.layout: "bundle" | "per-file"` (flat/CLI-эквиваленты по необходимости).
  - **Default = `bundle`** — текущее поведение HEAD (`models/models.ts`); **без BREAKING** для существующих consumers.
  - `per-file` — один файл на `model.path` с `*Raw` + `*Dto` (+ alias), как у `interfaces`.
- При `layout: per-file`: адаптировать write-path, templates, service/index imports, `resolveClassesModeTypes`; **включить ReuseStore** для classes (сейчас second-class).
- Исправить `analyze-usage --diff-report`: загрузка report должна проходить gate `useHistory` (или отдельный validate-mode loader) — сейчас rename post-check всегда no-op.
- Подключить runtime-фильтр `miracles.{enabled,confidence,types}` + root→items наследование в `normalizeOptions` (сейчас schema-only).
- Закрыть Yup boolean `needsCoercion` gap (паритет с Zod/Joi) — узкий fix шаблона.
- Документация / MIGRATION / example: описать layout opt-in, dead→live `miracles.*`, выровнять MD5 vs CHANGELOG SHA-256 (docs или код — см. design).
- **Post-apply correctness (из `research/MODELS_LAYOUT_TEST_REPORT.md`):** CLI `--modelsMode` без Commander default (иначе `-ocn` убивает `models.mode` из конфига); per-file nested relative `BaseDto`/`dtoUtils`; path-keyed `dtoImports` + alias/dictionary DTO init; example-конфиги A/B на одном `v3.json` с разными `output`.
- **Не в scope этого change (отдельные follow-ups):** смена default layout на `per-file` (**BREAKING**), fail-closed stale report, dual BaseDto placement refactor, полная Marauder Phase 2, DTO init для oneOf/anyOf/allOf, полный аудит всех Commander `.default` в override keys.

## Capabilities

### New Capabilities
- `models-classes-layout`: конфигурируемая файловая топология при `modelsMode=classes` (`bundle` default / `per-file` opt-in); per-path Raw+Dto; imports/barrels; ReuseStore при per-file.
- `analyze-usage-diff-report`: корректная загрузка diff report в `analyze-usage --diff-report` и выполнение RENAME post-check.
- `miracles-config-runtime`: runtime применение `miracles.enabled|confidence|types` при generate + наследование root→items.
- `yup-boolean-coercion`: coerce/transform для boolean при `needsCoercion` в Yup-шаблонах.

### Modified Capabilities
- `generation-cache-resilience`: при `modelsMode=classes` и `layout=per-file` + `cacheStrategy=reuse` — ReuseStore **разрешён** (entity-fallback остаётся для `layout=bundle`).

## Impact

- **Write-path:** `writeClientModels.ts`, `exportModels.hbs` / per-model template, `exportService.hbs`, `indexModels.hbs` / `indexFull.hbs`, `resolveClassesModeTypes.ts`.
- **Config/schema:** `UNIFIED_OPTIONS_v6` — `models.layout` (+ CLI/flat aliases); wiring `miracles.*` в `applyDiffReportToClient` / `normalizeOptions`.
- **CLI:** `analyzeUsage.ts` + `loadDiffReport` contract; опционально `--modelsLayout`.
- **Cache/reuse:** `OpenApiClient` gates `useReuseStore` / `needsEntityCacheFallback`.
- **Validation templates:** Yup boolean coerce branch.
- **Tests:** unit/E2E на bundle (регрессия), per-file layout, analyze-usage rename check, miracles filter, Yup boolean; обновить контрактные тесты, которые сейчас лочат single `models.ts`.
- **Docs:** features/MIGRATION/example config с `modelsMode: classes` + `layout`.
