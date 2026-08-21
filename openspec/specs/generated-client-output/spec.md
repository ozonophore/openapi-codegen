## Purpose

Запись generated artifacts и post-generation output lifecycle.

**Related deltas:** `models-classes-layout`, `yup-boolean-coercion`, `write-client-concern-split`, `reuse-write-session`.

## Requirements

### Requirement: Stale output cleanup после генерации
После успешной multi-spec генерации система MUST удалить файлы и пустые директории в output roots, которых нет в expected output set текущего run.

#### Scenario: Удалённая модель в новой спеке
- **WHEN** предыдущий run создал `models/OldModel.ts`, текущий run его не генерирует
- **THEN** файл удаляется при cleanup stale outputs

---

### Requirement: Separated vs combined indexes
При `useSeparatedIndexes=true` MUST вызываться combineAndWriteSimple; иначе combineAndWrite для единого index.

#### Scenario: Separated indexes
- **WHEN** useSeparatedIndexes включён для multi-spec конфига
- **THEN** создаются отдельные index для core, models, schemas, services

---

### Requirement: excludeCoreServiceFiles пропускает core и services
Когда excludeCoreServiceFiles=true, запись core transport и service files MUST быть пропущена; models и schemas MUST генерироваться если включены.

#### Scenario: Только models/schemas
- **WHEN** excludeCoreServiceFiles true и includeSchemasFiles true
- **THEN** в output нет core/ и services/ артефактов, schemas присутствуют

---

### Requirement: Empty schema strategy
Стратегия emptySchemaStrategy MUST управлять тем, сохраняются ли пустые generated schemas или отфильтровываются (keep vs omit).

#### Scenario: KEEP strategy
- **WHEN** emptySchemaStrategy keep и schema без properties
- **THEN** пустая schema включается в output schemas

---

### Requirement: Write-if-changed statistics
Каждая запись файла MUST учитываться как written или unchanged; по завершении run MUST логироваться суммарная статистика.

#### Scenario: Повторная генерация без изменений
- **WHEN** content cache или writeFileIfChanged определяет идентичное содержимое
- **THEN** unchanged counter увеличивается, файл не перезаписывается

---

### Requirement: Reuse store path resolution
При reuse cache store path MUST интерпретироваться как absolute если начинается с `/` или drive letter; иначе relative к cwd с default `.openapi-codegen-store`.

#### Scenario: Relative store path
- **WHEN** cachePath `.my-store` без leading slash
- **THEN** store root = resolve(cwd, `.my-store`)
