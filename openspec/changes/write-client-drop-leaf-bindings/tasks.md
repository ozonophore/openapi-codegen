## 1. Facade

- [x] 1.1 Remove nine leaf bindings + leaf imports from `WriteClient.ts`
- [x] 1.2 Update leaf unit tests to free function + `toCoreOutputAdapter()`

## 2. Docs / graph

- [x] 2.1 Set CONTEXT OpenSpec id to `write-client-drop-leaf-bindings`; refresh Related terms
- [x] 2.2 `graphify update .`

## 3. Verify

- [x] 3.1 `npm run checkTypes` (exit 0)
- [x] 3.2 `npm run find-deadcode:dev` (exit 0)
- [x] 3.3 `npm run eslint:fix` (exit 0)
- [x] 3.4 `npm run prettier:fix` (exit 0)
- [x] 3.5 Leaf unit tests (`writeClientCore|Models|Schemas|Services`)
