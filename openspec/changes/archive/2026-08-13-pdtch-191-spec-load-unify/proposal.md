## Why

Generate (`createResolvedContext`) и analyze-diff (`loadSemanticOpenApiSpec`) дублируют path/exists/`SwaggerParser.resolve` prologue, затем расходятся намеренно (Context vs expand). Architecture grill: home Spec-load в `src/core/specLoad/` с двумя modes; git/`parse` остаётся в CLI.

## What Changes

- Package `src/core/specLoad/`: shared resolve, `forContext`, `forSemantic`, expand move, minimal refs interface, internal barrel (used surface only).
- Thin facades: `createResolvedContext.ts`, `utils/loadSemanticOpenApiSpec.ts` (прежние пути).
- Move `expandOpenApiRefsForSemanticDiff` (+ tests) into package. No leftover shim at `utils/expandOpenApiRefsForSemanticDiff.ts`.
- **Out of scope:** git `parseContent`, Context semantics change, Diff/validate merge, Session/Write/options, Phases 2–4.

## Capabilities

### New Capabilities

- `spec-load-unify`: Shared Spec-load module with `forContext` / `forSemantic` modes and thin facades.

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- New `src/core/specLoad/**`
- Slim facades at existing paths
- Tests import updates for expand
- Нет **BREAKING** публичного API
- `CONTEXT.md`
