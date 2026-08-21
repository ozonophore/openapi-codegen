# Domain context

Glossary for architecture and generation. Prefer these names over file/class nicknames when talking about seams.

## Generation batch session

Owns the **multi-item Generation lifecycle** for one `generate()` run: **Generation batch setup** → per-item orchestration → **Generation batch finalize**.

- **Module:** `GenerationBatchSession` (`src/core/GenerationBatchSession.ts`)
- **Deps:** `writeClient`, `eslintFixOptions`, `generateItem`, `shouldEntitySkip`
- **Does not own:** per-item parse → Client → Write (`GenerationItemSession`, wired as `generateItem`); pre-loop bootstrap (`setupGenerationBatch`); post-loop phases (`finalizeGenerationBatch`)
- **Seam to per-item:** callbacks (`generateItem` → `{ entitySkipped }`, `shouldEntitySkip`); Spec analysis accumulator lives on setup `state` and is passed inside **`itemRunContext`**
- **Setup seam:** before item loop → `setupGenerationBatch(deps, items, root)` — see **Generation batch setup**
- **Finalize seam:** after item loop → `finalizeGenerationBatch(ctx)` — see **Generation batch finalize**
- **Visibility:** internal module (not re-exported from `src/core/index.ts`), same as `OpenApiClient`
- **Logger:** `shutdownLogger` stays at the end of the session success path (behavioral preserve)
- **Report order:** early dump on Reuse conflict (may omit final phases); success path is **Reuse GC/save → final Generation report → workspace report** so `phases` timings are honest when `cacheDebug`
- **Gates:** when all items `entitySkipped`, skip index combine and batch ESLint (clear lint targets)
- **OpenSpec change:** `pdtch-191-generation-batch-session`

## Generation batch finalize

Deepen post-item-loop phases out of `GenerationBatchSession.run` into one free function.

- **Module:** `src/core/finalizeGenerationBatch.ts` — `finalizeGenerationBatch(ctx)`
- **Owns (order):** combine* (unless `allEntitySkipped`) → traffic/swarm → stale cleanup → cache save → specAnalysis finalize → reuse GC/save → generation report → workspace → write-stats log → batch ESLint (or clear lint) → finished logs
- **Input:** single ctx bag (`writeClient`, `eslintFixOptions`, `items`, `root`, `allEntitySkipped`, caches/reuse/stats, `buildGenerationReport` closure, mutable `state`)
- **Stale:** move `cleanupStaleOutputs` + `getOutputRoots` + `removeStaleFilesInDirectory` into finalize module; path helpers for setup live in setup module
- **ESLint:** batch eslint logic moves into finalize (not session private method)
- **Report factory:** session keeps the local `buildGenerationReport` closure (no `buildGenerationReport.ts` / `postGenerationSteps` on this lineage)
- **Stays on session:** item loop, early reuse-conflict report dump, `shutdownLogger` after try/catch
- **Export:** internal leaf — not `core/index`
- **Out of scope:** setup/preAnalyze/loop rethink; IndexCombine host; write order; finalize order/semantics change
- **Tests:** behavioral preserve batch suites; optional thin unit for `allEntitySkipped` guards
- **OpenSpec change:** `generation-batch-finalize`

## Generation batch setup

Deepen pre-item-loop bootstrap out of `GenerationBatchSession.run` into one free function (pair to finalize).

- **Module:** `src/core/setupGenerationBatch.ts` — `setupGenerationBatch(deps, items, root) → SetupGenerationBatchResult`
- **Owns:** cache settings warn · reuse/sharedFolder · specAnalysis accumulator · cache load · preAnalyze skip pass
- **Result bag:** caches, reuseStore, stats accumulators, `state`, `start`, `manifestLoadMs`
- **Report factory:** stays on session (`buildGenerationReport` closure reads setup + state)
- **Stays on session:** item loop, early conflict dump, finalize call, `shutdownLogger`
- **Export:** internal leaf — not `core/index`
- **OpenSpec change:** `generation-batch-setup`

## Generation item session

