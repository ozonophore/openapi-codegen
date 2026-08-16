## ADDED Requirements

### Requirement: Semantic expand intern-matches resolver keys
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

#### Scenario: Буква диска не URL
- **WHEN** Parent source file равен `D:/tmp/openapi/api.yaml`, а Tree `$ref` равен `./schemas/User.yaml`
- **THEN** expand MUST склеить в `D:/tmp/openapi/schemas/User.yaml` и MUST NOT считать `D:` схемой URL

---

## MODIFIED Requirements

### Requirement: Behavioral preserve
Семантика lazy-ref и attach Virtual file map в Context MUST остаться как в Spec-load unify. Semantic expand MUST сохранять свой конвейер (без импорта `RefLookup`), но MUST intern-совпадать с ключами парсера, как задано в требовании intern-совпадения expand; промах по точному совпадению строк для intern-эквивалентных ключей больше не сохраняется. Entity-skip / Diff / options MUST NOT меняться из-за intern-совпадения ключей.

#### Scenario: Существующие сьюты остаются гейтом
- **WHEN** change готов
- **THEN** тесты `createResolvedContext` и загрузки expand / semantic MUST проходить, включая intern-кейсы expand для `./schemas/User.yaml` и `./schemas/common.yaml#/…`
