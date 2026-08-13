# Domain context

Glossary for architecture and generation. Prefer these names over file/class nicknames when talking about seams.

## Generation batch session

Owns the **multi-item Generation lifecycle** for one `generate()` run: cache / ReuseStore setup, warm preAnalyze entity-skip pass, per-item orchestration, index combine, post-generation steps, Spec analysis finalize, Reuse GC/save, Generation report finalize, workspace report, stale cleanup, batch ESLint.

- **Module:** `GenerationBatchSession` (`src/core/GenerationBatchSession.ts`)
- **Deps:** `writeClient`, `eslintFixOptions`, `generateItem`, `shouldEntitySkip`
- **Does not own:** per-item parse → Client → Write (`generateSingle` stays on `OpenApiClient`)
- **Seam to per-item:** callbacks (`generateItem` → `{ entitySkipped }`, `shouldEntitySkip`); Spec analysis accumulator lives on the session and is passed inside **`itemRunContext`** (reuse fields + accumulator) — not a separate argument
- **Visibility:** internal module (not re-exported from `src/core/index.ts`), same as `OpenApiClient`
- **Logger:** `shutdownLogger` stays at the end of the session success path (behavioral preserve)
- **Report order:** early dump on Reuse conflict (may omit final phases); success path is **Reuse GC/save → final Generation report → workspace report** so `phases` timings are honest when `cacheDebug`
- **Gates:** when all items `entitySkipped`, skip index combine and batch ESLint (clear lint targets)
- **OpenSpec change:** `pdtch-191-generation-batch-session`

## Related terms

| Term | Role |
|------|------|
| **OpenApiClient** | Facade: options normalize/defaults, `generateSingle`; constructs and runs the batch session |
| **WriteClient** | Output session: write artifacts, expected-file registry, lint targets, index combine |
| **ReuseStore** | Artifact reuse manifest under cache strategy `reuse` |
| **GenerationCache** | Entity/content cache entries per output root |
| **Context** | Parse-time Spec context (refs, virtual file map, plugins) — not passed to WriteClient |
| **Generator plugins** | Loaded into Context during per-item generation / preAnalyze |

## Entity skip / entity fingerprint

Policy for skipping a Spec item when GenerationCache hit is valid: fingerprint match + files on disk. Applies when `cacheStrategy` is **`entity` or `reuse`** (hybrid skip). For `reuse`, skip also requires a Reuse manifest **presence** guard (`specItems[spec]` exists) — not per-artifact integrity hashing.

- **Module:** `src/core/generationCache/EntitySkip.ts` (GenerationCache stays in `src/core/utils/GenerationCache.ts`)
- **Interface:** `buildCacheKey`, `buildEntityFingerprint`, `shouldEntitySkip` — no `registerOutputFile` (Write side effect stays in `generateSingle`)
- **Fingerprint (v3):** `cacheFingerprintVersion` + `generatorVersion` + `specHash` + **`optionsSliceHash`** (from `buildOptionsSlice` / reuse fingerprinter) + **residual** options not in `OptionsSlice` (`request`, `useOptions`, `includeSchemasFiles`, `excludeCoreServiceFiles`, `strictPluginMode`, `customExecutorPath`, `useCancelableRequest`, `useHistory`, `diffReport`, `strictOpenapi`, `failOnGovernanceErrors`). No raw `plugins` / `disableBuiltinPlugins` in residual (covered by slice).
- **Serialization:** `stableStringify` + same hash helper as reuse fingerprints
- **Call sites:** `OpenApiClient.generateSingle` and session `shouldEntitySkip` callback; `getSpecItemName` shared (preAnalyze / AvatarSwarm use the same helper)
- **Cache break:** bump to fingerprint version **3** (one-time warm miss)
- **OpenSpec change:** `pdtch-191-entity-skip-fingerprint`

## Reuse write session

Opaque handle for applying ReuseStore policy while writing models/schemas.

- **Type:** `ReuseWriterContext` in `reuseStore/reuseWriterHelpers.ts` (required when present: store, optionsSlice, specInput, inputPath, modelSchemas; optional keys/stats/conflict/shared/prettier)
- **Write seam:** `WriteClient.writeClient` / `writeClientModels` / `writeClientSchemas` take `reuse?: ReuseWriterContext` — not a 9-field flat bag
- **Output adapter:** `ReuseOutputAdapter = { writeOutputFile; registerLintTarget? }`; reuse helpers depend on the adapter, not the `WriteClient` class
- **Assembly:** built once in `OpenApiClient.generateSingle` from `itemRunContext` + local slice/schemas/paths
- **Write:** V2/V3 share one `writeProps`; single models-finalize so `inputPath` survives `validationLibrary !== NONE`
- **Hit path:** `writeOutputFile` compares content, not `expectedByteSize`
- **OpenSpec change:** `pdtch-191-reuse-write-session`
