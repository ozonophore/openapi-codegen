## Why

После extract `GenerationBatchSession` skip/fingerprint всё ещё private-методы `OpenApiClient`. На HEAD нет `entitySkipResolution.ts` — предикат inlined как `resolveEntitySkipForItem` и **игнорирует** `reuseStore` (`void reuseStore`). Entity skip для `reuse` срабатывает только на classes+bundle; обычный reuse никогда не skip’ается, поэтому warm-run / `allEntitySkipped` почти не работают. Fingerprint **v2** — плоский JSON options, не `optionsSliceHash` reuse. Три копии `getSpecItemName` (фасад/session: `resolve+basename`; preAnalyze/AvatarSwarm: string-split).

## What Changes

- Module `src/core/generationCache/EntitySkip.ts`: `buildCacheKey`, `buildEntityFingerprint`, `shouldEntitySkip` (injectable `filesExist`); без `registerOutputFile`.
- Предикаты в том же module: `usesEntityCache` (`entity` **или** `reuse`, любой layout), `usesReuseStoreForItem` (reuse && не classes-bundle), `getSpecItemName`.
- Hybrid skip: для `reuse` skip валиден при fingerprint match + files on disk + **presence** `manifest.specItems[spec]` (не per-artifact integrity).
- Entity fingerprint **v3**: `cacheFingerprintVersion` + `generatorVersion` + `specHash` + **`optionsSliceHash`** + residual вне `OptionsSlice` (без raw `plugins` / `disableBuiltinPlugins`).
- Сериализация: `stableStringify` + `hashFingerprint` (как reuse).
- `OpenApiClient` теряет private fingerprint/skip; `generateSingle` и session callback вызывают EntitySkip. `registerOutputFile` остаётся в `generateSingle`.
- Dedup: `runPreAnalyze` и `AvatarSwarmGenerator` → shared `getSpecItemName`.
- `GenerationCache.ts` остаётся в `src/core/utils/`.

**Out of scope:** collapse Reuse bag (`cf7`), plugin config inject (`207e`), relocate GenerationCache, перенос `generateSingle` (`a57`), phases 2–4.

## Capabilities

### New Capabilities

- `entity-skip-fingerprint`: Ownership entity-skip + fingerprint v3 + hybrid reuse skip with manifest presence guard + shared Spec item naming.

### Modified Capabilities

- `document-service-baseline/generation-cache-and-reuse`: hybrid entity skip for `reuse`; fingerprint v3 (`optionsSliceHash` + residual).

## Impact

- `src/core/generationCache/EntitySkip.ts` — новый
- `src/core/OpenApiClient.ts`, `GenerationBatchSession.ts` — wiring (убрать private skip/fingerprint / local `getSpecItemName` на фасаде)
- `src/core/specAnalysis/runPreAnalyze.ts`, `src/core/avatarSwarm/AvatarSwarmGenerator.ts` — shared name
- Tests: unit coverage EntitySkip (v3, hybrid, manifest presence, files miss)
- `CONTEXT.md` — термин уже заведён; имя change = `pdtch-191-entity-skip-fingerprint`
- **Soft break:** one-time warm entity-cache miss (v2 → v3); reuse warm runs могут начать skip’ать items (hybrid)
