## Context

WriteClient facade still inlines mkdir/core/services/schemas/models + register. Leaves already take `CoreOutputAdapter`.

## Goals / Non-Goals

**Goals:** Move order into `writeClientArtifacts(adapter, { register }, options)`; thin facade; bit-identical.

**Non-Goals:** IndexCombine host rethink; order/TODO changes; item session call shape.

## Decisions

1. Free function + private finalize helper in same file
2. Leaves via free `writeClient*(adapter, …)`; BaseDto via `adapter.writeOutputFile`
3. IndexCombine duck `{ register }`
4. `TWriteClientProps` exported from orchestration module
5. Optional 4th `leaves` arg (defaults to free writeClient*) for unit stubs — production uses defaults

## Open Questions

_(none)_
