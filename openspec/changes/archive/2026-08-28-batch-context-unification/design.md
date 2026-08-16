## Контекст

`GenerationBatchSession.run()` владеет полным жизненным циклом генерации нескольких элементов: setup → цикл по элементам → finalize. Два вспомогательных метода выполняют основную работу:

- `setupGenerationBatch` — инициализирует кэш, хранилище переиспользования, предварительный анализ, общую папку; возвращает 14-польный `SetupGenerationBatchResult`
- `finalizeGenerationBatch` — объединяет вывод, сбрасывает кэш, запускает ESLint; принимает 15-польный `FinalizeGenerationBatchCtx`

9 полей присутствуют в **обоих** типах (`cacheEnabled`, `cacheStrategy`, `generationCaches`, `reuseStore`, `referencedArtifactKeys`, `specStats`, `reportBasePath`, `state`, `start`). `run()` деструктурирует результат setup и вручную пересобирает finalize-контекст, добавляя ещё 6 значений времени вызова. Это делает `run()` церемонией переписывания данных, а обе функции — практически непригодными для юнит-тестирования.

Затронутые файлы: `setupGenerationBatch.ts`, `finalizeGenerationBatch.ts`, `GenerationBatchSession.ts` (нет вызывающих вне этих трёх).

## Цели / Не-цели

**Цели:**
- Единый тип `GenerationBatchContext`, заменяющий оба мешка; ноль продублированных полей
- `finalize` получает `(ctx, params)` — контекст, которым владеет, + только 6 значений, которые не может произвести сам
- `run()` устраняет шаг пересборки мешка; передаёт `ctx` напрямую
- Всё существующее поведение сохраняется в точности

**Не-цели:**
- Изменение логики внутри `setupGenerationBatch` или `finalizeGenerationBatch`
- Добавление новых юнит-тестов (только структурный рефакторинг; поведение покрыто интеграционными тестами)
- Перенос бизнес-логики `GenerationBatchSession.run()` в хелперы

## Решения

### D1 — Единый `GenerationBatchContext` заменяет оба мешка

`SetupGenerationBatchResult` — естественный «контекст батча»: он накапливает состояние на протяжении всего жизненного цикла. `FinalizeGenerationBatchCtx` — по сути его копия плюс значения времени вызова. Слияние убирает дублирование 9 полей и ручное копирование в `run()`.

*Рассмотренная альтернатива: оставить оба типа, добавить mapping-хелпер.* Отклонено — хелпер добавляет косвенность, не устраняя дублирование.

### D2 — `GenerationBatchContext` объявляется в `setupGenerationBatch.ts`

Тип создаётся функцией `setupGenerationBatch`, и его форма диктуется логикой setup. Совмещение типа с его конструктором следует прецеденту `ItemRunContext` (объявлен в `GenerationBatchSession.ts`, который является его создателем).

*Альтернатива: отдельный `BatchContext.ts`.* Отклонено — добавляет файл для типа, используемого только тремя файлами в той же папке.

### D3 — `FinalizeGenerationBatchParams` как небольшой тип-компаньон

`finalize` нужны 6 значений, которые нельзя получить из `ctx`: `writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped`, `buildGenerationReport`. Группировка их в `FinalizeGenerationBatchParams` даёт `finalize` чистую двухаргументную сигнатуру `(ctx, params)` без позиционного шума.

`FinalizeGenerationBatchParams` объявляется рядом с заменой `FinalizeGenerationBatchCtx` в `finalizeGenerationBatch.ts`.

*Альтернатива: передать все 6 позиционно.* Отклонено — 7 позиционных параметров нечитаемо.

### D4 — `state: FinalizeGenerationBatchState` остаётся вложенным полем внутри `GenerationBatchContext`

`state` отслеживает изменяемое накопление (`specAnalysisAccumulator`, `gcMs`, `manifestSaveMs`, `specQualityReport`) между фазами. Существующая граница вложенности уже передаёт намерение; выравнивание смешало бы жизненные циклы.

### D5 — `allEntitySkipped` и `buildGenerationReport` остаются локальными в `run()`

`allEntitySkipped` выводится из `ctx.specStats` (одно выражение). `buildGenerationReport` — замыкание, захватывающее `ctx` и `setup`. Ни то ни другое не принадлежит `ctx` — это точечные вычисления, а не состояние жизненного цикла.

## Риски / Компромиссы

- [Путаница при переименовании] Вызывающие, использующие `SetupGenerationBatchResult` по имени, получат ошибку типа до обновления. → Затронуты только 3 файла; все обновляются атомарно в этом изменении.
- [Изменяемый контекст] `GenerationBatchContext` содержит поля, мутируемые в цикле (`specStats`, `totalReuseHits` и др.). Это намеренный компромисс ради простоты; существующий паттерн мутации сохраняется без изменений.

## Открытые вопросы

*(нет — все решения зафиксированы в ходе grilling-сессии)*
