## 1. Entity skip gate

- [x] 1.1 Add `historyBound` (or equivalent from `item.useHistory`) to `resolveEntitySkipCandidate`; return false when true
- [x] 1.2 Pass the flag from `shouldEntitySkip` and from `resolveEntitySkip` (session path)

## 2. Tests

- [x] 2.1 Unit: History-bound item does not skip on fingerprint + files (+ reuse integrity)
- [x] 2.2 Unit: `useHistory` false still skips on a warm hit
- [x] 2.3 Generate-path: edit Diff report after a cached history run → report is applied, `entitySkipped` is false

## 3. Check

- [x] 3.1 EntitySkip + relevant generate/history suites pass
- [x] 3.2 `openspec validate history-bound-no-entity-skip`
