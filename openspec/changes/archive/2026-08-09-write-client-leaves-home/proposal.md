## Why

Write concern split + leaf adapters landed, but leaf implementations and the WriteClient facade still sat in mega-utils / core root — residual locality gap.

## What Changes

- Package `src/core/write/`: all `writeClient*` leaves + `writeClientArtifacts` + `WriteClient` facade
- Tests under `write/__tests__/`; templates mock stays in `utils/__mocks__`
- No shim / no barrel; delete old paths
- `modelsLayoutHelpers` / `CoreOutputAdapter` stay put
- **Out of scope:** leaf behavior; CoreOutputAdapter move; IndexCombine rethink

## Capabilities

### New Capabilities

- `write-client-leaves-home`: Write package locality for leaves + artifacts + facade

### Modified Capabilities

_(none — relocate only)_

## Impact

- Import updates across OpenApiClient, batch/item/setup/finalize, IndexCombine, tests
