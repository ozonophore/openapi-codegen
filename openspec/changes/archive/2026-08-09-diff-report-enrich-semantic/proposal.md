## Why

After `produceUnifiedDiffReport`, analyze-diff CLI still owns hooks → ignore → governance → miracles as a shallow procedure. Architecture grill: deepen that enrich seam in Diff report as a sibling to produce (not inside produce).

## What Changes

- Add `enrichSemanticDiffReport` in `src/core/diffReport/` (hooks → ignore → governance → miracles)
- Move ignore filter + `matchesIgnoreRule` + `IgnoreRule` / minimal `DiffEntry` into Diff report; CLI keeps `loadIgnoreRules` only; delete CLI `ignoreSemanticChanges.ts`
- Thin `analyzeDiff`: load → analyze → enrich → produce → write / logging
- Unit tests for enrich wiring; fixtures behavioral preserve
- **Out of scope:** enrich inside produce; Spec load / analyze / write / CI into enrich; load* / plugin path resolve into enrich

## Capabilities

### New Capabilities

- `diff-report-enrich-semantic`: Diff report owns semantic enrich pipeline before Unified produce

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `src/core/diffReport/**`, CLI `analyzeDiff` / ignore helpers
- No BREAKING public API
