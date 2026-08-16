## Purpose

Owns raw config → strict items: Zod validate (throws) + flatten/inherit/defaults, including item-level overrides for schema fields.

## Requirements

### Requirement: Generation options resolve owns raw-to-strict items
The system MUST run options meaning (Zod validate + flatten items|flat + inherit + defaults) through an internal **Generation options resolve** (`resolveGenerationOptions` in `src/core/resolveGenerationOptions.ts`), not through private methods on `OpenApiClient` and not through `validateRawOptions` with `process.exit`.

After `resolveGenerationOptions`, `OpenApiClient.generate` MUST apply `normalizePathsToAbsolute(result, process.cwd())` before passing items to `GenerationBatchSession.run`.

#### Scenario: Facade calls resolve, then normalize, then batch
- **WHEN** `OpenApiClient.generate` runs
- **THEN** it MUST obtain `TStrictFlatOptions[]` from `resolveGenerationOptions(rawOptions)`, then call `normalizePathsToAbsolute(result, process.cwd())`, and only then pass the normalized items to `GenerationBatchSession.run` together with `root`

#### Scenario: Public generate does not validate separately
- **WHEN** `core/index.ts` `generate(rawOptions)` is called
- **THEN** it MUST NOT call a separate `validateRawOptions`; validation happens inside resolve

---

### Requirement: Invalid raw options throw
`resolveGenerationOptions` MUST **throw** on Zod validation failure. It MUST NOT call `process.exit` or `shutdownLogger` in order to exit. `validateRawOptions.ts` MUST be removed.

#### Scenario: Programmatic invalid options surface as exception
- **WHEN** programmatic `generate` receives invalid `TRawOptions`
- **THEN** the error MUST propagate as a thrown exception, not terminate the process inside a core validate helper

#### Scenario: CLI maps throw to CLICommandResult
- **WHEN** CLI `generateOpenApiClient` receives a throw from `OpenAPI.generate` due to invalid options
- **THEN** the existing catch MUST return `{ success: false, … }`

---

### Requirement: Item-level overrides for schema item fields
When `items[]` is present, `resolveGenerationOptions` MUST take `item.X ?? rawOptions.X` for `interfacePrefix`, `enumPrefix`, `typePrefix`, `useCancelableRequest`, `sortByRequired`, and `useSeparatedIndexes`. It MUST NOT overwrite those fields from root only.

#### Scenario: Item prefix wins over root
- **WHEN** root has `interfacePrefix: "I"` and an item has `interfacePrefix: "X"`
- **THEN** that item’s resolved options MUST use `"X"`

#### Scenario: Missing item field inherits root
- **WHEN** root has `sortByRequired: true` and an item omits `sortByRequired`
- **THEN** that item’s resolved options MUST use `true`

---

### Requirement: Resolve module is internal
`resolveGenerationOptions` MUST NOT be re-exported from `src/core/index.ts`.

#### Scenario: Public core index omits resolve
- **WHEN** a consumer imports `src/core/index.ts`
- **THEN** `resolveGenerationOptions` is absent from exports
