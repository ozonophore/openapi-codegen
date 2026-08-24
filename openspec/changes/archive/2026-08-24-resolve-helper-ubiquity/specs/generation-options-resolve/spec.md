## MODIFIED Requirements

### Requirement: Generation options resolve owns raw-to-strict items

Система ДОЛЖНА запускать смысл опций (Zod-валидация + flatten items|flat + inherit + defaults) через внутренний **Generation options resolve** (`resolveGenerationOptions` в `src/core/resolveGenerationOptions.ts`), а не через приватные методы `OpenApiClient` и не через `validateRawOptions` с `process.exit`.

После `resolveGenerationOptions` `OpenApiClient.generate` ДОЛЖЕН применить `normalizePathsToAbsolute(result, process.cwd())` перед передачей items в `GenerationBatchSession.run`.

#### Scenario: Facade calls resolve, then normalize, then batch

- **WHEN** `OpenApiClient.generate` выполняется
- **THEN** он ДОЛЖЕН получить `TStrictFlatOptions[]` из `resolveGenerationOptions(rawOptions)`, затем вызвать `normalizePathsToAbsolute(result, process.cwd())`, и только после этого передать нормализованные items в `GenerationBatchSession.run` вместе с `root`

#### Scenario: Public generate does not validate separately

- **WHEN** `core/index.ts` `generate(rawOptions)` вызывается
- **THEN** он НЕ ДОЛЖЕН вызывать отдельный `validateRawOptions`; валидация происходит внутри `resolveGenerationOptions`
