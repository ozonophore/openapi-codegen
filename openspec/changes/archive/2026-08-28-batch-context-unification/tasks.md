## 1. Вводим GenerationBatchContext в setupGenerationBatch.ts

- [x] 1.1 Переименовать `SetupGenerationBatchResult` → `GenerationBatchContext` (объявление типа + JSDoc)
- [x] 1.2 Обновить аннотацию возвращаемого типа `setupGenerationBatch` с `Promise<SetupGenerationBatchResult>` на `Promise<GenerationBatchContext>`
- [x] 1.3 Проверить внутренние использования переменной `result` внутри тела `setupGenerationBatch` на наличие явных приведений типов и при необходимости обновить

## 2. Вводим FinalizeGenerationBatchParams и обновляем finalizeGenerationBatch.ts

- [x] 2.1 Добавить тип `FinalizeGenerationBatchParams` с полями: `writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped`, `buildGenerationReport`
- [x] 2.2 Заменить параметр `FinalizeGenerationBatchCtx` на `(ctx: GenerationBatchContext, params: FinalizeGenerationBatchParams)` в сигнатуре `finalizeGenerationBatch`
- [x] 2.3 Обновить деструктуризацию в начале тела `finalizeGenerationBatch`: поля из `ctx` — из `ctx`, 6 значений времени вызова — из `params`
- [x] 2.4 Добавить импорт `GenerationBatchContext` из `setupGenerationBatch.ts`; удалить объявление типа `FinalizeGenerationBatchCtx`

## 3. Рефакторинг GenerationBatchSession.run()

- [x] 3.1 Изменить тип переменной `setup` на `GenerationBatchContext` (возвращается напрямую из `setupGenerationBatch`)
- [x] 3.2 Удалить ручную пересборку полей `FinalizeGenerationBatchCtx` (блок spread/copy, пересобирающий `writeClient`, `cacheEnabled` и т.д.)
- [x] 3.3 Вычислить `allEntitySkipped` локально после цикла: `const allEntitySkipped = ctx.specStats.every(e => e.entitySkipped)`
- [x] 3.4 Вызвать `finalizeGenerationBatch(ctx, { writeClient, eslintFixOptions, items, root, allEntitySkipped, buildGenerationReport })`
- [x] 3.5 Обновить импорты: удалить `SetupGenerationBatchResult` / `FinalizeGenerationBatchCtx`, добавить `GenerationBatchContext` / `FinalizeGenerationBatchParams`

## 4. Финальная проверка

- [x] 4.1 Убедиться, что `SetupGenerationBatchResult` не имеет оставшихся ссылок в кодовой базе
- [x] 4.2 Убедиться, что `FinalizeGenerationBatchCtx` не имеет оставшихся ссылок
- [x] 4.3 Запустить `checkTypes` для подтверждения отсутствия ошибок TypeScript
