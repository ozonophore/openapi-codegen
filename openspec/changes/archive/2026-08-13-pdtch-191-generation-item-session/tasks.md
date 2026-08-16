## 1. Module

- [x] 1.1 `GenerationItemSession` with deps `{ writeClient, eslintFixOptions }`, `run` (required `ItemRunContext`); not exported from `src/core/index.ts`

## 2. Extract

- [x] 2.1 Move `generateSingle` body + Diff helpers into item session (HEAD pipeline as-is)
- [x] 2.2 Delete `generateSingle` / Diff helpers from facade; wire `generateItem` → `itemSession.run` inside `generate(rawOptions)`

## 3. Docs

- [x] 3.1 Batch JSDoc, EntitySkip comment, CONTEXT.md
