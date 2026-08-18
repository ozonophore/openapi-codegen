## ADDED Requirements

### Requirement: Write package locality
Система MUST хранить WriteClient facade, `writeClientArtifacts` и все free-function `writeClient*` leaves в `src/core/write/`. MUST NOT оставлять implementation в `src/core/utils/writeClient*` или `src/core/WriteClient.ts` без shim. `CoreOutputAdapter` и `modelsLayoutHelpers` MAY оставаться вне package. Behavior MUST быть bit-identical.

#### Scenario: Facade and IndexCombine import from write/
- **WHEN** OpenApiClient constructs WriteClient и IndexCombine flush вызывает full/simple index leaves
- **THEN** imports резолвятся из `src/core/write/`
