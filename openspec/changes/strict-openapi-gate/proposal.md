## Why

Generation item session still owns the full `strictOpenapi` procedure (parser validate, load governance, strict diagnostics, write report, fail gates). Architecture grill: deepen into one Strict gate module so session stays lifecycle-only.

## What Changes

- Add `src/core/strict/runStrictOpenApiGate.ts` owning the full gate; returns `{ reportPath, report }`; throws bit-identical errors; logs via duck `forceInfo`
- Thin Generation item session: `if (strictOpenapi) await runStrictOpenApiGate(…)`
- Unit tests for fail/success paths; existing strict suite preserve
- **Out of scope:** Spec-load merge of swagger validate; issue/governance semantics; Diff/analyze-diff; `core/index` export

## Capabilities

### New Capabilities

- `strict-openapi-gate`: Single Strict module for generate-path strict OpenAPI validation gate

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `src/core/strict/runStrictOpenApiGate.ts`, `GenerationItemSession.ts`
- No BREAKING public API
