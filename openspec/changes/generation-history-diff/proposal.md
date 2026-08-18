## Why

Generation item session держит shallow private wrappers `loadDiffReportIfNeeded` / `applyDiffReportIfNeeded` и warn `USE_HISTORY_NO_REPORT` отдельно от Diff report. Понятие «history during generate» размазано; wrappers падают на deletion test. Architecture grill: один Diff report module.

## What Changes

- Добавить `applyHistoryDiffToClient` в `src/core/diffReport/` (load → warn → apply)
- Вызов из `prepareClientFromOpenApi` после parse; удалить private wrappers и pre-switch load/warn
- Warn только в history module — `loadDiffReport` / analyzeUsage без изменений
- Unit + behavioral preserve
- **Out of scope:** Unified-direct apply; schema collapse; смена load freshness / adapt semantics

## Capabilities

### New Capabilities

- `generation-history-diff`: Diff report владеет generation-path useHistory load+warn+apply

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `src/core/diffReport/**`, `GenerationItemSession.ts`
- Без BREAKING public API
