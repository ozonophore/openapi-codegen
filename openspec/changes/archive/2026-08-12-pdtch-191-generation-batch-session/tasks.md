## 1. Module skeleton

- [x] 1.1 Создать `src/core/GenerationBatchSession.ts` с типами `ItemRunContext`, `GenerationBatchSessionDeps` и классом `GenerationBatchSession`
- [x] 1.2 Убедиться, что `src/core/index.ts` не экспортирует session

## 2. Extract batch lifecycle

- [x] 2.1 Перенести тело `generateCodeForItems` в `GenerationBatchSession.run`
- [x] 2.2 Перенести batch-only helpers (path/cache resolve, validate/warn, cleanup stale, batch ESLint) в session
- [x] 2.3 Перенести ownership `specAnalysisAccumulator` в session; расширить ctx до `itemRunContext`
- [x] 2.4 Исправить порядок: Reuse GC/save → финальный Generation report → workspaceReport; early conflict dump сохранить
- [x] 2.5 Подключить session из `OpenApiClient.generate` через callback deps (`generateItem`, `shouldEntitySkip`, `writeClient`, `eslintFixOptions`)

## 3. Tests

- [x] 3.1 Unit-тесты session: финальный report после GC с phases; early dump; allEntitySkipped gates; warm skip; GC keys
- [x] 3.2 Прогнать релевантные existing tests (reuse / OpenApiClient)

## 4. Docs / glossary

- [x] 4.1 Сверить `CONTEXT.md` с финальным API session

## 5. Verify (lint-staged)

Скрипты из `lint-staged.config.js` (порядок как в pre-commit):

- [x] 5.1 `npm run checkTypes`
- [x] 5.2 `npm run find-deadcode:dev`
- [x] 5.3 `npm run eslint:fix`
- [x] 5.4 `npm run prettier:fix`
