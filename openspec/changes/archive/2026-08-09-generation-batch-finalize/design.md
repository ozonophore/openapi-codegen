## Context

Batch session ~480 LOC mixes setup, item loop, and finalize. Post-loop block is the deepen target.

## Goals / Non-Goals

**Goals:** `finalizeGenerationBatch(ctx)`; move stale + eslint; bit-identical order.

**Non-Goals:** Setup/loop changes; IndexCombine host; order/semantics change.

## Decisions

1. Free function + ctx bag
2. Mutable `state` for accumulator/quality/gc/save timing; `makeReportParams` reads it
3. Stale helpers move into finalize file
4. `shutdownLogger` stays on session after try/catch

## Open Questions

_(none)_
