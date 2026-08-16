## 1. Tables

- [x] 1.1 Add `resolveRootAliases` + `ROOT_ONLY_KEYS` (special `get` for `autoSelect`)
- [x] 1.2 Add `PER_ITEM_OVERRIDE_KEYS` using aliases for the four alias fields
- [x] 1.3 Add `DEFAULT_RULES` + `CUSTOM_DEFAULTS` (`modelsLayout`, `specAnalysis`)
- [x] 1.4 Keep `mergeItemMarauderBlock` private; leave validation / `resolveGenerationOptions` entry unchanged

## 2. Normalize paths

- [x] 2.1 Items path: spread item → root-only → marauder merges → per-item overrides
- [x] 2.2 Flat path: local fields + root-only + marauder normalize + per-item/aliases

## 3. Verify

- [x] 3.1 Golden fixtures bit-identical (`flatMinimal`, `flatWithFalsyStrings`, `itemsInherit`, `nestedAliases`)
