## ADDED Requirements

### Requirement: ClientPrep package locality
Система MUST хранить Handlebars registration (`registerHandlebarTemplates`, `registerHandlebarHelpers`), Client post-process cluster (`postProcessClient` и model/service leaves), `prepareDtoModels` и `resolveClassesModeTypes` в `src/core/clientPrep/`. MUST NOT оставлять эти implementation в `src/core/utils/` без shim. `utils/precompileTemplates.ts` и CLI `initOpenApiConfig` Handlebars MAY оставаться вне package. Behavior MUST быть bit-identical.

#### Scenario: Generation item session imports from clientPrep/
- **WHEN** GenerationItemSession регистрирует templates и готовит Client (postProcess / DTO / classes)
- **THEN** imports резолвятся из `src/core/clientPrep/`
