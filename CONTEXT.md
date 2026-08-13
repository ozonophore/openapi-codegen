# Domain context

Glossary for architecture and generation. Prefer these names over file/class nicknames when talking about seams.

## Generation batch session

Owns the **multi-item Generation lifecycle** for one `generate()` run: cache / ReuseStore setup, warm preAnalyze entity-skip pass, per-item orchestration, index combine, post-generation steps, Spec analysis finalize, Reuse GC/save, Generation report finalize, workspace report, stale cleanup, batch ESLint.

- **Module:** `GenerationBatchSession` (`src/core/GenerationBatchSession.ts`)
- **Deps:** `writeClient`, `eslintFixOptions`, `generateItem`, `shouldEntitySkip`
- **Does not own:** per-item parse → Client → Write (`GenerationItemSession`, wired as `generateItem`)
- **Seam to per-item:** callbacks (`generateItem` → `{ entitySkipped }`, `shouldEntitySkip`); Spec analysis accumulator lives on the session and is passed inside **`itemRunContext`** (reuse fields + accumulator) — not a separate argument
- **Visibility:** internal module (not re-exported from `src/core/index.ts`), same as `OpenApiClient`
- **Logger:** `shutdownLogger` stays at the end of the session success path (behavioral preserve)
- **Report order:** early dump on Reuse conflict (may omit final phases); success path is **Reuse GC/save → final Generation report → workspace report** so `phases` timings are honest when `cacheDebug`
- **Gates:** when all items `entitySkipped`, skip index combine and batch ESLint (clear lint targets)
- **OpenSpec change:** `pdtch-191-generation-batch-session`

## Generation item session

Owns the **per-item Generation lifecycle**: EntitySkip (+ register cached outputs on hit) → plugins / `createResolvedContext` → Spec analysis / strict → templates → Diff load/apply → V2/V3 parse / postProcess / DTO → `ReuseWriterContext` → `WriteClient.writeClient` → GenerationCache.set.

- **Module:** `GenerationItemSession` (`src/core/GenerationItemSession.ts`)
- **Deps:** `{ writeClient, eslintFixOptions }`; `run(item, generationCache, itemRunContext)` with required `ItemRunContext`
- **Wiring:** facade constructs it inside `generate(rawOptions)` and passes `generateItem: (item, cache, ctx) => itemSession.run(...)`
- **Visibility:** internal (not re-exported from `src/core/index.ts`)
- **OpenSpec change:** `pdtch-191-generation-item-session`

## Related terms

| Term | Role |
|------|------|
| **OpenApiClient** | Facade: options normalize/defaults; constructs WriteClient, item session, and batch session |
| **GenerationItemSession** | Per-item lifecycle: EntitySkip → parse → Client → Write → cache set |
| **WriteClient** | Thin write facade over OutputFileSession, LintTargetRegistry, IndexCombineSession |
| **ReuseStore** | Artifact reuse manifest under cache strategy `reuse` |
| **GenerationCache** | Entity/content cache entries per output root |
| **Context** | Parse-time Spec context (refs, virtual file map, plugins) — not passed to WriteClient |
| **Generator plugins** | Loaded into Context during per-item generation / preAnalyze |

## Entity skip / entity fingerprint

Policy for skipping a Spec item when GenerationCache hit is valid: fingerprint match + files on disk. Applies when `cacheStrategy` is **`entity` or `reuse`** (hybrid skip). For `reuse`, skip also requires a Reuse manifest **presence** guard (`specItems[spec]` exists) — not per-artifact integrity hashing.

- **Module:** `src/core/generationCache/EntitySkip.ts` (GenerationCache stays in `src/core/utils/GenerationCache.ts`)
- **Interface:** `buildCacheKey`, `buildEntityFingerprint`, `shouldEntitySkip` — no `registerOutputFile` (Write side effect stays in Generation item session)
- **Fingerprint (v3):** `cacheFingerprintVersion` + `generatorVersion` + `specHash` + **`optionsSliceHash`** (from `buildOptionsSlice` / reuse fingerprinter) + **residual** options not in `OptionsSlice` (`request`, `useOptions`, `includeSchemasFiles`, `excludeCoreServiceFiles`, `strictPluginMode`, `customExecutorPath`, `useCancelableRequest`, `useHistory`, `diffReport`, `strictOpenapi`, `failOnGovernanceErrors`). No raw `plugins` / `disableBuiltinPlugins` in residual (covered by slice).
- **Serialization:** `stableStringify` + same hash helper as reuse fingerprints
- **Call sites:** `GenerationItemSession.run` and batch session `shouldEntitySkip` callback; `getSpecItemName` shared (preAnalyze / AvatarSwarm use the same helper)
- **Cache break:** bump to fingerprint version **3** (one-time warm miss)
- **OpenSpec change:** `pdtch-191-entity-skip-fingerprint`

## Reuse write session

Opaque handle for applying ReuseStore policy while writing models/schemas.

- **Type:** `ReuseWriterContext` in `reuseStore/reuseWriterHelpers.ts` (required when present: store, optionsSlice, specInput, inputPath, modelSchemas; optional keys/stats/conflict/shared/prettier)
- **Write seam:** `WriteClient.writeClient` / `writeClientModels` / `writeClientSchemas` take `reuse?: ReuseWriterContext` — not a 9-field flat bag
- **Output adapter:** `ReuseOutputAdapter = { writeOutputFile; registerLintTarget? }`; reuse helpers depend on the adapter, not the `WriteClient` class
- **Assembly:** built once in `GenerationItemSession.run` from `itemRunContext` + local slice/schemas/paths
- **Write:** V2/V3 share one `writeProps`; single models-finalize so `inputPath` survives `validationLibrary !== NONE`
- **Hit path:** `writeOutputFile` compares content, not `expectedByteSize`
- **OpenSpec change:** `pdtch-191-reuse-write-session`

## Plugin config injection

Config entries may include `{ path, name?, config? }`. Fingerprints already hash `config`; runtime injects it too.

- **Hook:** optional `configure?(config)` on `OpenApiGeneratorPlugin`
- **When:** call only if `config` has at least one key after normalize
- **Load:** `loadGeneratorPlugins` accepts entries (path+config); generate and preAnalyze pass `mergePluginPaths`, not stripped paths
- **Errors:** `configure` throw fails generation (same as load failure)
- **OpenSpec change:** `pdtch-191-resolved-context`

## Resolved Context factory

Normal generate/preAnalyze path must not hand-assemble a half-initialized Context.

- **Factory:** `createResolvedContext(…)` in `src/core/createResolvedContext.ts` → `{ context, openApi }`
- **Replaces:** two-step `getOpenApiSpec` + public `addRefs` / `initializeVirtualFileMap`; those steps are internal (`attachResolvedOpenApi`)
- **Refs:** `_refs` stays unset until attach — `values()`/`get()` throw “must be initialized”, not a dummy `{}`
- **WriteClient:** still does not receive Context
- **OpenSpec change:** `pdtch-191-resolved-context`

## WriteClient concern split

WriteClient is a composing facade. Ownership:

- **OutputFileSession** — `writeOutputFile` + expected-file registry + write stats
- **LintTargetRegistry** — lint target files + include globs
- **IndexCombineSession** — per-item config Map; `combineAndWrite` / `combineAndWrightSimple` (HEAD name)
- **WriteClient** — logger, `writeClient()` orchestration, leaf `writeClient*` bindings, public delegates
- **SharedFolderWriter** — LCA only (no WriteClient ctor arg)
- **OpenSpec change:** `pdtch-191-write-client-concern-split`
