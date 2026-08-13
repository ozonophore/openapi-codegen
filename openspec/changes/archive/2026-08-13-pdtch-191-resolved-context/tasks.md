## 1. Context factory

- [x] 1.1 `createResolvedContext`; `attachResolvedOpenApi`; privatize `addRefs` / `initializeVirtualFileMap`; drop dummy `_refs` and unused `rootSchema`
- [x] 1.2 Switch `OpenApiClient.generateSingle` and `runPreAnalyze`; delete `getOpenApiSpec.ts`

## 2. Plugin config

- [x] 2.1 `configure?` on plugin model; loader accepts entries and injects non-empty config
- [x] 2.2 generate/preAnalyze pass `mergePluginPaths` (not `extractPluginPaths`)

## 3. Tests / docs

- [x] 3.1 Factory tests (success / missing / empty / values-before-attach); loader configure tests; getType → factory
- [x] 3.2 CONTEXT.md + docs/en|ru plugins.md `configure`
