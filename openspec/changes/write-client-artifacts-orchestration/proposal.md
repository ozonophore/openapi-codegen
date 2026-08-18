## Why

After concern split + leaf adapters, WriteClient still owns ~200 LOC per-item write order (`writeClient` / `writeModelsAndFinalize`). Architecture grill: deepen into free `writeClientArtifacts` on `CoreOutputAdapter` + IndexCombine `register` duck.

## What Changes

- Add `src/core/writeClientArtifacts.ts` with `writeClientArtifacts` + `TWriteClientProps`; private `writeModelsAndFinalize` helper
- Thin `WriteClient.writeClient` → delegate; leaf bindings / combine* unchanged
- Behavioral preserve WriteClient tests
- **Out of scope:** IndexCombineWriteHost rethink; write-order semantics; batch finalize; `core/index` export

## Capabilities

### New Capabilities

- `write-client-artifacts-orchestration`: Per-item client artifact write order as a deep free-function module

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `writeClientArtifacts.ts`, slim `WriteClient.ts`
- No BREAKING public API
