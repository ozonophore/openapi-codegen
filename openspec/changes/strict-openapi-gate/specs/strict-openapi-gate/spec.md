## ADDED Requirements

### Requirement: Strict OpenAPI gate owns generate-path strict block
Система MUST предоставлять `runStrictOpenApiGate`, который выполняет `validateWithSwaggerParser`, `loadGovernanceConfig`, `validateOpenApiStrict`, `writeOpenApiStrictReport`, логирует создание отчёта и при ошибках бросает те же Error messages, что и прежний Generation item session block. Generation item session MUST вызывать gate только когда `strictOpenapi` истинно и MUST NOT дублировать эти шаги inline.

#### Scenario: Strict summary errors fail generation
- **WHEN** gate пишет report и `report.summary.errors > 0`
- **THEN** бросается Error с текстом `Strict OpenAPI validation failed with N error(s). Report: <path>`

#### Scenario: Governance fail flag
- **WHEN** `failOnGovernanceErrors` истинно и `report.governance.summary.errors > 0` при нулевых strict summary errors
- **THEN** бросается Error с текстом `Governance validation failed with N error(s). Report: <path>`

#### Scenario: Success returns paths
- **WHEN** нет failing errors
- **THEN** gate возвращает `{ reportPath, report }` и логирует strict report created
