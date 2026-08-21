## Why

After `diff-report-lifecycle`, CLI `analyzeDiff` still assembles Unified inline (hashes, metadata, semantic slice, structural adapt). Architecture follow-up: home produce under `diffReport/`.

## What Changes

- `produceUnifiedDiffReport` + `createSpecHash` in `src/core/diffReport/`
- Export from diffReport barrel (not `core/index`)
- CLI: enrich semantic → produce → write
- Unit tests for produce + circular-safe hash

## Capabilities

### New Capabilities

- `produce-unified-diff-report`: Assemble UnifiedDiffReport from enriched semantic + specs

### Modified Capabilities

_(none)_

## Impact

- `diffReport/produceUnifiedDiffReport.ts`, barrel, `cli/analyzeDiff/analyzeDiff.ts`, tests
