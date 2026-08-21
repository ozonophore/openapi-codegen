## Context

IndexCombine builds indexes deeply then writes via WriteClient method duck. Leaves already take CoreOutputAdapter.

## Goals / Non-Goals

**Goals:** Adapter flush; delete IndexCombineWriteHost + Full/Simple bindings; thin combine*.

**Non-Goals:** Merge/alias/sort changes; batch/finalize call shape.

## Decisions

1. `combineAndWrite(adapter: CoreOutputAdapter)`
2. Direct free `writeClientFullIndex` / `writeClientSimpleIndex`
3. Remove Full/Simple bindings from WriteClient; keep other bindings

## Open Questions

_(none)_
