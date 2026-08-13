## 1. Module

- [x] 1.1 Создать `src/core/generationCache/EntitySkip.ts` (key, fingerprint v3, `shouldEntitySkip`, hybrid predicates, manifest presence, `getSpecItemName`)
- [x] 1.2 Убрать с `OpenApiClient` private `getCacheKey` / `getCacheFingerprint` / `resolveEntitySkipForItem` / `filesExist` / `getSpecItemName` (на HEAD нет `entitySkipResolution.ts`)

## 2. Wiring

- [x] 2.1 `OpenApiClient.generateSingle` и session `shouldEntitySkip` callback → EntitySkip; `registerOutputFile` остаётся в `generateSingle`
- [x] 2.2 `GenerationBatchSession` / прочие импорты → shared `getSpecItemName` из EntitySkip
- [x] 2.3 Dedup `getSpecItemName` в `runPreAnalyze` и `AvatarSwarmGenerator`

## 3. Tests / docs

- [x] 3.1 Unit-тесты EntitySkip: v3 slice/residual, hybrid reuse eligibility, manifest presence deny, deleted-file miss, `getSpecItemName`
- [x] 3.2 Сверить `CONTEXT.md` (change id `pdtch-191-entity-skip-fingerprint`)
