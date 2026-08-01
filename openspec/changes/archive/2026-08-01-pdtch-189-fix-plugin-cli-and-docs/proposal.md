# PDTCH-189 — исправление plugin CLI, документации и runtime

## Why

Plugin system в beta.14 вышел с пробелами: CLI-флаги были описаны в spec, но отсутствовали в Commander/Zod; `preAnalyze` игнорировал настроенные plugins; diagnostics semantic-diff hooks давали ложные срабатывания; записи плагинов `{ path, config? }` не влияли на cache fingerprints. Документация (`docs/en|ru/plugins.md`) отсутствовала. Пользователи не могли надёжно переопределять типы или запускать analyze-diff hooks из CLI.

## What Changes

- Добавить `--plugins` и `--strict-plugin-mode` в `generate` и `analyze-diff`; merge CLI paths с конфигом (сначала конфиг, dedupe по path).
- Расширить config `plugins` до `{ path, name?, config? }`; добавить `disableBuiltinPlugins` и `strictPluginMode` на root / `items[]`.
- Ввести `pluginEntries.ts` (`normalizePluginEntry`, `mergePluginPaths`, `extractPluginPaths`) как общий слой merge/normalize.
- Исправить `preAnalyze`: загрузка эффективных plugins (как в generate).
- Исправить diagnostics `beforeReportWrite`: `applied` только при реальном изменении report или reportPath.
- Исправить `ArtifactFingerprinter`: хеш object-shaped plugin config через `{ path, name?, config? }`.
- Добавить try/catch + strict mode для `Context.resolveSchemaTypeOverride`; предупреждение при неподдерживаемом `apiVersion`.
- Восстановить plugin docs (EN/RU), якоря в features, пример `custom-type.plugin.cjs`; `check-config` предупреждает об отсутствующих файлах плагинов.
- Экспортировать `loadGeneratorPlugins`, `mergePluginPaths`, `extractPluginPaths` из public API.
- Реорганизовать main specs в domain baseline `document-service-baseline/`; связать delta specs с baseline.
- Релиз `2.1.0-beta.15`.

## Capabilities

### New Capabilities

- `generate-cli-plugins`: CLI `--plugins` / `--strict-plugin-mode` для `generate` и merge с конфигом.
- `analyze-diff-cli-plugins`: CLI `--plugins` / `--strict-plugin-mode` для `analyze-diff`.
- `plugin-config-entries`: config schema и merge helpers для string vs object plugin entries.
- `plugin-runtime-correctness`: опции loader, strict/soft override mode, исправления hook diagnostics, загрузка plugins в preAnalyze.
- `plugin-docs-restore`: product docs, example plugin, init template `plugins: []`.
- `document-service-baseline`: domain baseline specs, консолидирующие CLI/codegen capabilities.

### Modified Capabilities

- `artifact-fingerprint-correctness`: object-shaped plugin entries с явным `config` MUST менять `pluginsHash`.
- `generate-cli-validation`: Zod schemas принимают `plugins`, `strictPluginMode`; CLI override merge включает plugin paths.
- `pre-analyze-core`: preAnalyze MUST загружать item/root plugins (не пустой массив).

## Impact

- **CLI**: `src/cli/index.ts`, `generateCliOverrides.ts`, `analyzeDiff/pluginPaths.ts`, Zod schemas.
- **Core**: `Context.ts`, `OpenApiClient.ts`, `runPreAnalyze.ts`, `loadGeneratorPlugins.ts`, `applySemanticDiffPluginHooks.ts`, `ArtifactFingerprinter.ts`.
- **Config**: `CommonSchemas.ts`, `Consts.ts`, `buildConfig.ts`, `validatePluginPaths.ts`.
- **Public API**: `src/core/index.ts`, `src/core/plugins/index.ts`.
- **Docs**: `docs/en|ru/plugins.md`, `features.md`, `CHANGELOG.md`.
- **Specs**: новый `document-service-baseline/*`; удалены/консолидированы standalone core specs; cross-links delta specs.
- **Version**: `2.1.0-beta.15`.
