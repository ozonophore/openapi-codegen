## Why

`GenerationBatchSession.run` still owns a long post-loop finalize procedure (combine → traffic/swarm → stale → cache → specAnalysis → reuse → report → ESLint). Architecture grill: deepen into `finalizeGenerationBatch(ctx)`.

## What Changes

- Add `src/core/finalizeGenerationBatch.ts` owning post-loop order + stale cleanup + batch ESLint
- Thin session: setup + item loop + `finalizeGenerationBatch(ctx)` + `shutdownLogger`
- Shared mutable `state` for report timing / specQuality / accumulator nulling; session passes `makeReportParams`
- **Out of scope:** setup/loop rethink; IndexCombine host; finalize order/semantics change

## Capabilities

### New Capabilities

- `generation-batch-finalize`: Post-loop generation batch finalize as one free-function module

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `finalizeGenerationBatch.ts`, slim `GenerationBatchSession.ts`
- No BREAKING public API
