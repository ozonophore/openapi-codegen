## Context

`unique()` is a `filter` callback that deep-equals `val` against every earlier element. `getModels` runs it on the full Model list (twice). IndexCombine runs it on combined ExportedModel lists. Imports are small objects; Models are trees. Structural equality of two Model graphs is not the generate identity — the generated `.ts` path is.

## Goals / Non-Goals

**Goals:**

- First-wins dedupe of Schema Models / ExportedModels by `path` + `name` in O(n).
- Keep `unique()` deep-equal for Import and string arrays.

**Non-Goals:**

- Changing Model path collapse.
- Hashing the Model graph.
- Deduping Canonical Refs before `getModel` (lookup uniqueness is a different seam).

## Decisions

1. **`uniqueByKey(items, keyOf)`** in `unique.ts`: Set of keys, preserve first. Callers pass `m => `${m.path}\0${m.name}``.
2. **`unique()` unchanged for objects** (deep-equal). Primitives MAY use `===` via `indexOf` — same results as today for strings.

## Risks / Trade-offs

- [Two Canonical Refs collapse to the same path+name] → first model wins, same as last-write-wins on disk after write. Deep-equal could have kept both if trees differed — that would still collide on write. Accept first-wins.

## Migration Plan

None. Regen output for duplicate path+name should match first-wins, which write already did.
