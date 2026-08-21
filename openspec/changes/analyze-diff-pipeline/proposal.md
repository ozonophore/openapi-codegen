## Why

После `enrichSemanticDiffReport` / `produceUnifiedDiffReport` CLI analyze-diff всё ещё владеет shallow orchestration: analyze → enrich → produce → write → CI gate. Баги порядка и CI-после-write живут в CLI try-блоке, а не за одним seam. Architecture grill: углубить success-path в один Diff report module.

## What Changes

- Добавить `runAnalyzeDiffPipeline` в `src/core/diffReport/` (analyze → enrich → produce → write → CI governance gate → `{ reportPath, ignored, semanticReport, report, ciFailed }`)
- Thin `analyzeDiff` CLI: Zod · Spec load · load gov/ignore/plugins · pipeline · INFO logs / CI markdown · map `ciFailed` / catch → `AnalyzeDiffResult`
- Unit tests на wiring + `ciFailed`; CLI/fixture suites behavioral preserve
- **Out of scope:** plugin entry resolve в core; Unified-direct apply; Spec-load git; public `core/index`; смена semantics листьев; `timestamp` на pipeline input

## Capabilities

### New Capabilities

- `analyze-diff-pipeline`: Diff report владеет Analyze Diff success-path pipeline + CI gate

### Modified Capabilities

_(none — behavior bit-identical для CLI exit / отчёта)_

## Impact

- `src/core/diffReport/**`, CLI `analyzeDiff.ts`
- Без BREAKING public API
