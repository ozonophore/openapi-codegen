## ADDED Requirements

### Requirement: preAnalyze загружает generator plugins
`runPreAnalyze` MUST создавать Context с плагинами, загруженными из эффективной конфигурации item `plugins` и флага `disableBuiltinPlugins`, идентично `OpenApiClient.generateSingle`. Передача пустого массива plugins запрещена.

#### Scenario: Плагин влияет на parse context preAnalyze
- **WHEN** item настраивает плагин с `resolveSchemaTypeOverride` и `preAnalyze: true`
- **THEN** Context preAnalyze вызывает этот плагин при парсинге схем

#### Scenario: strictPluginMode в preAnalyze
- **WHEN** item устанавливает `strictPluginMode: true` и плагин падает в resolveSchemaTypeOverride во время preAnalyze
- **THEN** preAnalyze пробрасывает ошибку
