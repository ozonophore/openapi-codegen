## ADDED Requirements

### Requirement: Shared V2/V3 prepare on Generation item session
`GenerationItemSession` MUST готовить Client через private `prepareClientFromOpenApi`: parse callback → apply Diff if needed → `postProcessClient` → optional classes/DTO. Switch по `OpenApiVersion` MUST только выбирать Parser/`parse` и version-specific writing log (`WRITING_V2` / `WRITING_V3`).

#### Scenario: V2 and V3 share prepare steps
- **WHEN** item session парсит OpenAPI 2 или 3
- **THEN** applyDiff, postProcess и DTO выполняются одним helper, без дублирования arm body

#### Scenario: Version writing logs preserved
- **WHEN** prepare завершён для V2 или V3
- **THEN** логируется соответствующий `LOGGER_MESSAGES.OPENAPI.WRITING_V2` или `WRITING_V3`
