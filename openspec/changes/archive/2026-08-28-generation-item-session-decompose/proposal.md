## Why

`GenerationItemSession.run()` — 200-строчный плоский метод, выполняющий 8 логически независимых фаз в одном теле. Нет ни единого unit-теста для GIS — каждая фаза требует полного integration setup. Метод нечитаем без скролла и нетестируем в изоляции.

## What Changes

- **НОВЫЙ МОДУЛЬ** `src/core/itemRun/` — папка с free functions, каждая инкапсулирует одну фазу lifecycle:
  - `resolveEntitySkip.ts` — проверка EntitySkip, возвращает `{ skipped: true; files: string[] } | { skipped: false }`
  - `loadItemPlugins.ts` — загрузка и слияние generator plugins
  - `loadItemSpec.ts` — обёртка над `createResolvedContext`, возвращает `LoadedSpec`
  - `parseAndPrepareClient.ts` — V2/V3 switch + `prepareClientFromOpenApi`, возвращает `Client`
  - `buildReuseProps.ts` — сборка `reuse`-объекта для `writeClient.writeClient`
- **НОВЫЙ ТИП** `LoadedSpec` — экспортируется из `createResolvedContext.ts`, именует инвариант `{ context, map, openApi }`
- `GenerationItemSession.run()` — рефакторинг внутренностей без изменения публичной сигнатуры: тело сводится к ~20 строкам последовательных вызовов free functions
- `specAnalysis` и `strictOpenApiGate` остаются inline (логика уже снаружи GIS, обёртка не даёт прироста тестируемости)
- `writeClient.writeClient` + `generationCache.set` остаются inline (минимальная логика)
- `prepareClientFromOpenApi` остаётся private method GIS

## Capabilities

### New Capabilities

- `item-run-phases`: Набор free functions `src/core/itemRun/`, реализующих фазы lifecycle одного generation item. Каждая функция принимает только необходимые аргументы, возвращает чистый результат — unit-тестируема без IO и без полного setup GIS.

### Modified Capabilities

_(нет изменений на уровне требований существующих спецификаций)_

## Impact

- `src/core/GenerationItemSession.ts` — рефакторинг `run()` без изменения сигнатуры
- `src/core/createResolvedContext.ts` — добавление `export type LoadedSpec`
- `src/core/itemRun/` — новая папка с 5 модулями + unit-тесты для каждого
- Публичный API не меняется: `GenerationItemSession.run()`, `GenerationBatchSession`, `generateItem` — сигнатуры не трогаются
