## Why

Finalize was deepened into a leaf; pre-loop bootstrap (cache/reuse/sharedFolder/preAnalyze) still lives inside `GenerationBatchSession.run`, leaving asymmetric depth. Architecture #4: extract paired setup leaf.

## What Changes

- Add `setupGenerationBatch` in `src/core/setupGenerationBatch.ts` (full pre-loop incl. warm preAnalyze + path helpers/warn*)
- Session keeps empty check, STARTED, item loop + conflict dump, finalize call, `shutdownLogger`
- Result bag includes flags, caches/reuse, mutable counter seeds, `makeReportParams`, `start`
- **Out of scope:** finalize/root bag/item/write rethink; GenerationCache folder move

## Capabilities

### New Capabilities

- `generation-batch-setup`: Pre-loop batch bootstrap leaf paired with finalize

### Modified Capabilities

_(none — behavioral preserve)_

## Impact

- `GenerationBatchSession.ts`, new `setupGenerationBatch.ts`, batch tests
