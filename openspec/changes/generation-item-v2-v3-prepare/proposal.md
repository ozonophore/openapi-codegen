## Why

`GenerationItemSession` still duplicates V2/V3 prepare arms (parse → applyDiff → postProcess → DTO). First-cut item session left them as-is; architecture follow-up collapses shared prepare for locality.

## What Changes

- Private `prepareClientFromOpenApi` on `GenerationItemSession`: `parse: () => Client` → applyDiff → postProcess → optional DTO/classes
- Switch only selects Parser + `WRITING_V2`/`WRITING_V3` logs
- Single `openApi as Record<string, unknown>` cast in helper (drop per-arm `@ts-ignore`)

## Capabilities

### New Capabilities

- `generation-item-v2-v3-prepare`: Shared prepare path for OpenAPI v2/v3 in Generation item session

### Modified Capabilities

_(none)_

## Impact

- `src/core/GenerationItemSession.ts` only; behavioral preserve; no public API
