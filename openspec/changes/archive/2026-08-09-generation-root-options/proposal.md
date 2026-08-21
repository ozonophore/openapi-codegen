## Why

After options resolve, batch/finalize still take full `TRawOptions` to read five root-lived fields that never inherit into items. Architecture #1: typed root bag closes interface leakage across the batch seam.

## What Changes

- `resolveGenerationOptions` returns `{ items, root: GenerationRootOptions }`
- `GenerationRootOptions` = Pick of `reuseMode`, `preAnalyze`, `trafficSplitter`, `swarm`, `workspaceReport` (raw-as-is)
- Batch session + finalize take `root` instead of `rawOptions`
- Items stay bit-identical (no ROOT_ONLY inherit for these five)
- **Out of scope:** batch setup extract; GenerationCache move; widen bag; defaults in bag

## Capabilities

### New Capabilities

- `generation-root-options`: Typed root bag for batch/finalize from options resolve

### Modified Capabilities

_(none — items bit-identical; batch wiring only)_

## Impact

- `resolveGenerationOptions.ts`, `OpenApiClient.ts`, `GenerationBatchSession.ts`, `finalizeGenerationBatch.ts`, field-lists tests
