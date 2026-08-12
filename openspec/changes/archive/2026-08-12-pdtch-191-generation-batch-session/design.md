## Context

`OpenApiClient.generateCodeForItems` owns the multi-item Generation lifecycle as a method-local mutable bag. Prior change `openapi-client-generate-decompose` extracted shallow post-step adapters and explicitly non-goal’d cache/Reuse setup and the main loop. Architecture review chose to deepen a **Generation batch session** instead of more leaf utils.

Grilling decisions (locked): full lifecycle ownership; `generateSingle` stays on `OpenApiClient`; class module; final report after GC/save; callback seam; skip/fingerprint stay on client; path helpers move into session; accumulator on session via `itemRunContext`; internal (no `core/index` export); `shutdownLogger` success-path preserve; OpenSpec name `generation-batch-session`.

## Goals / Non-Goals

**Goals:**
- One deep module owns batch lifecycle so deleting it concentrates complexity
- Narrow callback seam for per-item work and entity-skip probes
- Fix report finalize ordering (final write after GC/save)
- Unit-test the session through its interface with fake callbacks
- Keep public CLI/config behavior unchanged aside from accurate `phases` timings

**Non-Goals:**
- Moving `generateSingle` into the session
- Unifying `getCacheFingerprint` with `buildOptionsSliceHash`
- Collapsing the 9-field Reuse bag on WriteClient
- Plugin `config` runtime injection
- Context two-phase init factory
- Changing `shutdownLogger` to `finally` (error path)

## Decisions

### Decision 1: Class `GenerationBatchSession` in `src/core/GenerationBatchSession.ts`

**Choice:** New class with `run(items, rawOptions)`, constructed with deps.

**Alternatives:** Functions + session state object; private collaborator left inside `OpenApiClient.ts`.

**Why:** Matches `WriteClient` / `ReuseStore` locality; clear test surface; AI-navigable single file beside the facade.

### Decision 2: Callback seam (not host `OpenApiClient`)

```ts
type ItemRunContext = {
  reuseStore: ReuseStore | null;
  referencedArtifactKeys: Set<string>;
  onReuseStat?: (hit: boolean) => void;
  sharedFolderWriter?: SharedFolderWriter;
  specAnalysisAccumulator: SpecAnalysisAccumulator | null;
};

type GenerationBatchSessionDeps = {
  writeClient: WriteClient;
  eslintFixOptions: TEslintFixOptions;
  generateItem: (
    item: TStrictFlatOptions,
    generationCache: GenerationCache | null,
    itemRunContext: ItemRunContext
  ) => Promise<{ entitySkipped: boolean }>;
  shouldEntitySkip: (
    item: TStrictFlatOptions,
    generationCache: GenerationCache | null,
    reuseStore: ReuseStore | null
  ) => Promise<boolean>;
};
```

**Why:** Session tests don’t need a real `OpenApiClient`. Rename reuse bag → `itemRunContext` because accumulator is not Reuse.

### Decision 3: What moves vs stays

**Moves into session:** body of `generateCodeForItems`; path/cache resolvers and validate/warn helpers used only by batch setup; `cleanupStaleOutputs` / `removeStaleFilesInDirectory` / `runBatchEslintFixIfEnabled` (need `writeClient` + `eslintFixOptions`); Spec analysis accumulator create/finalize/clear.

**Stays on `OpenApiClient`:** `generate` / normalize / defaults; `generateSingle`; `getCacheKey` / `getCacheFingerprint` / `filesExist` / `resolveEntitySkipForItem`; wiring that builds deps and calls `session.run`.

### Decision 4: Report finalize

1. On `ReuseConflictError` mid-loop: early `writeGenerationReport` (phases may omit or show 0 for gc/save) — preserve today’s diagnostic dump.
2. After loop + post steps + GenerationCache save + spec analysis finalize: **then** `reuseStore.gc` + `save`, **then** final `writeGenerationReport` with real `phases` when `cacheDebug && reuseStore`.
3. `runWorkspaceReport` stays after final report timing is fixed relative to GC — keep call order coherent: prefer **GC/save → final report → workspace report** so report phases are honest; workspace report still receives the same `specStats` / store. If workspace report previously ran before GC, move it to after final report (same relative place vs store mutation: after GC) unless a test asserts pre-GC workspace — preserve stats content, fix only report file phases.

**Order after deepen (success path):**
combine (unless all skipped) → trafficSplitter → swarm → stale cleanup → GenerationCache save → finalizeSpecAnalysis → **reuse GC/save** → **final generation report** → workspaceReport → write stats log → ESLint (unless all skipped) → finished logs → `shutdownLogger`.

Early conflict dump unchanged in catch-before-rethrow.

### Decision 5: Visibility

Do not export from `src/core/index.ts`. Tests import `../GenerationBatchSession` or `../../core/GenerationBatchSession`.

### Decision 6: Reopen prior non-goal

`openapi-client-generate-decompose` deferred cache/Reuse setup extraction. This change intentionally extracts that orchestration into the session while leaving per-item generation on the client.

## Risks / Trade-offs

- **[Risk] Signature change on `generateSingle` reuse context** → Mitigation: single call site from session callback; rename type locally; compile-time catch.
- **[Risk] Moving path helpers duplicates logic if client still needs some** → Mitigation: only move helpers unused by `generateSingle`; keep `resolveHelper(process.cwd(), …)` inline in `generateSingle` as today.
- **[Risk] Reordering workspaceReport vs GC** → Mitigation: workspace report doesn’t embed gcMs; if any integration asserts file mtimes, update tests.
- **[Risk] Large extract regresses behavior** → Mitigation: unit tests on session ordering + existing reuse/performance integration tests.

## Migration Plan

- No config/CLI migration.
- Developers: read `CONTEXT.md` term; prefer editing session for batch orchestration bugs.
- Rollback: revert commit(s); no data migration.

## Open Questions

_(none — grilling closed)_
