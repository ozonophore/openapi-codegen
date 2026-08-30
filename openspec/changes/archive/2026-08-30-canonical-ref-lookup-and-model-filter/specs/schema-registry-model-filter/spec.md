## ADDED Requirements

### Requirement: Non-schema component registries не являются Models
Canonical Ref MUST считаться Model’ом, если только его уже разрезанный Pointer не начинается с префикса non-schema registry. В denylist MUST входить OAS3 `#/components/responses|parameters|headers|requestBodies|examples|securitySchemes|links|callbacks|pathItems/` и OAS2 `#/responses/`, `#/parameters/`, `#/securityDefinitions/`. Префиксы schema-реестров (`#/components/schemas/`, `#/definitions/`) MUST NOT быть в denylist. Пустой или отсутствующий Pointer (идентичность целого файла) MUST оставаться Model. Pointers структуры схемы (`#/properties`, `#/items`, `#/allOf`, …) MUST оставаться Models.

#### Scenario: Одноимённые OAS3 schema и non-schema registries
- **WHEN** спека задаёт `components.schemas.ErrorResponse` и одноимённые записи в responses, parameters, headers, requestBodies, examples, securitySchemes, links и callbacks, на которые ссылаются операции
- **THEN** `getModels` MUST экспортировать ровно одну модель `IErrorResponse` (или prefixed-имя схемы) и MUST NOT экспортировать пустой `ErrorResponse` из этих non-schema объектов

#### Scenario: Компонент только из requestBodies не является Model
- **WHEN** единственный `$ref` на `SimpleRequestBody` — `#/components/requestBodies/SimpleRequestBody`
- **THEN** сбор Canonical Refs MAY по-прежнему перечислять этот Pointer, но `getModels` MUST NOT эмитить `SimpleRequestBody` / `ISimpleRequestBody`

#### Scenario: Целый файл и вложенные `#/properties` остаются Models
- **WHEN** среди Canonical Refs есть `$ref` на весь файл и Pointers под `#/properties/`
- **THEN** эти Canonical Refs MUST по-прежнему давать Models (`isModelPointer` true)

---

### Requirement: getModels и reuse schema map делят один denylist
v2 и v3 `getModels` MUST пропускать Canonical Refs, чей Pointer в denylist. `buildModelSchemaMap` MUST пропускать те же Pointers, чтобы совпавшее имя компонента указывало на Schema Object, а не на Response / Request Body Object. `stripNamespace` MAY срезать и schema, и non-schema префиксы для **имён типов** и MUST NOT использоваться как идентичность Model.

#### Scenario: Ключ reuse-карты ErrorResponse — Schema Object
- **WHEN** Canonical Refs содержат и `#/components/schemas/ErrorResponse`, и `#/components/responses/ErrorResponse`
- **THEN** `buildModelSchemaMap` MUST сохранить Schema Object под ключом `ErrorResponse` и MUST NOT сохранить под ним Response Object

#### Scenario: OAS2 definitions против responses
- **WHEN** OAS2-спека содержит `#/definitions/ErrorResponse` и `#/responses/ErrorResponse` (а также `#/parameters/`, `#/securityDefinitions/`), на которые ссылаются paths
- **THEN** `getModels` MUST экспортировать модель definition-схемы и MUST NOT экспортировать Response Object как Model
