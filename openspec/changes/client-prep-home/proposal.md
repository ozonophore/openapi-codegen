## Why

Handlebars registration, Client post-process, and DTO/classes prepare still lived under mega-`utils/` while their only generation call site is Generation item session — residual locality gap after write/ and generationCache homes.

## What Changes

- Package `src/core/clientPrep/`: `registerHandlebarTemplates` / `registerHandlebarHelpers`, `prepareDtoModels`, `resolveClassesModeTypes`, all `postProcess*` (client/model/service cluster)
- Tests under `clientPrep/__tests__/` (including `templateRendering.test.ts`)
- No shim / no barrel; delete old `utils/` paths; `GenerationItemSession` imports from `./clientPrep/`
- **Stay put:** `utils/precompileTemplates.ts`; CLI `initOpenApiConfig` Handlebars; `templatesCompiled/` layout
- **Out of scope:** template/prepare semantics; CLI init templates merge

## Capabilities

### New Capabilities

- `client-prep-home`: ClientPrep package locality for templates + postProcess + DTO prepare

### Modified Capabilities

_(none — relocate only)_

## Impact

- Import updates in GenerationItemSession and moved unit tests
