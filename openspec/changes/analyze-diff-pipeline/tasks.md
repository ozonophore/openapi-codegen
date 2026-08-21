## 1. Pipeline module

- [x] 1.1 Add `runAnalyzeDiffPipeline` (+ input/result types) in `src/core/diffReport/runAnalyzeDiffPipeline.ts`
- [x] 1.2 Export from `diffReport/index.ts` (not `core/index`)
- [x] 1.3 Wire thin `analyzeDiff.ts` adapter around pipeline

## 2. Tests

- [x] 2.1 Unit: wiring + `ciFailed` true/false
- [x] 2.2 Run analyze-diff CLI / fixture suites (behavioral preserve)

## 3. Docs / graph

- [x] 3.1 Set CONTEXT OpenSpec id to `analyze-diff-pipeline`
- [x] 3.2 `graphify update .`

## 4. Verify

- [x] 4.1 `npm run checkTypes`
- [x] 4.2 `npm run find-deadcode:dev`
- [x] 4.3 `npm run eslint:fix`
- [x] 4.4 `npm run prettier:fix`
