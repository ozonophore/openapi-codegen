## Context

HEAD after write-split: `OpenApiClient.normalizeOptions` / `addDefaultValues` still on the facade. `generate()` in `core/index.ts` calls `validateRawOptions` → `process.exit(1)`. Six item schema fields are overwritten from root. Grilling (PDTCH-191, 4cdd): extract resolve; throw not exit; fold item-level overrides here. Keep `generate(rawOptions)` (no ctor injection). Keep HEAD miracles `item ?? root`.

## Goals / Non-Goals

**Goals:**
- One module owns raw → strict items
- Invalid options throw
- Item overrides for the six schema fields
- Facade only wires sessions

**Non-Goals:**
- Field-list tables / fingerprint bump
- Ctor-injected OpenApiClient
- CLI override adapter deepen

## Decisions

### Decision 1: `resolveGenerationOptions(raw)`
Validate with same Zod schema + `dependentOptionsRefinement`; on failure `throw new Error(errors.join('\n'))`. Then flatten + defaults.

### Decision 2: Item overrides
`item.X ?? rawOptions.X` for `interfacePrefix`, `enumPrefix`, `typePrefix`, `useCancelableRequest`, `sortByRequired`, `useSeparatedIndexes`. Keep existing `??` for request/plugins/disableBuiltinPlugins/strictPluginMode/useHistory/diffReport/modelsMode/modelsLayout. Keep HEAD `miracles: item.miracles ?? rootMiracles`.

### Decision 3: HEAD generate wiring
`OpenApiClient.generate(rawOptions)` → `resolveGenerationOptions(rawOptions)`. `core/index.ts` drops `validateRawOptions`. Delete the file.

### Decision 4: Internal
Do not export from `src/core/index.ts`.

## Risks / Trade-offs

- **[Risk] Callers that assumed process.exit** → CLI already catches throws → `CLICommandResult`
- **[Risk] Item prefix overrides change generated names** → Intended bugfix

## Migration Plan

- Internal; programmatic invalid options now throw
- Rollback: revert

## Open Questions

_(none)_
