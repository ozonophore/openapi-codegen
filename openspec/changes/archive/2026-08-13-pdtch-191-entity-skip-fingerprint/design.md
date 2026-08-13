## Context

HEAD already has `GenerationBatchSession` (warm preAnalyze filter, `allEntitySkipped` gates, GC retention). Skip/fingerprint still live on `OpenApiClient`: v2 flat fingerprint, `useEntityCache` only for `entity` or `reuse`+classes-bundle, `resolveEntitySkipForItem` does `void reuseStore`. No `entitySkipResolution.ts` to delete.

Grilling (PDTCH-191 phase 1): drop the 14 experimental commits; re-cut seams on HEAD; **hybrid reuse skip + manifest presence land in this change**; later Write/Context/options bugs stay in their owning seams.

## Goals / Non-Goals

**Goals:**
- One deep module for entity-skip policy + fingerprint construction
- Hybrid skip: `cacheStrategy` `entity` **or** `reuse` (any models layout)
- Reuse skip extra gate: manifest **presence** (`specItems[spec]`), not artifact integrity
- Single options-influence path via `optionsSliceHash` for fields in `OptionsSlice`
- Deterministic hashing aligned with reuse fingerprinter
- Shared Spec item name helper
- Explicit cache version bump (v3)

**Non-Goals:**
- Merging entity skip with reuse artifact keys into one hash
- Moving `registerOutputFile` into EntitySkip
- Relocating `GenerationCache.ts`
- Plugin config runtime injection
- Extracting `generateSingle` / WriteClient / options resolve (later phase-1 seams)
- Restoring `entitySkipResolution.ts` as an intermediate module

## Decisions

### Decision 1: Module path
`src/core/generationCache/EntitySkip.ts`. Keep `GenerationCache` in `utils/` to avoid import churn.

### Decision 2: Fingerprint shape (v3)
```
{
  cacheFingerprintVersion: 3,
  generatorVersion,
  specHash,           // hash of spec file bytes
  optionsSliceHash,   // buildOptionsSliceHash(buildOptionsSlice(item))
  residual: { ... }   // fields not in OptionsSlice
}
```
Residual: `request`, `useOptions`, `includeSchemasFiles`, `excludeCoreServiceFiles`, `strictPluginMode`, `customExecutorPath`, `useCancelableRequest`, `useHistory`, `diffReport`, `strictOpenapi`, `failOnGovernanceErrors`.

Omit from residual: anything in `OptionsSlice` including `plugins` / `disableBuiltinPlugins` / prefixes / models / validation / httpClient / prettierConfigPath / …

Serialize with `stableStringify` then `hashFingerprint`.

### Decision 3: Public functions
- `getSpecItemName`, `usesEntityCache`, `usesReuseStoreForItem`
- `buildCacheKey(item, absoluteInput)`
- `buildEntityFingerprint(item, absoluteInput): Promise<string>`
- `shouldEntitySkip({ item, generationCache, reuseStore, filesExist? })`

Default `filesExist` uses `fileSystemHelpers.exists`.

`usesEntityCache`: `item.cache && (cacheStrategy === 'entity' || cacheStrategy === 'reuse')`.  
`usesReuseStoreForItem`: `cacheStrategy === 'reuse' && !classes-bundle layout`.

### Decision 4: Skip gate
`shouldEntitySkip` is true iff:
1. `usesEntityCache` and `generationCache` present
2. cache entry exists, fingerprint matches (v3)
3. all cached files exist on disk
4. if `usesReuseStoreForItem` **and** `reuseStore != null`: `manifest.specItems[getSpecItemName(item.input)] != null`

No per-artifact `verifyArtifactIntegrity` on this path.

### Decision 5: Call sites
- `OpenApiClient.generateSingle`: EntitySkip for key/FP/skip; `registerOutputFile` stays here
- Session `shouldEntitySkip` callback → `shouldEntitySkip` from EntitySkip (not a private client wrapper)
- Delete client private `getCacheKey` / `getCacheFingerprint` / `resolveEntitySkipForItem` / `filesExist` / `getSpecItemName`
- Session may keep a thin `getSpecItemName` wrapper **or** import the shared helper; one implementation

### Decision 6: getSpecItemName
Canonical form: `resolveHelper` + `basename` (already used by skip/report on the facade). Replace string-split copies in preAnalyze / AvatarSwarm. Accept minor naming edge-case alignment as bugfix.

## Risks / Trade-offs

- **[Risk] One-time entity cache cold** → Mitigation: version 3; document in CONTEXT
- **[Risk] prettierConfigPath now affects entity skip** → Intended (via slice); version bump
- **[Risk] Hybrid skip changes reuse warm-run behavior** → Intended; gates already on session become useful
- **[Risk] Manifest-missing forces regen even if files+FP match** → Safer for GC key retention than skipping a spec the store does not know
- **[Risk] getSpecItemName semantic change for odd paths** → Shared resolve+basename is canonical

## Migration Plan

- No CLI/config migration
- Warm runs: expect entity miss once after upgrade (v2 → v3)
- Reuse non-bundle layouts: first matching warm run may skip items that previously always regenerated
- Rollback: revert this commit

## Open Questions

_(none)_
