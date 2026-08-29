## Зачем

`TStrictFlatOptions` несёт путевые поля (`input`, `output`, `cachePath`, `request`, `plugins[].path` и ещё 6) в виде относительных строк, поэтому каждая функция в `src/core/` самостоятельно вызывает `resolveHelper(process.cwd(), ...)` — 22 вызова в 20+ файлах core-слоя. Это нарушает изоляцию слоя: core напрямую читает окружение процесса, что делает функции нетестируемыми без смены рабочей директории.

## Что меняется

- Вводится функция `normalizePathsToAbsolute(result, cwd)` в `src/core/resolveGenerationOptions.ts`, которая принимает `ResolveGenerationOptionsResult` и `cwd: string` и возвращает тот же тип с абсолютными путями во всех path-полях
- Нормализуемые поля в каждом `TStrictFlatOptions`: `input`, `output`, `outputCore`, `outputModels`, `outputServices`, `outputSchemas`, `cachePath`, `request`, `customExecutorPath`, `prettierConfigPath`, `governanceConfig`, `reportFile`, `plugins[].path`
- `OpenApiClient.generate()` вставляет вызов `normalizePathsToAbsolute` между `resolveGenerationOptions` и `session.run`
- Все вызовы `resolveHelper(process.cwd(), ...)` внутри `src/core/` удаляются — каждая функция получает уже абсолютный путь
- `resolveOutputRoot()` удаляется из `setupGenerationBatch.ts` и `GenerationBatchSession.ts` (дублированная приватная функция, ставшая ненужной)
- Путевые поля в `TStrictFlatOptions` документируются в JSDoc как «always absolute after normalizePathsToAbsolute»
- `common/utils/loadConfigIfExists.ts` и `common/utils/format.ts` не меняются

## Capabilities

### New Capabilities

- `path-normalization`: единый шаг нормализации путей после `resolveGenerationOptions` — функция `normalizePathsToAbsolute(result, cwd)`, превращающая все путевые поля в `TStrictFlatOptions` из относительных строк в абсолютные POSIX-пути

### Modified Capabilities

- `generation-options-resolve`: сценарий «Facade calls resolve then batch» меняется — между `resolveGenerationOptions` и `session.run` добавляется шаг нормализации путей

## Impact

- `src/core/resolveGenerationOptions.ts` — добавляется `normalizePathsToAbsolute`
- `src/core/OpenApiClient.ts` — один новый вызов в `generate()`
- ~20 файлов в `src/core/` — удаляются вызовы `resolveHelper(process.cwd(), ...)`
- `src/core/setupGenerationBatch.ts`, `src/core/GenerationBatchSession.ts` — удаляется дублированная `resolveOutputRoot()`
- Тесты: функции core теперь можно тестировать, передавая абсолютные пути напрямую, без `chdir`
