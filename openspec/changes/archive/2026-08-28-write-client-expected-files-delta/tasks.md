## 1. Write seam

- [x] 1.1 `writeClientArtifacts` returns set-diff `string[]` (expectedFiles duck 4th arg; leaves 5th)
- [x] 1.2 `WriteClient.writeClient` → `Promise<string[]>`
- [x] 1.3 Generation item session uses return; remove knownFilesBefore

## 2. Tests / docs

- [x] 2.1 Unit: delta empty / includes new paths
- [x] 2.2 Update WriteClient.test leaves call signature
- [x] 2.3 CONTEXT OpenSpec id + Related terms; `graphify update .`

## 3. Verify

- [x] 3.1 `npm run checkTypes` (exit 0)
- [x] 3.2 `npm run find-deadcode:dev` (exit 0)
- [x] 3.3 `npm run eslint:fix` (exit 0)
- [x] 3.4 `npm run prettier:fix` (exit 0)
