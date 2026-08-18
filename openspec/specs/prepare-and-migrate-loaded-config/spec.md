## ADDED Requirements

### Requirement: Prepare and migrate loaded config
Система MUST предоставлять `prepareAndMigrateLoadedConfig(configData, migrationMode, options?)`, который выполняет `convertArrayToObject`, опционально `omitUndefinedValues`, затем `migrateLoadedConfigToLatest`. Generate adapter и preview MUST использовать helper без ручного convert. `validateAndMigrateConfigData` MUST использовать helper с `omitUndefined: true`. `omitUndefinedValues` MUST жить в `common/utils/`. Array-deprecated warnings MUST оставаться у callers.

#### Scenario: Generate config path uses prepare helper
- **WHEN** CLI generate загружает config file
- **THEN** migrate идёт через `prepareAndMigrateLoadedConfig` с `GENERATE_OPENAPI`

#### Scenario: Validate-config omits undefined
- **WHEN** check/update-config валидирует config
- **THEN** prepare вызывается с `omitUndefined: true` перед migrate
