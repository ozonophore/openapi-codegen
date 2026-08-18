## Why

After `write-client-concern-split`, leaf `writeClient*` utils still bind `this: WriteClient`, and `writeSharedOrLocalCoreFile` takes the class. Models/schemas already use narrow `ReuseOutputAdapter`; shared-core never got the seam. Architecture grill locked `CoreOutputAdapter`.

## What Changes

- Add `src/core/CoreOutputAdapter.ts` (type + `toCoreOutputAdapter` + `toReuseOutputAdapter`)
- Convert all `writeClient*` to `writeClient*(adapter, options)`; shared-core takes adapter
- `WriteClient` thin public methods inject `toCoreOutputAdapter()`; keep orchestration/tests/IndexCombine host surface
- Behavioral preserve existing suites

## Capabilities

### New Capabilities

- `write-client-leaf-adapters`: CoreOutputAdapter seam for leaves and shared-core writes

### Modified Capabilities

_(none)_

## Impact

- `src/core/CoreOutputAdapter.ts`, `WriteClient.ts`, `utils/writeClient*`, `reuseStore/writeSharedCoreFile.ts`, related tests
- No public `core/index` export; no item/batch dep narrowing
