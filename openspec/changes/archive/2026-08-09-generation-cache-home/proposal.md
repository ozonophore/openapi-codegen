## Why

EntitySkip deepened into `generationCache/`, but `GenerationCache` still lives in mega-utils — split locality across an accidental folder seam.

## What Changes

- Move `GenerationCache.ts` → `src/core/generationCache/GenerationCache.ts`
- Move unit test → `generationCache/__tests__/GenerationCache.test.ts`
- Update imports; delete old utils paths (no shim)
- **Out of scope:** on-disk format; EntitySkip/fingerprint; batch setup rethink; `core/index` export

## Capabilities

### New Capabilities

- `generation-cache-home`: GenerationCache colocated with EntitySkip under generationCache/

### Modified Capabilities

_(none — relocate only)_

## Impact

- Import path updates in batch/item/setup/finalize/EntitySkip; utils cleanup
