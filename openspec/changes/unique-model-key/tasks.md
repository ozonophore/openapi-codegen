## 1. Helper

- [x] 1.1 Add `uniqueByKey(items, keyOf)` next to `unique()`
- [x] 1.2 Unit tests: first-wins on key; different keys kept; `unique()` strings unchanged

## 2. Call sites

- [x] 2.1 v2/v3 `getModels` use `uniqueByKey` on `path`+`name` (both filter sites)
- [x] 2.2 `IndexCombineSession` models and schemas lists use the same key
