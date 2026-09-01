## Purpose

Общий Spec resolve prologue и два режима (`forContext` / `forSemantic`) в `src/core/specLoad/`; на прежних путях остаются тонкие фасады.

## Requirements

### Requirement: Spec-load пакет владеет общим resolve и режимами
Система MUST выполнять общий OpenAPI resolve prologue (path/empty/exists/`SwaggerParser.resolve`/root get) и продолжение по режиму через внутренний пакет `src/core/specLoad/`: **forContext** (attach Context + root) и **forSemantic** (expand-клон для файла и in-memory объекта).

#### Scenario: Generate по-прежнему использует фасад createResolvedContext
- **WHEN** Generation item session или preAnalyze загружает Spec
- **THEN** MUST вызывать `createResolvedContext`, который делегирует в Spec-load forContext без смены return shape `{ context, openApi }`

#### Scenario: Analyze-diff по-прежнему использует фасады semantic load
- **WHEN** analyze-diff загружает file или in-memory Spec для semantic compare
- **THEN** MUST вызывать `loadSemanticOpenApiSpec` / `loadSemanticOpenApiObject`, делегирующие в Spec-load forSemantic

---

### Requirement: Тонкие фасады и внутренний barrel
`createResolvedContext` и `loadSemanticOpenApi*` MUST остаться тонкими фасадами на прежних путях. Spec-load barrel MUST NOT реэкспортироваться из `src/core/index.ts`. Git `parseContent` / `readSpecFromGit` MUST остаться в CLI-адаптере.

#### Scenario: Публичный core index не экспортирует specLoad
- **WHEN** потребитель импортирует `src/core/index.ts`
- **THEN** Spec-load package отсутствует среди exports

---

### Requirement: Semantic expand intern-совпадает с ключами резолвера
`expandOpenApiRefsForSemanticDiff` MUST intern-сопоставлять склеенные файловые `$ref` с ключами резолвера парсера (общее intern-сравнение ключей: свёртка слешей, percent-encoding, регистр буквы диска) до `get` / `exists`. Expand MUST сохранять свой конвейер expand `$ref` и MUST NOT импортировать класс `RefLookup`. В `refs.get` / `refs.exists` MUST уходить intern-точный ключ парсера, не только ключ сравнения. Неразрешённые `$ref`, у которых нет intern-эквивалентного ключа парсера, MUST оставаться стабильными объектами `$ref`.

#### Scenario: Склеенный на Windows User.yaml разворачивается
- **WHEN** Tree `$ref` равен `./schemas/User.yaml`, а у резолвера эта схема лежит под intern-эквивалентным ключом парсера (слеши, регистр буквы диска или кодировка отличаются от склеенного пути)
- **THEN** expand MUST заменить объект `$ref` значением резолвера и MUST NOT оставлять `./schemas/User.yaml` неразвёрнутым

#### Scenario: Склеенный на Windows Pointer common.yaml разворачивается
- **WHEN** Tree `$ref` равен `./schemas/common.yaml#/components/schemas/User` (или эквивалентный Pointer), а у резолвера этот Canonical Ref лежит под intern-эквивалентным ключом
- **THEN** expand MUST развернуть этот узел; MUST NOT оставлять файловый+Pointer `$ref` неразвёрнутым из-за intern-орфографии

#### Scenario: Expand не импортирует RefLookup
- **WHEN** semantic-diff загружает спеку через `forSemantic` / expand
- **THEN** expand / specLoad MUST NOT импортировать класс `RefLookup`; intern-совпадение ключей MUST идти через общий helper сравнения

#### Scenario: Склейка не изобретает диск
- **WHEN** Parent source file равен `/tmp/openapi/api.yaml`, а Tree `$ref` равен `./schemas/User.yaml`
- **THEN** склеенный кандидат MUST быть `/tmp/openapi/schemas/User.yaml` и MUST NOT получать букву текущего диска (`D:/tmp/…`)

#### Scenario: Expand и RefLookup склеивают одним модулем
- **WHEN** expand склеивает относительный файловый Tree `$ref` с Parent source file
- **THEN** склейка MUST идти через `joinTreeRefFile` (тот же модуль, что `$ref` lookup) и MUST NOT импортировать класс `RefLookup`

#### Scenario: Буква диска не URL
- **WHEN** Parent source file равен `D:/tmp/openapi/api.yaml`, а Tree `$ref` равен `./schemas/User.yaml`
- **THEN** expand MUST склеить в `D:/tmp/openapi/schemas/User.yaml` и MUST NOT считать `D:` схемой URL

---

### Requirement: Поведение сохраняется
Семантика lazy-ref и attach Virtual file map в Context MUST остаться как в Spec-load unify. Semantic expand MUST сохранять свой конвейер (без импорта `RefLookup`), но MUST intern-совпадать с ключами парсера, как задано в требовании intern-совпадения expand; промах по точному совпадению строк для intern-эквивалентных ключей больше не сохраняется. Entity-skip / Diff / options MUST NOT меняться из-за intern-совпадения ключей.

#### Scenario: Существующие сьюты остаются гейтом
- **WHEN** change готов
- **THEN** тесты `createResolvedContext` и загрузки expand / semantic MUST проходить, включая intern-кейсы expand для `./schemas/User.yaml` и `./schemas/common.yaml#/…`

---

### Requirement: Git readSpecFromGit пути — POSIX
`readSpecFromGit` (CLI-адаптер) MUST передавать POSIX-пути в Git (`test/spec/v3.json`). Он MUST NOT передавать разделители Windows (`test\\spec\\v3.json`).

#### Scenario: git show получает путь со слешем
- **WHEN** analyze-diff загружает спеку из Git ref на Windows
- **THEN** путь после `ref:` MUST быть POSIX (`test/spec/v3.json`), не `test\\spec\\v3.json`
