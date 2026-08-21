## Context

После Diff report lifecycle item session всё ещё владеет pass-through load/apply + missing-report warn. Grill: `applyHistoryDiffToClient` в `diffReport/`.

## Goals / Non-Goals

**Goals:**
- Один seam: load → warn → apply для generation `useHistory`
- Delete item-session private wrappers
- Warn locality в Diff report (не в `loadDiffReport`)
- Bit-identical generation behavior

**Non-Goals:**
- Unified-direct apply
- Change `loadDiffReport` / `applyDiffReportToClient` semantics
- analyzeUsage path changes
- Public `core/index` export

## Decisions

1. **Name:** `applyHistoryDiffToClient` — симметрия с `applyDiffReportToClient`
2. **Call site:** внутри `prepareClientFromOpenApi` после `parse()` — client уже есть; load не дублируется (prepare вызывается один раз)
3. **Warn only in history module** — analyzeUsage не получает побочный warn
4. **Leaves stay exported** — `loadDiffReport` / `applyDiffReportToClient` остаются для analyzeUsage и тестов

## Risks / Trade-offs

- [Warn timing moves into prepare] → Mitigation: same condition `useHistory && !report`; same LOGGER_MESSAGES
- [Double-load if prepare called twice] → Mitigation: prepare still once per item run

## Migration Plan

1. Add module + export
2. Wire prepare; delete wrappers
3. Unit + verify suite
4. CONTEXT OpenSpec id
