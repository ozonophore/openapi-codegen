## 1. Вводим normalizePathsToAbsolute

- [x] 1.1 Добавить функцию `normalizePathsToAbsolute(result: ResolveGenerationOptionsResult, cwd: string): ResolveGenerationOptionsResult` в `src/core/resolveGenerationOptions.ts`, нормализующую поля `input`, `output`, `outputCore`, `outputModels`, `outputServices`, `outputSchemas`, `cachePath`, `request`, `customExecutorPath`, `prettierConfigPath`, `governanceConfig`, `reportFile` в каждом item (пропуская `!value`)
- [x] 1.2 Нормализовать `plugins[].path` в каждом item внутри той же функции
- [x] 1.3 Добавить JSDoc к путевым полям `TStrictFlatOptions` (в `src/common/TRawOptions.ts` или месте объявления): «always absolute after normalizePathsToAbsolute»

## 2. Подключаем normalizePathsToAbsolute в точке входа

- [x] 2.1 В `OpenApiClient.generate()` вызвать `normalizePathsToAbsolute(result, process.cwd())` между `resolveGenerationOptions` и `session.run`
- [x] 2.2 Добавить экспорт `normalizePathsToAbsolute` из `src/core/resolveGenerationOptions.ts`

## 3. Удаляем resolveHelper(process.cwd(), ...) из core: TStrictFlatOptions поля

- [x] 3.1 `src/core/generationCache/GenerationCache.ts` — конструктор: убрать `resolveHelper(process.cwd(), cachePath)`, хранить `cachePath` напрямую
- [x] 3.2 `src/core/reuseStore/ReuseStore.ts` — конструктор: убрать `resolveHelper(process.cwd(), storeRootPath)`, хранить `storeRootPath` напрямую
- [x] 3.3 `src/core/plugins/loadGeneratorPlugins.ts` — убрать `resolveHelper(process.cwd(), entry.path)`, использовать `entry.path` напрямую
- [x] 3.4 `src/core/plugins/pluginEntries.ts` — убрать `resolveHelper(process.cwd(), path)` из `pluginPathDedupeKey`, использовать `path` напрямую
- [x] 3.5 `src/core/specLoad/resolveOpenApiRefs.ts` — убрать `resolveHelper(process.cwd(), input)` и `resolveHelper(process.cwd(), sourceFile)`, использовать напрямую
- [x] 3.6 `src/core/generationCache/EntitySkip.ts` — убрать `resolveHelper(process.cwd(), input)` в `getSpecItemName` и `buildEntityFingerprint`/`checkEntitySkip`, использовать `item.input` напрямую
- [x] 3.7 `src/core/GenerationItemSession.ts` — убрать `resolveHelper(process.cwd(), item.input)`, использовать `item.input` напрямую
- [x] 3.8 `src/core/specAnalysis/runPreAnalyze.ts` — убрать `resolveHelper(process.cwd(), item.input)`, использовать `item.input` напрямую
- [x] 3.9 `src/core/write/writeClientCore.ts` — убрать `resolveHelper(process.cwd(), request)` и `resolveHelper(process.cwd(), customExecutorPath)`, использовать напрямую
- [x] 3.10 `src/core/governance/loadGovernanceConfig.ts` — убрать `resolveHelper(process.cwd(), governanceConfigPath)`, использовать `governanceConfigPath` напрямую
- [x] 3.11 `src/core/strict/validateOpenApiStrict.ts` — убрать `resolveHelper(process.cwd(), reportFilePath)`, использовать `reportFilePath` напрямую
- [ ] 3.12 `src/core/diffReport/writeDiffReport.ts` — убрать `resolveHelper(process.cwd(), reportFilePath)`, использовать `reportFilePath` напрямую
- [ ] 3.13 `src/core/specAnalysis/writeSpecAnalysisReport.ts` — убрать `resolveHelper(process.cwd(), reportFilePath)`, использовать `reportFilePath` напрямую

## 4. Удаляем resolveHelper(process.cwd(), ...) из core: уже-абсолютные пути

- [x] 4.1 `src/core/OutputFileSession.ts` — убрать `resolveHelper(process.cwd(), filePath)` в `writeOutputFile` и `registerOutputFile`; пути приходят абсолютными из `getOutputPaths`
- [x] 4.2 `src/core/LintTargetRegistry.ts` — убрать `resolveHelper(process.cwd(), filePath)` в `registerLintTarget`; путь приходит абсолютным
- [x] 4.3 `src/core/finalizeGenerationBatch.ts` — убрать `resolveHelper(process.cwd(), dir)` при сборке `roots`; директории приходят из `getOutputPaths` уже абсолютными
- [x] 4.4 `src/core/reuseStore/GenerationReport.ts` — убрать `resolveHelper(process.cwd(), storePath, 'reports')`, использовать `resolveHelper(storePath, 'reports')` (без `process.cwd()`)

## 5. Удаляем дублированную resolveOutputRoot

- [x] 5.1 Удалить приватную `resolveOutputRoot()` из `src/core/setupGenerationBatch.ts` и обновить все внутренние вызовы (output теперь уже абсолютный)
- [x] 5.2 Удалить приватную `resolveOutputRoot()` из `src/core/GenerationBatchSession.ts` и обновить все внутренние вызовы

## 6. Финальная проверка

- [x] 6.1 Убедиться, что в `src/core/` не осталось вызовов `resolveHelper(process.cwd(), ...)` для TStrictFlatOptions-полей
- [x] 6.2 Запустить `npm run checkTypes` — ошибок TypeScript быть не должно
