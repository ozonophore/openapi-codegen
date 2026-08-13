## 1. Types / helpers

- [x] 1.1 Добавить `ReuseOutputAdapter`; перевести helpers на adapter (без импорта WriteClient)
- [x] 1.2 Убрать `expectedByteSize` из `writeOutputFile`; hit path без size short-circuit

## 2. Write seam

- [x] 2.1 Схлопнуть bag в `WriteClient` → `reuse?`; один `writeModelsAndFinalize`
- [x] 2.2 Обновить `writeClientModels` / `writeClientSchemas`
- [x] 2.3 `OpenApiClient.generateSingle`: один `reuse` + один `writeProps` для V2/V3

## 3. Tests / docs

- [x] 3.1 Unit: adapter fake + WriteClient `reuse.inputPath` на validation path
- [x] 3.2 CONTEXT; отметить tasks
