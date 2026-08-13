## Context

HEAD after item-session: `WriteClient` still owns write/expected/lint/index. Public combine method is `combineAndWrightSimple` (typo). `buildClientGeneratorConfigMap` has no modelsMode guard. `SharedFolderWriter` stores unused `WriteClient`.

Grilling (PDTCH-191 phase 1, 186): split concerns; keep HEAD names; do not fold typo renames or conflict guard.

## Goals / Non-Goals

**Goals:**
- Three modules with clear locality
- WriteClient composing facade, unchanged public surface
- Drop dead WriteClient on SharedFolderWriter

**Non-Goals:**
- Rebinding leaf `writeClient*` off `this: WriteClient`
- Rename `combineAndWrightSimple` / `isSameShema`
- modelsMode conflict guard
- CoreOutputAdapter / narrowing session deps

## Decisions

### Decision 1: Three class modules + WriteClient facade

| Module | Owns |
|--------|------|
| `OutputFileSession` | write + expected registry + write stats |
| `LintTargetRegistry` | lint files + include globs |
| `IndexCombineSession` | config Map; `register`; `combineAndWrite` / `combineAndWrightSimple` |
| `WriteClient` | constructs the three; logger; public delegates; `writeClient()`; leaf bindings |

### Decision 2: IndexCombineWriteHost
Combine flush takes `{ writeClientFullIndex; writeClientSimpleIndex }`. Facade passes `this`.

### Decision 3: HEAD combine semantics
Move map builders as-is (`isSameShema`, `getOutputPath` ternary, no conflict throw). Public WriteClient method stays `combineAndWrightSimple`.

### Decision 4: SharedFolderWriter
`new SharedFolderWriter(lca)` only.

### Decision 5: Visibility / tests
Not exported from `src/core/index.ts`. Existing suites are the gate.

## Risks / Trade-offs

- **[Risk] Combine wiring break** → Keep public WriteClient methods; run WriteClient + batch tests
- **[Trade-off] Leaf `this: WriteClient` remains** → Follow-up

## Migration Plan

- Internal only
- Rollback: revert

## Open Questions

_(none)_
