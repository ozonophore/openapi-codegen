## Why

AutoSelector detect already lives in core; CLI still owned multi-output probe fan-out, mismatch merge, and option patching. Architecture #5: move execute orchestration into core autoSelect.

## What Changes

- Add `src/core/autoSelect/executeAutoSelection.ts` (full former CLI helpers)
- Export `executeAutoSelection` from `autoSelect/index` + `core/index`; probe helpers file-only
- Logger duck `{ info; warn }`
- CLI generate thin call; delete `autoSelectHelpers.ts` (+ tests move)
- **Out of scope:** detect rules; CLI Zod/adapter; fold into `generate()`

## Capabilities

### New Capabilities

- `autoselect-execute-core`: AutoSelect execute/probe orchestration in core

### Modified Capabilities

_(none — behavioral preserve)_

## Impact

- `generateOpenApiClient`, `core/autoSelect/*`, public `executeAutoSelection` export
