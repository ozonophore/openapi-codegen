## Зачем

`SetupGenerationBatchResult` (14 полей) и `FinalizeGenerationBatchCtx` (15 полей) — перекрывающиеся анонимные мешки: 9 полей продублированы между ними, а `GenerationBatchSession.run()` вручную деструктурирует первый только затем, чтобы пересобрать второй — код тяжело читать, обе функции сложно покрыть юнит-тестами.

## Что меняется

- Вводится `GenerationBatchContext` — единый тип, заменяющий оба мешка, объявленный в `setupGenerationBatch.ts`
- `setupGenerationBatch` возвращает `Promise<GenerationBatchContext>` вместо `Promise<SetupGenerationBatchResult>`
- Сигнатура `finalizeGenerationBatch` меняется с `(ctx: FinalizeGenerationBatchCtx)` на `(ctx: GenerationBatchContext, params: FinalizeGenerationBatchParams)`, где `FinalizeGenerationBatchParams` несёт 6 значений времени вызова, не принадлежащих контексту (`writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped`, `buildGenerationReport`)
- `GenerationBatchSession.run()` убирает ручной шаг пересборки мешка; теперь передаёт `ctx` напрямую в `finalize`
- Удаляются `SetupGenerationBatchResult` и `FinalizeGenerationBatchCtx`

## Возможности

### Новые возможности

- `batch-context`: единый тип `GenerationBatchContext` и его компаньон `FinalizeGenerationBatchParams` — контракт потока данных setup → loop → finalize

### Изменённые возможности

*(нет — чисто структурный рефакторинг; наблюдаемое поведение не меняется)*

## Влияние

- **`src/core/setupGenerationBatch.ts`** — переименование возвращаемого типа, экспорт `FinalizeGenerationBatchParams`
- **`src/core/finalizeGenerationBatch.ts`** — замена `FinalizeGenerationBatchCtx` на двухпараметрическую сигнатуру
- **`src/core/GenerationBatchSession.ts`** — удаление ручной пересборки мешка; передача `ctx` + `params` в finalize
- Нет внешних вызывающих за пределами этих 3 файлов; публичный API не меняется; тестовые файлы не затронуты
