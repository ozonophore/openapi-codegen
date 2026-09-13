## 1. Resolve Active item

- [x] 1.1 Extend `resolvePluginEntries` with optional `activeInput`; collect root plugins plus matching item(s) only
- [x] 1.2 Compare `item.input` to `activeInput` after both are absolute (`resolveHelper` or equivalent)
- [x] 1.3 No match → root + CLI; several matches → merge plugins and warn
- [x] 1.4 Pass absolute `--input` from `analyzeDiff.ts` into `resolvePluginEntries`

## 2. Tests

- [x] 2.1 Replace union test with Active item match (other item plugins excluded)
- [x] 2.2 Miss → root + CLI only
- [x] 2.3 Duplicate absolute input → merged plugins + warning
- [x] 2.4 Existing root+CLI and object-config tests still pass (omit `activeInput` or match a single item)

## 3. Check

- [x] 3.1 `pluginPaths` + analyze-diff suites pass
- [x] 3.2 `openspec validate analyze-diff-active-item-plugins`
