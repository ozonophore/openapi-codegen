## Почему

`reuseMode: "auto-group"` уже дедуплицирует общие models/schemas в `{LCA}/__shared__/`, но каждый item по-прежнему получает полную копию ядра клиента (`OpenAPI`, `ApiError`, `ApiRequestOptions`, `request`, executor/interceptors, …). В multi-item монорепозиториях с общим HTTP-стеком это лишнее дублирование и противоречит идее Marauder reuse. Размещение ядра в shared-папке должно учитывать, что `request` (и связанные transport-опции) могут задаваться на корне `openapi.config.json` **или** переопределяться в `items[]` — общее ядро безопасно только при совпадении эффективного transport-fingerprint у item.

## Что меняется

- Расширить Marauder `reuseMode: "auto-group"`: пригодные файлы **client core** пишутся один раз в shared-папку LCA (рядом с существующей раскладкой `__shared__` для моделей), а в `core/` каждого item — stub-реэкспорты (тот же паттерн, что у моделей).
- Задать правило **совместимости / fingerprint ядра**: item делит core-файл только если опции, влияющие на содержимое файла, совпадают после `normalizeOptions` (включая fallback корневого `request` vs per-item `request`).
- Оставлять per-item (или per-group) копии для неидентичных core-файлов — в частности `OpenAPI.ts` при разных `server`/`version`, и `request.ts` / executor-адаптеры при разных custom `request` / `customExecutorPath` между items.
- Сохранить текущее поведение для `reuseMode: "copy"` и fallback auto-group (тривиальный LCA, `cacheStrategy !== "reuse"`).
- Обновить предупреждения, которые сейчас говорят, что ReuseStore/auto-group покрывает только models/schemas, чтобы они отражали shared-core при включении.
- Добавить тесты: корневой `request`, per-item override, смешанный сценарий (часть шарится / часть расходится), пути импортов stub в `core/`.
- **Сопутствующий fix ReuseStore:** namespaced-пути при `reuseOnConflict: "namespace"` ДОЛЖНЫ включать короткий `schemaHash`, иначе повторный конфликт в той же спеке (тот же `specItem` + тот же `optionsSliceHash`, другой schema) бьётся о `assertPathAvailable` с ложным `ReuseConflictError` («v3» vs «v3»). Проявлено на `example/openapi.marauder.config.json` + `EEnumWithNumbers`.

## Возможности

### Новые возможности
- `reuse-shared-core`: размещение переиспользуемых артефактов client core в shared-папке Marauder auto-group; группировка items по эффективному transport/core fingerprint (корневой vs per-item `request` и связанные опции); запись stubs в `core/` каждого item, когда это безопасно.

### Изменённые возможности
- `reuse-auto-group-core`: расширить раскладку/описание shared-папки так, чтобы `__shared__/core/` был first-class видом shared-артефакта при `reuseMode: "auto-group"` (пути models без изменений).
- `reuse-namespace-paths`: namespaced relative paths в store (`buildNamespacedModelArtifactRelativePath` / `buildNamespacedSchemaArtifactRelativePath`) включают `schemaHash`, чтобы `reuseOnConflict: "namespace"` не падал на path collision внутри одной спеки.

## Влияние

- **Core pipeline:** `OpenApiClient.generateCodeForItems`, `WriteClient` / `writeClientCore`, `SharedFolderWriter` / `reuseWriterHelpers`, возможно `computeStoreRelativeImport` для более глубоких путей `core/` и `core/executor|interceptors`.
- **ReuseStore paths:** `reuseHelpers.ts` (namespaced path builder) + вызов из `reuseWriterHelpers.ts` при namespace-ветке.
- **Семантика конфига:** новые root-ключи не нужны; поведение включается существующими `reuseMode` + `cacheStrategy: "reuse"`. Нужно уважать `TRawOptions.request` на корне и `items[].request` после нормализации `item.request ?? rawOptions.request`.
- **Выходная раскладка:** `{LCA}/__shared__/core/**` плюс stub-файлы в каждом `{item.output}/core/**` (или `outputCore`); namespaced store-артефакты вида `…__{spec}__{schemaHash8}__{optionsHash8}.ts`.
- **Документация / примеры:** docs по Marauder reuse и опционально заметки в `example/openapi.marauder.config.json` о том, когда core шарится, а когда копируется.
- **Тесты:** unit/integration вокруг `writeClientCore` + multi-item конфигов auto-group с расходящимся/идентичным `request`; unit на uniqueness namespaced paths; smoke `generate -ocn example/openapi.marauder.config.json`.
