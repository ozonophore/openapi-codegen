## 1. Modules

- [x] 1.1 `OutputFileSession` + `LintTargetRegistry`
- [x] 1.2 `IndexCombineSession` (HEAD combine semantics, including `combineAndWrightSimple` / `isSameShema`); not exported from `src/core/index.ts`

## 2. Facade

- [x] 2.1 `WriteClient` composes the three; public methods delegate; `writeClient()` orchestration stays
- [x] 2.2 `SharedFolderWriter(lca)` only; update batch + tests

## 3. Docs

- [x] 3.1 CONTEXT.md Output session split
