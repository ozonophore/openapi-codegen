## 1. Package skeleton

- [x] 1.1 Создать `src/core/diffReport/` и перенести: types, adapters, `semanticChangesToDiffEntries`, `buildMiraclesFromSemanticChanges`, `loadDiffReport`, `applyDiffReportToClient`, `writeDiffReport`
- [x] 1.2 Barrel `diffReport/index.ts` (used surface only); shim `types/DiffReport.model.ts` → re-export; no `utils/adapters` shim
- [x] 1.3 Убедиться, что package **не** реэкспортируется из `src/core/index.ts`

## 2. Call sites

- [x] 2.1 Обновить imports: GenerationItemSession, analyzeDiff, analyzeUsage, semanticDiff tests
- [x] 2.2 Убрать `writeSemanticDiffReport` из `analyzeOpenApiDiff` exports
- [x] 2.3 Удалить `semanticDiffContext.ts` и вызов в `analyzeDiff.ts`

## 3. Docs

- [x] 3.1 Сверить `CONTEXT.md` Diff report lifecycle с реализацией

## 4. Verification

- [x] 4.1 `rg writeSemanticDiffReport|createSemanticDiffContext|utils/loadDiffReport|utils/applyDiffReport` — нет owner paths
- [x] 4.2 Прогнать релевантные unit tests (diffReport / analyzeDiff / semanticDiff / apply)
- [x] 4.3 `openspec validate pdtch-191-diff-report-lifecycle`
