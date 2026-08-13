## Context

HEAD after entity-skip fingerprint: `ReuseWriterContext` already exists in helpers but Write still takes a 9-field bag and reassembles with `inputPath ?? specInput`. Dual finalize drops `inputPath` when `validationLibrary !== NONE`. `writeOutputFile` has a size short-circuit.

Grilling (PDTCH-191 phase 1, cf7): fold bag; fix `inputPath` and drop `expectedByteSize` in this seam.

## Goals / Non-Goals

**Goals:**
- Opaque reuse handle across Write seam
- Helpers free of WriteClient class dependency
- `inputPath` cannot drift between validation/non-validation paths
- Reuse hit writes go through content comparison, not byteSize

**Non-Goals:**
- Changing reuse hit/miss/conflict semantics (except the size short-circuit)
- Expanding itemRunContext with Write fields
- Reuse for services/core
- modelsMode conflict guard / typo renames

## Decisions

### Decision 1: Props shape
`reuse?: ReuseWriterContext` on WriteClient / writeClientModels / writeClientSchemas.

### Decision 2: Adapter
```ts
export type ReuseOutputAdapter = {
  writeOutputFile: (file: string, content: string) => Promise<unknown>;
  registerLintTarget?: (file: string, outputDir?: string) => void;
};
```
Helpers take adapter, not WriteClient.

### Decision 3: Context required fields
When `reuse` is defined: reuseStore, optionsSlice, specInput, inputPath, modelSchemas required.

### Decision 4: Single finalize
Schemas (if any) then one `writeModelsAndFinalize` including `reuse`.

### Decision 5: OpenApiClient
Build `reuse` once; one `writeProps` after V2/V3 prepare.

### Decision 6: writeOutputFile
No `expectedByteSize` option. Always `writeFileIfChanged`.

## Risks / Trade-offs

- **[Risk] Reuse hits that previously skipped by size now hash content** → Correctness; slight I/O on same-size different content (the bug) and extra read when size matches and content matches
- **[Risk] Test that passed bare inputPath** → Use `reuse:`

## Migration Plan

- Internal only
- Rollback: revert

## Open Questions

_(none)_
