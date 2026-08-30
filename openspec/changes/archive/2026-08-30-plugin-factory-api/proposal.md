## Why

Авторы не могут поставлять плагины с `apiVersion: '3'`: loader предупреждает и считает их legacy-объектами, а июньский контракт PDTCH-174 так и не лёг на текущий loader `PluginConfigEntry` / `configure()`. Нужен июньский авторский контракт (PluginApi + `createPlugin`) на сегодняшнем master без wrap v1/v2 и без переписи builtin.

## What Changes

- Поставить **Plugin factory API**: модуль `{ meta, createPlugin }` или функция `createPlugin` с `.meta`; `createPlugin` получает `PluginApi` и регистрирует хуки (и `onConfigure`) не больше одного раза каждый.
- Loader материализует `OpenApiGeneratorPlugin`, затем инжектит `plugins[].config` через существующий `configure()`, если config непустой.
- Вызовы хуков передают опциональный `PluginRuntimeContext` (`cwd`, `executionMode` `generate` | `analyze-diff`, опциональный `emitDiagnostic`). `preAnalyze` использует `generate`.
- **BREAKING:** плоский объект `{ name, apiVersion: '3', … }` — ошибка загрузки. `'3'` означает только factory-форму. Неизвестные версии кроме `1`/`2`/`3` по-прежнему warn-and-load, если это legacy-объекты.
- Объекты v1/v2 остаются как authored. Без `wrapLegacyPlugin`. Builtin `x-typescript-type` остаётся объектом v1/v2.
- Docs (`docs/en|ru/plugins.md`), глоссарий, ADR `0002`. Типы экспортируются из `plugins/index` и `core/index`.

## Capabilities

### New Capabilities

- (нет — factory меняет требования существующего generator-plugins)

### Modified Capabilities

- `generator-plugins`: вместо warn-only `apiVersion: '3'` — загрузка Plugin factory API, one-shot `PluginApi`, `onConfigure`, runtime-контекст на хуках, отклонение плоских объектов `'3'`.

## Impact

- `loadGeneratorPlugins.ts`, `GeneratorPlugin.model.ts`, вызовы хуков (`Context.resolveSchemaTypeOverride`, `applySemanticDiffPluginHooks`)
- Новый collector factory (только factory-path, не legacy wrap)
- Тесты в `src/core/plugins/__tests__/`
- `openspec/specs/generator-plugins/spec.md` после архива
- Публичные type exports; docs en/ru plugins
