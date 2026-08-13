## ADDED Requirements

### Requirement: Resolved Context factory
The system MUST provide `createResolvedContext` that, given a spec file path and Context construction props, loads and resolves the OpenAPI document, initializes refs and the virtual file map internally, and returns `{ context, openApi }` ready for parsing. Production generate and preAnalyze paths MUST use this factory and MUST NOT call public two-step init. `getOpenApiSpec` MUST NOT remain as a production helper.

#### Scenario: Successful resolve
- **WHEN** caller invokes `createResolvedContext` with an existing spec path
- **THEN** returned context is ready for parsers (refs + virtual map initialized) and `openApi` is the root document

#### Scenario: Missing file
- **WHEN** spec path does not exist
- **THEN** factory fails with a clear error before returning a Context

#### Scenario: Empty path
- **WHEN** spec path is empty
- **THEN** factory fails with a clear empty-path error

#### Scenario: Half-init not part of public API
- **WHEN** application code uses the supported generation path
- **THEN** it MUST NOT need to call `addRefs` or `initializeVirtualFileMap` as separate public steps

---

### Requirement: Context refs stay uninitialized until attach
`Context` MUST NOT assign a dummy `_refs` object in the constructor. Until `attachResolvedOpenApi` (or equivalent internal attach) runs, `values` / `get` / `paths` / `exists` MUST throw that Context is not initialized. `initializeVirtualFileMap` MUST NOT take an unused `rootSchema` argument.

#### Scenario: values before attach
- **WHEN** a Context is constructed and `values()` is called before attach
- **THEN** it MUST throw that Context must be initialized (not fail as a missing method on `{}`)
