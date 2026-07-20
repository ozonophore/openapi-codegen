## MODIFIED Requirements

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
