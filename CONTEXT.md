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
- **V2/V3:** shared prepare via private `prepareClientFromOpenApi` (parse callback → applyDiff → postProcess → DTO); switch only selects Parser + `WRITING_V2`/`WRITING_V3` logs
- **Visibility:** internal (not re-exported from `src/core/index.ts`)
- **OpenSpec change:** `pdtch-191-generation-item-session`

## Related terms

| Term | Role |
|------|------|
| **OpenApiClient** | Facade: constructs WriteClient, item/batch sessions; options meaning in `resolveGenerationOptions` |
| **GenerationItemSession** | Per-item lifecycle: EntitySkip → parse → Client → Write → cache set |
| **WriteClient** | Thin write facade over OutputFileSession, LintTargetRegistry, IndexCombineSession |
| **CoreOutputAdapter** | Narrow write/lint/log seam for `writeClient*` leaves and `writeSharedOrLocalCoreFile`; projects to `ReuseOutputAdapter` |
| **Diff report** | Lifecycle home: adapt + persist/load + types + `produceUnifiedDiffReport`; produce-analyze stays in `semanticDiff`; apply via item-session thin wrappers |
| **Spec load** | Shared Spec resolve prologue + modes `forContext` / `forSemantic` under `src/core/specLoad/`; thin facades `createResolvedContext` / `loadSemanticOpenApi*`; git/`parseContent` stays in CLI |
| **Plugin entry assembly** | Shared path+config entries into `loadGeneratorPlugins` for generate, preAnalyze, and analyze-diff (`resolvePluginEntries`); OpenSpec `plugin-entry-assembly` |
| **ReuseStore** | Artifact reuse manifest under cache strategy `reuse` |
| **GenerationCache** | Entity/content cache entries per output root |
| **Context** | Parse-time Spec context (refs, virtual file map, plugins) — not passed to WriteClient |
| **Generator plugins** | Loaded into Context during per-item generation / preAnalyze |

## WriteClient leaf adapters

Deepen residual from concern split: remove `this: WriteClient` from leaves; shared-core stops taking the class.

- **Type:** `CoreOutputAdapter` in `src/core/CoreOutputAdapter.ts`
  - `writeOutputFile(file, content)`
  - `registerLintTarget(file, outputRoot)` — `outputRoot` required (matches WriteClient)
  - `logger: { info; warn }` — duck, not full `Logger`
- **Relation to reuse:** `ReuseOutputAdapter` stays narrow (write + optional lint); `toReuseOutputAdapter(core, defaultLintRoot?)` lives in `CoreOutputAdapter.ts`
- **Helpers:** free `toCoreOutputAdapter(host)` + `WriteClient.toCoreOutputAdapter()` method
- **Leaf shape:** `writeClient*(adapter, options)` — first-arg adapter; all `writeClient*` + `writeSharedOrLocalCoreFile`
- **Facade:** thin public methods remain (`writeClientModels(opts)` → `writeClientModels(this.toCoreOutputAdapter(), opts)`) for tests / orchestration / IndexCombine host
- **Visibility:** internal — not from `src/core/index.ts`
- **OpenSpec change:** `write-client-leaf-adapters`

## Entity skip / entity fingerprint

Policy for skipping a Spec item when GenerationCache hit is valid: fingerprint match + files on disk. Applies when `cacheStrategy` is **`entity` or `reuse`** (hybrid skip). For `reuse`, skip also requires a Reuse manifest **presence** guard (`specItems[spec]` exists) **and** store-artifact integrity (`verifySpecItemIntegrity`) — not hashing of output files.

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

## Plugin entry assembly (analyze-diff)

Close the residual from `plugin-config-inject`: analyze-diff must not strip entry `config` before load.

- **Helper:** `resolvePluginEntries` (renamed from `resolvePluginPaths`) → `NormalizedPluginEntry[]` via `mergePluginPaths` (no `extractPluginPaths`)
- **Scope:** union of root + all `items[]` plugins + CLI string paths (unchanged union semantics)
- **Wire:** `analyzeDiff` → `loadGeneratorPlugins(resolvePluginEntries(…))` so `configure` runs for non-empty config
- **Stays:** `extractPluginPaths` for check-config path warnings; CLI `--plugins` remain strings
- **Out of scope:** active-item filter by `--input`; CLI object plugins; Plugin API v3
- **OpenSpec change:** `plugin-entry-assembly`

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
- **WriteClient** — logger, `writeClient()` orchestration, leaf `writeClient*` via `CoreOutputAdapter`, public delegates
- **SharedFolderWriter** — LCA only (no WriteClient ctor arg)
- **OpenSpec change:** `pdtch-191-write-client-concern-split`

## Generation options resolve

