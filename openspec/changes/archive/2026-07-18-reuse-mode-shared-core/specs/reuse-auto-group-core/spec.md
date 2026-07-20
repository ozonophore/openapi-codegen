## ADDED Requirements

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
