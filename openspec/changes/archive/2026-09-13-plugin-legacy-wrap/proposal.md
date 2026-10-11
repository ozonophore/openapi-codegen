## Why

Plugin factory API уже поставляется, но объекты v1/v2 и builtin `x-typescript-type` живут рядом с factory как вторая runtime-форма. Вызывающие уже передают `PluginRuntimeContext`; wrap делает у каждого загруженного плагина runtime `apiVersion: '3'`, чтобы generate и analyze-diff делили один контракт объекта.

## What Changes

- После загрузки (и после `configure()`) оборачивать объекты v1/v2 `OpenApiGeneratorPlugin` в runtime `apiVersion: '3'`. Factory-плагины уже `'3'` (идемпотентно). Сохранять `this` на исходных хуках.
- Оборачивать также при attach Context и в `applySemanticDiffPluginHooks`, чтобы плагины без лоадера получали ту же runtime-форму.
- Переписать builtin `x-typescript-type` как Plugin factory API (`createPlugin` + `meta`), материализовать один раз для тестов и `getBuiltinPlugins`.
- Docs: авторский export v1/v2 не меняется; после загрузки runtime — `'3'`.
- **Не в этом change:** композиция массивов handler (one-shot `on*` остаётся); object-shaped `--plugins` в CLI.

## Capabilities

### New Capabilities

- (нет)

### Modified Capabilities

- `generator-plugins`: legacy wrap в runtime `'3'`; builtin — factory-плагин.

## Impact

- `wrapLegacyPlugin.ts`, `loadGeneratorPlugins.ts`, `Context.ts`, `applySemanticDiffPluginHooks.ts`, `builtins/xTypescriptTypePlugin.ts`
- Тесты: загруженный v1-плагин имеет runtime `'3'`; у builtin `apiVersion === '3'`
- `docs/en|ru/plugins.md`, ADR `0003`, `CONTEXT.md`
