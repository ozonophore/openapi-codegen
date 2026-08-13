## Why

Diff report lifecycle glue (adapt, miracles build, load multi-schema→legacy, apply, write Unified) размазан по `cli/analyzeDiff` и `core/utils`, при том что produce уже deep в `semanticDiff`. Dead seam: `createSemanticDiffContext`. Architecture grill зафиксировал home в `src/core/diffReport/`.

## What Changes

- Ввести package `src/core/diffReport/` (+ barrel): types, adapters, `buildMiraclesFromSemanticChanges`, `loadDiffReport`, `applyDiffReportToClient`, `writeDiffReport` (rename from `writeSemanticDiffReport`).
- Shim: `types/DiffReport.model.ts` re-exports from diffReport (call sites that still use the types path). No `utils/adapters` shim.
- Update call sites (GenerationItemSession, analyzeDiff, analyzeUsage, tests); CLI assemble Unified остаётся inline.
- Удалить `createSemanticDiffContext` и вызов.
- `semanticDiff/analyzeOpenApiDiff` перестаёт экспортировать write helper.

**Out of scope:** `produceUnifiedDiffReport` high-level, schema collapse, Unified-direct apply, dual Spec-load, plugin entry config, Session call shape, Phases 2–4.

## Capabilities

### New Capabilities

- `diff-report-lifecycle`: Ownership Diff report package (adapt/load/apply/write/types; delete dead Context helper).

### Modified Capabilities

_(none — on-disk Unified schema behavior unchanged; ownership/path rename only)_

## Impact

- `src/core/diffReport/**` — новый package
- Moves out of `utils/` + write out of `semanticDiff/`
- `src/cli/analyzeDiff/semanticDiffContext.ts` — удалить
- Нет **BREAKING** on-disk Unified/Semantic/legacy compat; import paths change for internal callers
- `CONTEXT.md` glossary
