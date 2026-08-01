## 1. Модель plugin entries и config schema

- [x] 1.1 Добавить `pluginEntries.ts` с `normalizePluginEntry`, `mergePluginPaths`, `extractPluginPaths`
- [x] 1.2 Расширить `CommonSchemas` `plugins` до `string | { path, name?, config? }`; добавить `disableBuiltinPlugins`, `strictPluginMode`
- [x] 1.3 Добавить defaults в `Consts.ts`; экспортировать helpers из `core/plugins/index.ts` и `core/index.ts`
- [x] 1.4 Добавить `validatePluginPaths` в `check-config` (root + items)

## 2. Интеграция CLI generate

- [x] 2.1 Добавить `--plugins` и `--strict-plugin-mode` в `generate` в `cli/index.ts`
- [x] 2.2 Добавить `plugins` и `strictPluginMode` в `generateOptionsSchema`
- [x] 2.3 Merge CLI plugins в `mergeGenerateCliOverrides` через `mergePluginPaths`; добавить `strictPluginMode` в override keys
- [x] 2.4 Подключить в `OpenApiClient`: `extractPluginPaths`, `disableBuiltinPlugins`, `strictPluginMode` → loader и Context

## 3. Интеграция CLI analyze-diff

- [x] 3.1 Добавить `--plugins` и `--strict-plugin-mode` в `analyze-diff` в `cli/index.ts`
- [x] 3.2 Добавить поля в `analyzeDiffOptionsSchema`
- [x] 3.3 Обновить `resolvePluginPaths(config, cliPlugins)` для merge config + CLI

## 4. Исправления runtime correctness

- [x] 4.1 Исправить `runPreAnalyze`: загрузка эффективных plugins (не `[]`)
- [x] 4.2 Добавить strict/soft try/catch в `Context.resolveSchemaTypeOverride`
- [x] 4.3 Исправить diagnostic `beforeReportWrite`: `applied` только при реальном изменении report/path
- [x] 4.4 Добавить опцию `disableBuiltins` в `loadGeneratorPlugins`; предупреждение при неподдерживаемом `apiVersion`

## 5. Cache fingerprint

- [x] 5.1 Обновить `ArtifactFingerprinter.buildOptionsSlice` для entries `{ path, name?, config? }`
- [x] 5.2 Добавить unit tests для pluginsHash при смене object config

## 6. Дocumentation и примеры

- [x] 6.1 Восстановить `docs/en/plugins.md` и `docs/ru/plugins.md`
- [x] 6.2 Обновить `docs/en|ru/features.md` с plugin anchors
- [x] 6.3 Добавить `example/plugins/custom-type.plugin.cjs`; включить `plugins: []` в init templates
- [x] 6.4 Обновить `CHANGELOG.md`, `CHANGELOG.RU.md`, `README.md`; bump version до `2.1.0-beta.15`

## 7. Тесты

- [x] 7.1 `pluginEntries.test.ts`, `pluginPaths.test.ts`, `Context.pluginMode.test.ts`
- [x] 7.2 `ArtifactFingerprinter.plugins.test.ts`, `validatePluginPaths.test.ts`
- [x] 7.3 Расширить `loadGeneratorPlugins.test.ts`, `applySemanticDiffPluginHooks.test.ts`

## 8. Синхронизация OpenSpec baseline

- [x] 8.1 Добавить domain specs и README `document-service-baseline/`
- [x] 8.2 Добавить baseline cross-links в delta specs (`artifact-fingerprint-correctness` и др.)
- [x] 8.3 Удалить superseded standalone core specs после archive sync

## 9. Верификация

- [x] 9.1 Запустить unit tests для plugin-related modules
- [x] 9.2 Запустить `openspec validate pdtch-189-fix-plugin-cli-and-docs`
- [x] 9.3 Smoke: `generate --plugins ./example/plugins/custom-type.plugin.cjs` и `analyze-diff --plugins ...`
