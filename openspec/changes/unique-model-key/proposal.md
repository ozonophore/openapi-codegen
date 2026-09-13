## Why

`getModels` and IndexCombine run `filter(unique)` over Model graphs. `unique()` deep-equals every pair, so a large spec is O(n² × graph size). Import arrays are small; the Model list is not. Dedup of Schema Models must stay first-wins on identity of the generated file, not structural equality of the whole tree.

## What Changes

- Schema Model / ExportedModel lists dedupe by `path` + `name` in O(n), first wins.
- `unique()` stays deep-equal for Import and other small arrays.
- No Upgrade page (internal generate performance, not a 2.0.0 → 2.1.0 contract).

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `openapi-spec-parsing`: Schema Model list after parse MUST keep the first model per `path`+`name`, not deep-equal of the Model graph.

## Impact

- `src/core/utils/unique.ts` (`uniqueByKey`)
- v2/v3 `getModels`, `IndexCombineSession` models/schemas lists
- Unit tests for `uniqueByKey` and primitive `unique`
