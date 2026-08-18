## Purpose

Парсинг OpenAPI 2.x/3.x в internal Client model.

**Related delta:** `spec-load-unify`, `context-resolved-factory`, `models-classes-layout` (classes layout, DTO wiring, imports).

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
При разрешении `$ref` lookup MUST нормализовать ref относительно parent source file. Несуществующие ref MUST быть обнаруживаемы через exists-check контекста.

#### Scenario: Unresolved ref в strict mode
- **WHEN** strict validation включена и `$ref` не resolves
- **THEN** в strict report регистрируется issue с code UNRESOLVED_REF

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