Owns raw config → strict items: Zod validate (**throws**, no `process.exit`) → flatten items|flat → inherit → defaults.

- **Module:** `resolveGenerationOptions` (`src/core/resolveGenerationOptions.ts`)
- **Item overrides:** `item.X ?? root.X` for `interfacePrefix`, `enumPrefix`, `typePrefix`, `useCancelableRequest`, `sortByRequired`, `useSeparatedIndexes` (plus existing request/plugins/history/models/miracles)
- **Call site:** `OpenApiClient.generate(rawOptions)` then `GenerationBatchSession.run(items, rawOptions)`
- **Visibility:** internal (not re-exported from `src/core/index.ts`)
- **OpenSpec change:** `pdtch-191-generation-options-resolve`

## Generation options field lists

Collapse triple parallel field lists inside `resolveGenerationOptions` into explicit tables (bit-identical).

- **Home:** same module `src/core/resolveGenerationOptions.ts`
- **Tables:** root-only inherit keys · per-item override keys · defaults with per-key rule `'or' | 'nullish' | 'custom'`
- **Explicit (not in generic pick):** marauder merges (`specAnalysis`/`anomalyDetection`), aliases (`modelsMode`/`modelsLayout`/`useHistory`/`diffReport`), `resolveSpecAnalysisConfig`
- **Shape:** bit-identical `TStrictFlatOptions[]` — no entity fingerprint bump
- **OpenSpec change:** `generation-options-field-lists`

## Diff report lifecycle

First-cut deepen: home adapt + persist/load + apply + miracle build + types under **`src/core/diffReport/`**; produce stays in `semanticDiff`; Generation item session keeps thin load/apply wrappers.

- **Package:** `src/core/diffReport/` with barrel `index.ts` (internal — not re-exported from `src/core/index.ts`)
- **Moves:** `loadDiffReport`, adapters (`adaptSemanticToStructural` + related), `buildMiraclesFromSemanticChanges`, `applyDiffReportToClient`, `writeDiffReport` (renamed from `writeSemanticDiffReport`, **no** permanent alias — update call sites), types from `types/DiffReport.model.ts` → `diffReport/` + **shim re-export** at old types path (no `utils/adapters` shim — call sites import the package)
- **Stays:** `analyzeOpenApiDiff` / miracle heuristics in `semanticDiff/`
- **Deletes:** `createSemanticDiffContext` + unused call in `analyzeDiff`
- **Call shape:** `GenerationItemSession` `loadDiffReportIfNeeded` / `applyDiffReportIfNeeded` unchanged
- **On-disk:** Unified 2.0 + Semantic 1.1 + legacy read compat unchanged
- **OpenSpec change:** `pdtch-191-diff-report-lifecycle`
- **Out of scope (lifecycle cut):** schema collapse, Unified-direct apply, Session/options/WriteClient rethink

## produceUnifiedDiffReport

Move Unified assemble out of analyze-diff CLI into Diff report package.

- **Module:** `src/core/diffReport/produceUnifiedDiffReport.ts` (+ `createSpecHash`); export from `diffReport/index.ts` (not `core/index`)
- **Owns:** metadata + circular-safe hashes + semantic slice + `adaptSemanticToStructural`; optional `timestamp` override (default `toISOString()`)
- **Input:** `{ semantic: SemanticDiffReport, base, target, baseSpec, targetSpec, ignored?, timestamp? }` → `UnifiedDiffReport`
- **Stays in CLI:** load → analyze → hooks → ignore → governance/miracles enrich → **produce** → write; logging/CI
- **Out of scope:** governance/miracles/hooks inside produce; merge with write; Unified-direct apply; Spec-load git
- **OpenSpec change:** `produce-unified-diff-report`

## Spec load unify

Shared Spec resolve prologue + two modes under `src/core/specLoad/`.

- **Layout:** `resolveOpenApiRefs.ts` (path/exists/`SwaggerParser.resolve` + root) · `forContext.ts` · `forSemantic.ts` · `expandOpenApiRefsForSemanticDiff.ts` · shared minimal refs interface · barrel `index.ts` (internal, used surface only, not from `core/index`)
- **Facades (thin, keep paths):** `createResolvedContext.ts` · `utils/loadSemanticOpenApiSpec.ts` (`loadSemanticOpenApiSpec` / `loadSemanticOpenApiObject`)
- **Modes:** `forContext` → Context.attach + root; `forSemantic` → resolve + expand clone (file + in-memory object)
- **Stays in CLI:** git `readSpecFromGit` / `parseSpecContent` (`SwaggerParser.parse`)
- **Out of scope:** Context lazy-ref / virtual-map semantics change, Diff package, `validateWithSwaggerParser` merge, Session/Write/options, git parse absorb
- **OpenSpec change:** `pdtch-191-spec-load-unify`

