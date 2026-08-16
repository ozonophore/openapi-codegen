## 1. Implement

- [x] 1.1 Move ignore types/match/filter into `diffReport/`; slim CLI `loadIgnoreRules`
- [x] 1.2 Add `enrichSemanticDiffReport` + export from `diffReport/index.ts`
- [x] 1.3 Thin `analyzeDiff` to call enrich
- [x] 1.4 Unit tests for enrich wiring

## 2. Verify

- [x] 2.1 tsc / knip / openspec validate; `graphify update .`
