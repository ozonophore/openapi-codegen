## 1. Module

- [x] 1.1 Add `applyHistoryDiffToClient` (+ types) in `src/core/diffReport/applyHistoryDiffToClient.ts`
- [x] 1.2 Export from `diffReport/index.ts` (not `core/index`)
- [x] 1.3 Wire `prepareClientFromOpenApi`; delete private wrappers and pre-switch load/warn

## 2. Tests

- [x] 2.1 Unit: useHistory false / missing report warn / report applies
- [x] 2.2 Behavioral preserve relevant generation / diff suites as needed

## 3. Docs / graph

- [x] 3.1 Set CONTEXT OpenSpec id to `generation-history-diff`
- [x] 3.2 `graphify update .`

## 4. Verify

- [x] 4.1 `npm run checkTypes`
- [x] 4.2 `npm run find-deadcode:dev`
- [x] 4.3 `npm run eslint:fix`
- [x] 4.4 `npm run prettier:fix`
