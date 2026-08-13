## Context

HEAD after reuse-write-session: generate/preAnalyze still `new Context` + `getOpenApiSpec`. Constructor assigns `_refs = {} as RefsLike` (guards never fire). `initializeVirtualFileMap(rootSchema, entryFile)` ignores `rootSchema`. Loader takes `string[]`; `extractPluginPaths` drops `config` that fingerprints already hash.

Grilling (PDTCH-191 phase 1, 207e): factory + plugin `configure` in this seam; fold `_refs` and drop dead `rootSchema` here. analyze-diff full entries is Phase 2.

## Goals / Non-Goals

**Goals:**
- One factory for file-based resolved Context
- Honest `_refs` (undefined until attach)
- Plugin runtime sees the same `config` that fingerprints hash

**Non-Goals:**
- Passing Context into WriteClient
- Plugin API v3
- analyze-diff passing full entries (Phase 2 `plugin-entry-assembly`)
- `specLoad/` package (later `f718`)

## Decisions

### Decision 1: Factory module
`src/core/createResolvedContext.ts` — move resolve/exists/get-root from `getOpenApiSpec`, then `attachResolvedOpenApi`. Delete `getOpenApiSpec.ts`.

### Decision 2: Context internal init
`attachResolvedOpenApi(refs, absoluteEntryFile)` public `@internal`; `addRefs` + `initializeVirtualFileMap` private. Drop unused `rootSchema`. Do not assign `_refs = {}` in constructor.

### Decision 3: configure hook
`configure?: (config: Record<string, unknown>) => void | Promise<void>`. Loader accepts `string | PluginConfigEntry`-like entries; normalize; call configure iff `Object.keys(config).length > 0`. Throw fails load.

### Decision 4: Callers
`OpenApiClient.generateSingle` and `runPreAnalyze` use factory + `loadGeneratorPlugins(mergePluginPaths(plugins, null), …)`. analyze-diff stays path-only.

### Decision 5: Tests
Factory: success / missing / empty path. Loader: inject / skip empty / throw. Parser getType tests switch to factory.

## Risks / Trade-offs

- **[Risk] Tests that called `addRefs` on a half Context** → Switch to factory
- **[Risk] Plugins that ignored config now receive it** → Intended
- **[Risk] `values()` on new Context throws instead of "is not a function"** → Correct guard

## Migration Plan

- Internal generate path; `configure` is additive on the plugin interface
- Rollback: revert

## Open Questions

_(none)_
