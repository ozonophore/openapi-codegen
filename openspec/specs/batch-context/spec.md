## Purpose

Единый тип `GenerationBatchContext` и компаньон `FinalizeGenerationBatchParams` — контракт потока данных setup → loop → finalize в multi-item generation batch.

## Requirements

### Requirement: GenerationBatchContext объединяет состояние setup и finalize

Система ДОЛЖНА предоставлять единый тип `GenerationBatchContext` в `setupGenerationBatch.ts`, заменяющий оба типа `SetupGenerationBatchResult` и `FinalizeGenerationBatchCtx` в качестве носителя состояния жизненного цикла батча.

`GenerationBatchContext` ДОЛЖЕН содержать все поля, ранее входившие в `SetupGenerationBatchResult`: `start`, `cacheEnabled`, `cacheStrategy`, `useReuseStore`, `generationCaches`, `reuseStore`, `referencedArtifactKeys`, `specStats`, `totalReuseHits`, `totalReuseMisses`, `reuseConflicts`, `reportBasePath`, `manifestLoadMs`, `sharedFolderWriter`, `state`.

`SetupGenerationBatchResult` и `FinalizeGenerationBatchCtx` ДОЛЖНЫ быть удалены.

#### Scenario: setupGenerationBatch возвращает GenerationBatchContext
- **WHEN** `setupGenerationBatch` успешно завершается
- **THEN** возвращается `Promise<GenerationBatchContext>` со всеми 15 заполненными полями жизненного цикла

#### Scenario: поля GenerationBatchContext изменяемы для накопления в цикле
- **WHEN** цикл по элементам увеличивает `totalReuseHits`, `totalReuseMisses` или добавляет в `specStats`
- **THEN** эти мутации отражаются в том же объекте `GenerationBatchContext`, передаваемом в `finalizeGenerationBatch`

### Requirement: FinalizeGenerationBatchParams несёт дополнения времени вызова

Система ДОЛЖНА предоставлять тип `FinalizeGenerationBatchParams` в `finalizeGenerationBatch.ts`, содержащий ровно 6 значений, которые `finalizeGenerationBatch` нужны, но не может получить из `GenerationBatchContext`: `writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped`, `buildGenerationReport`.

`finalizeGenerationBatch` ДОЛЖЕН принимать `(ctx: GenerationBatchContext, params: FinalizeGenerationBatchParams)` вместо прежней одномешковой сигнатуры.

#### Scenario: finalizeGenerationBatch получает контекст и параметры как отдельные аргументы
- **WHEN** `GenerationBatchSession.run()` вызывает `finalizeGenerationBatch`
- **THEN** передаётся `ctx` (эволюционировавший `GenerationBatchContext`) и литерал `FinalizeGenerationBatchParams`, содержащий `writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped` и `buildGenerationReport`

#### Scenario: FinalizeGenerationBatchCtx больше не существует
- **WHEN** разработчик ищет `FinalizeGenerationBatchCtx`
- **THEN** определение не найдено; тип отсутствует в кодовой базе

### Requirement: GenerationBatchSession.run() устраняет пересборку мешка

`GenerationBatchSession.run()` НЕ ДОЛЖЕН вручную копировать поля из результата setup в объект finalize-контекста. Он ДОЛЖЕН передавать `GenerationBatchContext`, возвращённый `setupGenerationBatch`, напрямую в `finalizeGenerationBatch`.

#### Scenario: run() передаёт ctx напрямую без пересборки
- **WHEN** `run()` вызывает `setupGenerationBatch`, а затем `finalizeGenerationBatch`
- **THEN** тот же объект `ctx`, возвращённый setup, передаётся первым аргументом в finalize без промежуточного шага копирования полей

#### Scenario: allEntitySkipped вычисляется локально в run()
- **WHEN** цикл по элементам завершается
- **THEN** `allEntitySkipped` выводится локально как `ctx.specStats.every(e => e.entitySkipped)` и передаётся в `FinalizeGenerationBatchParams`, а не хранится в `GenerationBatchContext`
