## 1. Wrap

- [x] 1.1 Добавить `wrapLegacyPlugin.ts`: in-place wrap, привязка `this`, no-op при `apiVersion === '3'`
- [x] 1.2 Вызывать wrap после `configure` в `loadGeneratorPlugins`; оборачивать списки в `Context` и `applySemanticDiffPluginHooks`
- [x] 1.3 Тесты: load v1 → runtime `'3'`; factory — та же ссылка; `this.seen` в configure сохраняется

## 2. Builtin factory

- [x] 2.1 `buildFactoryPluginSync` для sync `createPlugin`; переписать `xTypescriptTypePlugin` как factory; список `getBuiltinPlugins` без смены состава
- [x] 2.2 Тесты: у builtin `apiVersion === '3'`; getModel по-прежнему мапит x-typescript-type

## 3. Документация

- [x] 3.1 Docs en/ru: заметка про runtime wrap; ADR `0003`; глоссарий; CHANGELOG factory + wrap

## 4. Проверка

- [x] 4.1 Юнит-тесты плагинов + `openspec validate plugin-legacy-wrap`
