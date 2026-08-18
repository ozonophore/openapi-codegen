## ADDED Requirements

### Requirement: Default-plans migrate wiring helper
Система MUST предоставлять `migrateLoadedConfigToLatest(rawInput, migrationMode)`, который вызывает `migrateDataToLatestSchemaVersion` с `allMigrationPlans` и `allVersionedSchemas`. MUST возвращать тот же результат, что engine (`успех | null`), без собственного throw. MUST NOT выполнять `convertArrayToObject`, `omitUndefined` или stripDefaults.

#### Scenario: Generate config path uses helper
- **WHEN** CLI generate загружает config и мигрирует с `EMigrationMode.GENERATE_OPENAPI`
- **THEN** миграция идёт через `migrateLoadedConfigToLatest` (не прямой triad hand-wire)

#### Scenario: Validate-config uses helper
- **WHEN** check/update-config вызывает `validateAndMigrateConfigData`
- **THEN** migrate stage использует helper с `EMigrationMode.VALIDATE_CONFIG`; stripDefaults остаётся после helper

#### Scenario: Null failure passthrough
- **WHEN** engine не может мигрировать вход
- **THEN** helper возвращает `null` и caller сохраняет свой failure path (`migration_failed` / throw / log)
