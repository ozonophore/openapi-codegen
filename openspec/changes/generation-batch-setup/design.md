## Context

`finalizeGenerationBatch` owns post-loop; session `run` still owns ~100 LOC of setup. Root bag already narrows options into setup/finalize.

## Goals / Non-Goals

**Goals:**
- Free `setupGenerationBatch` owning full pre-loop bootstrap
- Thin session orchestration: setup → loop → finalize
- Bit-identical behavior

**Non-Goals:**
- Change finalize order/semantics
- Move GenerationCache package
- Rethink item loop / ItemRunContext home

## Decisions

1. Module: `setupGenerationBatch.ts` free function (paired with finalize)
2. Scope includes warm preAnalyze + path helpers/warn*/validate
3. Return full result bag with `makeReportParams` closing over mutable seeds
4. Deps: `{ writeClient, shouldEntitySkip }` + items + root
5. Empty check + STARTED stay on session

## Risks / Trade-offs

- [Risk] Closure/mutation bugs on counters → Mitigation: keep same let/object pattern as today; behavioral suite
- [Risk] Circular imports with finalize types → Mitigation: setup imports FinalizeGenerationBatchState type only

## Migration Plan

- Extract setup → thin session → fix root type in tests → verify
