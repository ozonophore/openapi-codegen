### Requirement: OutputGroupResolver находит LCA для output-путей
`resolveOutputGroups(absoluteOutputPaths: string[])` ДОЛЖЕН находить Longest Common Ancestor (LCA) для двух и более путей. Если LCA тривиален (корень ФС, `/`, или совпадает с одним из входных путей) — ДОЛЖЕН возвращать `null` как сигнал для fallback к copy-based reuse.

#### Scenario: LCA найден для нескольких output-путей
- **WHEN** пути `["/project/out/api-a", "/project/out/api-b"]`
- **THEN** `resolveOutputGroups` возвращает LCA `/project/out`

#### Scenario: trivial LCA возвращает null
- **WHEN** пути `["/project/api-a", "/other/api-b"]` с LCA `/`
- **THEN** возвращается `null` (fallback к copy)

#### Scenario: один путь возвращает null
- **WHEN** передан массив с одним элементом
- **THEN** возвращается `null` (auto-group бессмысленен для одной спеки)

---

### Requirement: SharedFolderWriter записывает canonical-файл и stub-реэкспорты
Для каждого shared-артефакта `SharedFolderWriter` ДОЛЖЕН: записать canonical-версию в
`{LCA}/__shared__/{kind}/{Name}.ts`, записать stub в `{item.output}/{kind}/{Name}.ts`
с содержимым `export * from '../../__shared__/{kind}/{Name}'` (относительный путь
вычисляется через `computeStoreRelativeImport`).

Метод `SharedFolderWriter.write()` НЕ ДОЛЖЕН существовать как публичный API.
Вся логика записи ДОЛЖНА быть инлайновой в `reuseWriterHelpers.ts`.
Класс `SharedFolderWriter` используется исключительно как holder для `lca`.

#### Scenario: canonical-файл создаётся в __shared__
- **WHEN** две specs используют модель `UserDto` и `reuseMode === 'auto-group'`
- **THEN** файл `{LCA}/__shared__/models/UserDto.ts` создан с полным содержимым модели

#### Scenario: stub создаётся у каждого item
- **WHEN** canonical-файл записан
- **THEN** для каждого item существует `{item.output}/models/UserDto.ts` содержащий только `export * from '...'`

#### Scenario: имя папки __shared__ фиксировано
- **WHEN** `reuseMode === 'auto-group'`
- **THEN** папка всегда называется `__shared__`, не зависит от конфигурации

#### Scenario: SharedFolderWriter не имеет публичного метода write()
- **WHEN** вызывается `new SharedFolderWriter(lca)` и происходит запись артефакта
- **THEN** запись происходит через `reuseWriterHelpers`, а не через `sharedFolderWriter.write()`

---

### Requirement: при trivial LCA происходит молчаливый fallback к copy
Если `OutputGroupResolver` вернул `null`, `SharedFolderWriter` НЕ ДОЛЖЕН вызываться. Артефакты записываются стандартным copy-based способом. ДОЛЖНО логироваться предупреждение о fallback.

#### Scenario: fallback логируется
- **WHEN** LCA тривиален
- **THEN** в stdout появляется warn-сообщение о fallback

---

### Requirement: stub-файлы интегрируются в barrel-индексы через combineAndWrite
Stub-файлы ДОЛЖНЫ быть зарегистрированы как output-файлы в `WriteClient`, чтобы `combineAndWrite` / `combineAndWrightSimple` корректно включали их в индексы. Порядок: SharedFolderWriter записывает stubs → затем вызывается `combineAndWrite`.

#### Scenario: stub присутствует в barrel-индексе
- **WHEN** `reuseMode === 'auto-group'` и генерация завершена
- **THEN** `index.ts` в output-папке item содержит реэкспорт через stub, а не прямую модель

---

### Requirement: reuseMode: auto-group требует cacheStrategy: reuse
Если `reuseMode === 'auto-group'` и `cacheStrategy !== 'reuse'` — ДОЛЖНО логироваться предупреждение, `reuseMode` игнорируется (fallback к copy).

#### Scenario: несовместимая cacheStrategy вызывает предупреждение
- **WHEN** `reuseMode: "auto-group"` и `cacheStrategy: "content"`
- **THEN** в stdout warn, артефакты пишутся обычным copy-способом

---

### Requirement: shared-папка auto-group включает подкаталог core
Когда активен `reuseMode === "auto-group"` с валидным LCA, фиксированная shared-папка `__shared__` ДОЛЖНА также использоваться для артефактов client core в подкаталоге `core/`, в дополнение к существующим kinds `models` / `schemas` / `enums`. Пути и поведение stub для model/schema/enum ДОЛЖНЫ остаться без изменений.

#### Scenario: models и core сосуществуют под __shared__
- **WHEN** auto-group шарит и модель `UserDto`, и core-файл `ApiError.ts`
- **THEN** существуют и `{LCA}/__shared__/models/UserDto.ts`, и `{LCA}/__shared__/core/ApiError.ts`

#### Scenario: имя shared-папки остаётся __shared__
- **WHEN** записывается shared core
- **THEN** папка по-прежнему называется `__shared__` (не настраивается)

---

### Requirement: auto-group + reuseOnConflict namespace совместимы со schema drift
При одновременном использовании `reuseMode: "auto-group"`, `cacheStrategy: "reuse"` и `reuseOnConflict: "namespace"` генерация ДОЛЖНА успешно завершаться, если в ReuseStore уже есть namespaced-артефакт для той же спеки с другим `schemaHash` (типичный multi-item Marauder-конфиг вроде `example/openapi.marauder.config.json`). Path collision namespaced-артефактов ДОЛЖНА быть исключена включением `schemaHash` в relative path (см. capability `reuse-namespace-paths`).

#### Scenario: smoke openapi.marauder.config.json
- **WHEN** выполняется `generate` с `example/openapi.marauder.config.json` (auto-group + reuse + namespace) и в store уже есть конфликтный enum той же спеки
- **THEN** генерация завершается успешно; shared-core / `__shared__` не блокируются ложным ReuseConflictError «spec vs same spec»
