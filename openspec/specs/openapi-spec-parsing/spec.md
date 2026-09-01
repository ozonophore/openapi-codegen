## Purpose

Парсинг OpenAPI 2.x/3.x в internal Client model.

**Related delta:** `spec-load-unify`, `context-resolved-factory`, `models-classes-layout` (classes layout, DTO wiring, imports), `canonical-ref-lookup`, `schema-registry-model-filter`.

## Requirements

### Requirement: Поддерживаются только OpenAPI 2.x и 3.x
Версия спеки MUST определяться по первому символу поля `swagger` или `openapi`. Значения, отличные от 2 и 3, MUST приводить к ошибке «Unsupported Open API version».

#### Scenario: OpenAPI 3.0
- **WHEN** спека содержит `"openapi": "3.0.3"`
- **THEN** используется v3 parser pipeline

#### Scenario: Неподдерживаемая версия
- **WHEN** спека содержит `"openapi": "4.0"`
- **THEN** генерация прерывается с ошибкой unsupported version

---

### Requirement: Раздельные parser pipelines для v2 и v3
После определения версии MUST использоваться соответствующий parser; смешение моделей v2/v3 в одном run не допускается.

#### Scenario: Swagger 2.0 spec
- **WHEN** версия определена как V2
- **THEN** internal Client model строится через v2 parser, лог содержит «Writing v2»

---

### Requirement: Context ref resolution
При разрешении `$ref` lookup MUST переводить (Parent source file, Tree `$ref`) в Canonical Ref, равный ключу `$Refs`, через единый URI+intern переводчик. Lookup MUST NOT нормализовать `file#/Pointer` через filesystem path APIs. Несуществующие `$ref` MUST быть обнаруживаемы через exists-check контекста (промах intern или промах парсера).

#### Scenario: Unresolved ref в strict mode
- **WHEN** strict validation включена и `$ref` не resolves
- **THEN** в strict report регистрируется issue с code UNRESOLVED_REF

#### Scenario: Относительный файловый `$ref` идёт от файла-родителя, не от корня спеки
- **WHEN** Tree `$ref` равен `Pet.yaml` внутри `/schemas/Owner.yaml`
- **THEN** Context `get` / `exists` MUST целиться в intern-ключ соседнего файла, а не в путь относительно Entry file

---

### Requirement: Classes mode post-processing
Когда `modelsMode=classes`, parsed Client MUST пройти prepareDtoModels и resolveClassesModeTypes перед записью; interfaces mode пропускает этот pipeline.

#### Scenario: Classes mode generation
- **WHEN** modelsMode classes и layout per-file
- **THEN** модели записываются как class definitions после DTO preparation

---

### Requirement: Diff report annotations до write
Когда загружен diff report, annotations MUST применяться к parsed Client до postProcessClient и записи файлов.

#### Scenario: useHistory без report file
- **WHEN** `useHistory: true` но diff report файл отсутствует
- **THEN** генерация продолжается с warning, diff annotations не применяются

---

### Requirement: Output mapping intern-ключи парсера в сгенерированный .ts
Output mapping MUST отображать intern-точный source file локального Canonical Ref в сгенерированный путь `.ts` под Virtual file map. Когда `specRoot` нормализован в POSIX, а ключ парсера использует `\`, Output mapping MUST всё равно класть файл под `outputModels`. Output mapping MUST NOT быть `$ref` lookup и MUST NOT применяться к Remote `$ref`. Отсутствие `Nested.ts` из `#/properties/…` MUST NOT считаться шумом CRLF-снимков.

#### Scenario: POSIX specRoot vs ключ парсера с обратными слешами
- **WHEN** `specRoot` Entry file задан со слешами POSIX, а ключ Virtual file map — intern-точный путь парсера с `\` для локального файла схемы
- **THEN** Output mapping MUST записать `.ts` этого файла под `outputModels` (`relativeHelper` MUST NOT выбросить его за пределы сгенерированного дерева)

#### Scenario: Nested.ts из #/properties на v3.withDifferentRefs
- **WHEN** `generate()` запускается на `v3.withDifferentRefs` и завершается
- **THEN** сгенерированное дерево MUST содержать `Nested.ts` из `#/properties/…`, а индекс MUST по-прежнему экспортировать `INested` (и `TProp` / `Prop.ts` как сейчас)
- **THEN** если файла нет, причина MUST быть подтверждена как Output mapping (исход 1) или идентичность / фильтр модели (исход 2) до фикса; MUST NOT приписываться CRLF-снимкам

#### Scenario: Semantic-diff +1 на той же фикстуре — тот же поток
- **WHEN** semantic-diff `v3.withDifferentRefs` сообщает +1 breaking
- **THEN** расследование MUST считать intern-промах expand и идентичность/Output mapping Nested.ts одним потоком, а не отдельным сбоем CRLF или pathHelpers
