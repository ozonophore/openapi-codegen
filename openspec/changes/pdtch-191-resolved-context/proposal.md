## Why

Generate/preAnalyze собирают Context в два шага (`new Context` → `getOpenApiSpec` → `addRefs` + `initializeVirtualFileMap`), можно отдать полуинициализированный Context. Конструктор ставит `_refs = {}`, поэтому guard «не инициализирован» не срабатывает. `rootSchema` в `initializeVirtualFileMap` мёртв. Plugin `config` хешируется в fingerprint, но `extractPluginPaths` срезает его до load — `configure` нет, runtime его не видит.

## What Changes

- `createResolvedContext` → `{ context, openApi }`; generate и preAnalyze переходят на factory; `getOpenApiSpec.ts` удаляется.
- `addRefs` / `initializeVirtualFileMap` становятся internal; публичный шов — `attachResolvedOpenApi`.
- Не инициализировать `_refs` пустым объектом; убрать unused `rootSchema`.
- Optional `configure?(config)` на плагине; loader принимает entries (path+config), вызывает `configure` только при непустом config; throw валит load.
- generate + preAnalyze передают `mergePluginPaths`, не `extractPluginPaths`.
- Docs en/ru `plugins.md`.

## Capabilities

### New Capabilities

- `context-resolved-factory`: одношаговый resolved Context (refs + virtual map) для generate/preAnalyze
- `plugin-config-inject`: runtime injection `plugins[].config` через `configure`

### Modified Capabilities

_(none — plugin-config-entries already describes merge/normalize, not configure)_

## Impact

- `createResolvedContext.ts`, `Context.ts`, `OpenApiClient.ts`, `runPreAnalyze.ts`, `loadGeneratorPlugins.ts`, `GeneratorPlugin.model.ts`
- Delete `getOpenApiSpec.ts`
- Tests: factory + loader `configure`; parser getType → factory
- `CONTEXT.md`, `docs/en/plugins.md`, `docs/ru/plugins.md`
