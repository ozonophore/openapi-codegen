## Why

Reuse policy пересекает Write seam через 9 optional fields на `WriteClient` / `writeClientModels` / `writeClientSchemas`. Leaf собирает их в уже существующий `ReuseWriterContext` с `inputPath ?? specInput`. V2/V3 в `generateSingle` дублируют bag. Dual `writeModelsAndFinalize`: validation≠NONE **не передаёт** `inputPath`. Hit-path `writeOutputFile(..., { expectedByteSize })` глотает разные файлы одного размера.

## What Changes

- `WriteClient.writeClient` / models / schemas принимают `reuse?: ReuseWriterContext` вместо 9-field flat bag.
- Один `writeModelsAndFinalize` после schemas (или пустого `schemaModels`) — `inputPath` не теряется на validation path.
- `ReuseOutputAdapter` (`writeOutputFile`, `registerLintTarget?`); helpers не импортируют класс `WriteClient`.
- `ReuseWriterContext` при передаче — полный required set включая `inputPath`; сборка один раз в `generateSingle`.
- V2/V3 делят один `writeProps`.
- Убрать `expectedByteSize` early-exit из `writeOutputFile`; reuse hit всегда идёт в content compare.

**Out of scope:** services/core reuse, `generateSingle` extract, modelsMode conflict guard, WriteClient naming typos.

## Capabilities

### New Capabilities

- `reuse-write-session`: Opaque ReuseWriterContext на Write seam + ReuseOutputAdapter + honest writeOutputFile.

## Impact

- `WriteClient.ts`, `writeClientModels.ts`, `writeClientSchemas.ts`, `reuseWriterHelpers.ts`, `OpenApiClient.ts`
- Tests: adapter fake + WriteClient `reuse.inputPath` на validation path
- `CONTEXT.md`