Owns the **per-item Generation lifecycle**: EntitySkip (+ register cached outputs on hit) → plugins / `createResolvedContext` → Spec analysis / strict → templates → Diff load/apply → V2/V3 parse / postProcess / DTO → `ReuseWriterContext` → `WriteClient.writeClient` → GenerationCache.set.

- **Module:** `GenerationItemSession` (`src/core/GenerationItemSession.ts`)
- **Deps:** `{ writeClient, eslintFixOptions }`; `run(item, generationCache, itemRunContext)` with required `ItemRunContext`
- **Wiring:** facade constructs it inside `generate(rawOptions)` and passes `generateItem: (item, cache, ctx) => itemSession.run(...)`
- **Strict:** when `strictOpenapi`, delegates to **Strict OpenAPI gate** (`runStrictOpenApiGate`) — see below
- **V2/V3:** shared prepare via private `prepareClientFromOpenApi` (parse callback → applyDiff → postProcess → DTO); switch only selects Parser + `WRITING_V2`/`WRITING_V3` logs
- **Visibility:** internal (not re-exported from `src/core/index.ts`)
- **OpenSpec change:** `pdtch-191-generation-item-session`

## Generation root options

Typed root bag for batch/finalize (architecture #1 residual after options resolve).

- **Type:** `GenerationRootOptions` in `resolveGenerationOptions.ts` — Pick: `reuseMode`, `preAnalyze`, `trafficSplitter`, `swarm`, `workspaceReport` (raw-as-is, no defaults fold)
- **Resolve:** `resolveGenerationOptions(raw) → { items, root }`; project helper private
- **Callers:** `GenerationBatchSession.run(items, root)`; finalize ctx.`root` (no `rawOptions`)
- **Items:** these 5 stay **out** of `ROOT_ONLY_KEYS` inherit (bit-identical items)
- **Facade:** `OpenApiClient.generate(rawOptions)` still takes full `TRawOptions` (resolve + logger/eslint)
- **Surface:** internal — not `core/index`
- **Tests:** field-lists golden on `.items` + thin root assert
- **Out of scope:** inherit into items; widen bag
- **OpenSpec change:** `generation-root-options`

## Migrate loaded config helper

DRY VersionedSchema migrate wiring (architecture #7 migrate-in-core Speculative → helper, not fold into resolve).

- **Module:** `src/common/VersionedSchema/Utils/migrateLoadedConfigToLatest.ts` — `migrateLoadedConfigToLatest(rawInput, migrationMode)` binds `allMigrationPlans` + `allVersionedSchemas`
- **Semantics:** returns `MigrateToLatestResult | null` (same as engine); no throw policy
- **Does not own:** `convertArrayToObject`, `omitUndefined`, stripDefaults (stay at callers)
- **Call sites:** `generateCliOptionsAdapter`, `previewChanges`, `validateAndMigrateConfigData`
- **Surface:** internal (CLI imports path; not `core/index` / public API)
- **Out of scope:** programmatic `generate(raw)` migrate; fold into `resolveGenerationOptions`; public signature change; EntitySkip/fingerprint
- **Tests:** thin unit on wiring + existing CLI suites
- **OpenSpec change:** `migrate-loaded-config-helper`

## Related terms

| Term | Role |
|------|------|
| **OpenApiClient** | Facade: constructs WriteClient, item/batch sessions; options meaning in `resolveGenerationOptions` |
| **Generate CLI options adapter** | CLI → `TRawOptions` for `generate` (Zod + merge overrides + migrate) |
| **Generation root options** | Narrow batch/finalize root Pick (`reuseMode` / `preAnalyze` / traffic / swarm / workspace); OpenSpec `generation-root-options` |
| **Migrate loaded config helper** | `migrateLoadedConfigToLatest` binds default plans/schemas; OpenSpec `migrate-loaded-config-helper` |
| **GenerationItemSession** | Per-item lifecycle: EntitySkip → parse → Client → Write → cache set |
| **Generation batch finalize** | Post-loop phases: combine → traffic/swarm → stale → cache save → specAnalysis → reuse GC/save → report → workspace → ESLint (`finalizeGenerationBatch`); OpenSpec `generation-batch-finalize` |
| **Generation batch setup** | Pre-loop bootstrap: cache/reuse/sharedFolder/preAnalyze (`setupGenerationBatch`); OpenSpec `generation-batch-setup` |
| **WriteClient** | Thin write facade over OutputFileSession, LintTargetRegistry, IndexCombineSession |
| **CoreOutputAdapter** | Narrow write/lint/log seam for `writeClient*` leaves and `writeSharedOrLocalCoreFile`; projects to `ReuseOutputAdapter` |
| **WriteClient artifacts write** | Per-item write order (`writeClientArtifacts`): mkdir/core/services/schemas/models + IndexCombine `register`; facade `WriteClient.writeClient` thin delegate; OpenSpec `write-client-artifacts-orchestration` |
| **IndexCombineSession** | Accumulates per-item generator configs; batch flush via `combineAndWrite(adapter)` / `combineAndWrightSimple(adapter)` on `CoreOutputAdapter`; OpenSpec `index-combine-core-adapter` |
| **Diff report** | Lifecycle home: adapt + persist/load + types + `enrichSemanticDiffReport` + `produceUnifiedDiffReport`; produce-analyze stays in `semanticDiff`; apply via item-session thin wrappers |
| **Strict OpenAPI gate** | When `strictOpenapi`: parser validate + load governance + strict diagnostics + write report + fail gates (`runStrictOpenApiGate`); OpenSpec `strict-openapi-gate` |
| **Spec load** | Shared Spec resolve prologue + modes `forContext` / `forSemantic` under `src/core/specLoad/`; thin facades `createResolvedContext` / `loadSemanticOpenApi*`; string parse leaf `parseOpenApiContent`; git `show` stays in CLI |
| **Plugin entry assembly** | Shared path+config entries into `loadGeneratorPlugins` for generate, preAnalyze, and analyze-diff (`resolvePluginEntries`); OpenSpec `plugin-entry-assembly` |
| **ReuseStore** | Artifact reuse manifest under cache strategy `reuse` |
| **GenerationCache** | Entity/content cache store under `src/core/generationCache/GenerationCache.ts`; OpenSpec `generation-cache-home` |
| **Generation affecting options** | Allowlist + projections: reuse `OptionsSlice` ⊂ affecting; entity fingerprint v4 uses single `optionsAffectingHash`; OpenSpec `generation-affecting-options` |
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
- **Facade:** thin public methods remain for non-index leaves / tests (`writeClientModels(opts)` → …); Full/Simple index bindings removed in **IndexCombine core adapter**
- **Visibility:** internal — not from `src/core/index.ts`
- **Follow-up (locked):** per-item write order → **WriteClient artifacts write** below
- **Follow-up (locked):** IndexCombine flush on CoreOutputAdapter → **IndexCombine core adapter**
- **OpenSpec change:** `write-client-leaf-adapters`

## WriteClient artifacts write

Deepen residual WriteClient `writeClient` / `writeModelsAndFinalize` orchestration into a free function on `CoreOutputAdapter`.

- **Module:** `src/core/writeClientArtifacts.ts` — `writeClientArtifacts(adapter, indexCombine, options)`
- **Owns:** mkdir order + core/services/executor/schemas/models writes + inline BaseDto when classes+excludeCore + `indexCombine.register`
- **Leaves:** call free `writeClient*(adapter, …)` directly (not WriteClient method bindings)
- **IndexCombine:** duck `{ register }` only
- **Props:** `TWriteClientProps` lives next to orchestration; WriteClient imports it
- **Facade:** `WriteClient.writeClient(opts)` → `writeClientArtifacts(this.toCoreOutputAdapter(), this.indexCombine, opts)`; combine* thin (see IndexCombine core adapter)
- **Internal:** private `writeModelsAndFinalize` helper in same file
- **Export:** internal leaf — not `core/index`
- **Out of scope:** write-order semantics change; nested-model-imports TODO; item/batch deps away from WriteClient; batch finalize
- **Follow-up (locked):** IndexCombine flush → **IndexCombine core adapter**
- **Tests:** behavioral preserve `WriteClient.test.ts`
- **OpenSpec change:** `write-client-artifacts-orchestration`

## IndexCombine core adapter

Flush IndexCombine via `CoreOutputAdapter` instead of WriteClient-shaped `IndexCombineWriteHost`.

- **Change:** `combineAndWrite(adapter)` / `combineAndWrightSimple(adapter)` call free `writeClientFullIndex` / `writeClientSimpleIndex`
- **Delete:** `IndexCombineWriteHost` type; WriteClient `writeClientFullIndex` / `writeClientSimpleIndex` method bindings
- **Facade:** `WriteClient.combineAndWrite*` → `this.indexCombine.combine*(this.toCoreOutputAdapter())` — batch/finalize call shape unchanged
- **Leaves:** free functions remain in `utils/writeClient*Index.ts`
- **Tests:** FullIndex unit → free function + adapter; no Simple dedicated suite today
- **Export:** internal — not `core/index`
- **Out of scope:** combine merge/alias/sort logic; finalize away from `writeClient.combine*`; artifacts/OptionsSlice/migrate
- **OpenSpec change:** `index-combine-core-adapter`

## Entity skip / entity fingerprint

Policy for skipping a Spec item when GenerationCache hit is valid: fingerprint match + files on disk. Applies when `cacheStrategy` is **`entity` or `reuse`** (hybrid skip). For `reuse`, skip also requires a Reuse manifest **presence** guard (`specItems[spec]` exists) **and** store-artifact integrity (`verifySpecItemIntegrity`) — not hashing of output files.

- **Module:** `src/core/generationCache/EntitySkip.ts` (+ `GenerationCache.ts` in same package)
- **Interface:** `buildCacheKey`, `buildEntityFingerprint`, `shouldEntitySkip` — no `registerOutputFile` (Write side effect stays in Generation item session)
- **Fingerprint (v4):** `cacheFingerprintVersion` + `generatorVersion` + `specHash` + **`optionsAffectingHash`** (see **Generation affecting options**)
- **Serialization:** `stableStringify` + same hash helper as reuse fingerprints
- **Call sites:** `GenerationItemSession.run` and batch session `shouldEntitySkip` callback; `getSpecItemName` shared (preAnalyze / AvatarSwarm use the same helper)
- **Cache break:** bump to fingerprint version **4** (one-time warm miss on affecting-options fold; reuse unchanged)
- **Store home:** `generationCache/GenerationCache.ts` — OpenSpec `generation-cache-home`
- **OpenSpec change:** `pdtch-191-entity-skip-fingerprint`

## Entity skip residual derive

Close hand-maintained residual drift vs OptionsSlice locality.

- **Strategy:** `ENTITY_FINGERPRINT_AFFECTING_KEYS` allowlist in `EntitySkip.ts`; residual = affecting − OptionsSlice coverage (`OptionsSlice` Pick keys + `plugins` / `disableBuiltinPlugins`)
- **Initial allowlist:** current residual 11 + slice/plugin keys so derived residual ≡ today’s hand list (bit-identical → keep **v3**)
- **Follow-up (locked):** fold → **Generation affecting options**
- **OpenSpec change:** `entity-skip-residual-derive`

## Generation affecting options

Unify generation-affecting option locality: one allowlist, two projections (reuse narrow / entity full).

- **Module:** `src/core/generationAffectingOptions.ts`
  - `GENERATION_AFFECTING_KEYS` (today’s slice coverage ∪ residual)
  - `REUSE_OPTIONS_SLICE_KEYS` ⊆ affecting (current OptionsSlice Pick keys; plugins via `pluginsHash` as today)
  - `buildGenerationAffectingHash(item)` — plugins normalized like `buildOptionsSlice`
- **Reuse:** `OptionsSlice` shape **unchanged**; drift test `REUSE ⊆ AFFECTING`; no reuse artifact invalidation
- **Entity fingerprint v4:** `{ cacheFingerprintVersion: 4, generatorVersion, specHash, optionsAffectingHash }` — drop `residual` + entity `optionsSliceHash`
- **Deletes:** `buildEntityFingerprintResidual`, `ENTITY_FINGERPRINT_RESIDUAL_*`, slice-coverage constants from EntitySkip (affecting keys live in new module; EntitySkip may re-export)
- **Out of scope:** expanding affecting set; fold migrate into resolve; reuse path layout; options field-lists
- **Tests:** EntitySkip v4 + ⊆ drift + residual-only flip via affecting hash; reuse OptionsSlice suites preserve
- **Warm cache:** one-time entity miss (v4); reuse unchanged
- **OpenSpec change:** `generation-affecting-options`

## Reuse write session

Opaque handle for applying ReuseStore policy while writing models/schemas.

- **Type:** `ReuseWriterContext` in `reuseStore/reuseWriterHelpers.ts` (required when present: store, optionsSlice, specInput, inputPath, modelSchemas; optional keys/stats/conflict/shared/prettier)
- **Write seam:** `WriteClient.writeClient` / `writeClientModels` / `writeClientSchemas` take `reuse?: ReuseWriterContext` — not a 9-field flat bag
- **Output adapter:** `ReuseOutputAdapter = { writeOutputFile; registerLintTarget? }`; reuse helpers depend on the adapter, not the `WriteClient` class
- **Assembly:** built once in `GenerationItemSession.run` from `itemRunContext` + local slice/schemas/paths
- **Write:** V2/V3 share one `writeProps`; single models-finalize so `inputPath` survives `validationLibrary !== NONE`
- **Hit path:** `writeOutputFile` compares content, not `expectedByteSize`
- **OpenSpec change:** `pdtch-191-reuse-write-session`

## Strict OpenAPI gate

Deepen Generation item session `strictOpenapi` block into one Strict module.

- **Module:** `src/core/strict/runStrictOpenApiGate.ts` — `runStrictOpenApiGate(…) → Promise<{ reportPath; report }>`
- **Owns:** `validateWithSwaggerParser` → `loadGovernanceConfig` → `validateOpenApiStrict` → `writeOpenApiStrictReport` → log `STRICT_REPORT_CREATED` → throw on summary.errors / optional `failOnGovernanceErrors`
- **Input:** `{ absoluteInput, openApi, context, reportFile, governanceConfig?, failOnGovernanceErrors?, logger: { forceInfo } }`
- **Caller:** Generation item session — `if (strictOpenapi) await runStrictOpenApiGate(…)` only
- **Leaves stay:** `validateOpenApiStrict` / `validateWithSwaggerParser` / `writeOpenApiStrictReport` as separate exports
- **Export:** leaf only — not `core/index`
- **Out of scope:** Spec-load merge of swagger validate; issue-code / governance semantics change; Diff/analyze-diff; public API / options
- **Tests:** unit fail gates + success reportPath; existing strict suite preserve
- **OpenSpec change:** `strict-openapi-gate`

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
- **WriteClient** — logger, `writeClient()` → `writeClientArtifacts`, leaf `writeClient*` via `CoreOutputAdapter`, public delegates
- **SharedFolderWriter** — LCA only (no WriteClient ctor arg)
- **OpenSpec change:** `pdtch-191-write-client-concern-split`

## Generation options resolve

Owns raw config → `{ items, root }`: Zod validate (**throws**, no `process.exit`) → flatten items|flat → inherit → defaults + project `GenerationRootOptions`.

- **Module:** `resolveGenerationOptions` (`src/core/resolveGenerationOptions.ts`)
- **Item overrides:** `item.X ?? root.X` for `interfacePrefix`, `enumPrefix`, `typePrefix`, `useCancelableRequest`, `sortByRequired`, `useSeparatedIndexes` (plus existing request/plugins/history/models/miracles)
- **Call site:** `OpenApiClient.generate(rawOptions)` then `GenerationBatchSession.run(items, root)`
- **Visibility:** internal (not re-exported from `src/core/index.ts`)
- **OpenSpec change:** `pdtch-191-generation-options-resolve`

## Generation options field lists

Collapse triple parallel field lists inside `resolveGenerationOptions` into explicit tables (bit-identical).

- **Home:** same module `src/core/resolveGenerationOptions.ts`
- **Tables:** root-only inherit keys · per-item override keys (including `miracles`) · defaults with per-key rule `'or' | 'nullish' | 'custom'`
- **Explicit (not in generic pick):** marauder merges (`specAnalysis`/`anomalyDetection`), aliases (`modelsMode`/`modelsLayout`/`useHistory`/`diffReport`), `resolveSpecAnalysisConfig`
- **Shape:** bit-identical `TStrictFlatOptions[]` — no entity fingerprint bump
- **OpenSpec change:** `generation-options-field-lists`

## Generate CLI options adapter

Collapse dual Zod call sites in `generateOpenApiClient` into one CLI → `TRawOptions` adapter; keep override hand list + drift test.

- **Module:** `generateCliOptionsAdapter.ts` with `resolveGenerateCliToRawOptions` (+ merge/pick/keys); former `generateCliOverrides.ts` removed
- **Zod:** `generateOptionsSchema` once at entry; direct path flat refine (`generateCliFlatSchema`) **inside** adapter only
- **Paths preserved:** direct (input+output) vs config+migrate; migrate wiring via **Migrate loaded config helper**
- **Override keys:** keep `GENERATE_CLI_OVERRIDE_KEYS` hand list; unit drift test vs `keyof GenerateOptions`
- **Caller:** `generateOpenApiClient` thin: validate Commander options → adapter → autoSelect → `OpenAPI.generate`
- **OpenSpec change:** `generate-cli-options-adapter`

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
- **Stays in CLI:** load → analyze → **enrich** → **produce** → write; logging/CI
- **Out of scope:** governance/miracles/hooks inside produce; merge with write; Unified-direct apply; Spec-load git
- **OpenSpec change:** `produce-unified-diff-report`

## Diff report enrich

Deepen analyze-diff middle block (hooks → ignore → governance → miracles) into Diff report; keep produce sibling.

- **Module:** `src/core/diffReport/enrichSemanticDiffReport.ts` — `enrichSemanticDiffReport(input) → { report, ignored, reportPath }`
- **Owns (order):** `applySemanticDiffPluginHooks` → `filterSemanticChangesByIgnoreRules` → `evaluateGovernanceRules` + `buildMiraclesFromSemanticChanges`
- **Ignore move:** filter + `matchesIgnoreRule` + `IgnoreRule` into `diffReport/`; CLI keeps `loadIgnoreRules` only
- **CLI:** validate · Spec load · load governance/ignore/plugins · `analyzeOpenApiDiff` · **enrich** · produce · write · logging/CI
- **Export:** `diffReport/index.ts` (not `core/index`)
- **OpenSpec change:** `diff-report-enrich-semantic`

## Spec load unify

Shared Spec resolve prologue + two modes under `src/core/specLoad/`.

- **Layout:** `resolveOpenApiRefs.ts` (path/exists/`SwaggerParser.resolve` + root) · `forContext.ts` · `forSemantic.ts` · `expandOpenApiRefsForSemanticDiff.ts` · shared minimal refs interface · barrel `index.ts` (internal, used surface only, not from `core/index`)
- **Facades (thin, keep paths):** `createResolvedContext.ts` · `utils/loadSemanticOpenApiSpec.ts` (`loadSemanticOpenApiSpec` / `loadSemanticOpenApiObject`)
- **Modes:** `forContext` → Context.attach + root; `forSemantic` → resolve + expand clone (file + in-memory object)
- **Stays in CLI:** git `readSpecFromGit` (`execSync` git show → core parse)
- **Out of scope:** Context lazy-ref / virtual-map semantics change, Diff package, `validateWithSwaggerParser` merge, Session/Write/options
- **OpenSpec change:** `pdtch-191-spec-load-unify`

## Spec load parse content

Move string→object OpenAPI parse from analyze-diff CLI into Spec-load; keep `git show` in CLI.

- **Module:** `src/core/specLoad/parseOpenApiContent.ts` — `parseOpenApiContent(content, sourcePath): Promise<unknown>`
- **Behavior (identical):** empty throw; JSON via `JSON.parse`; YAML via temp file + `SwaggerParser.parse` (ext from `sourcePath`)
- **CLI:** `specParser.ts` keeps only `readSpecFromGit` (`execSync` git show → core parse)
- **Export:** internal leaf only — not from `core/index`
- **OpenSpec change:** `spec-load-parse-content`

