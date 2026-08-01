# Design — PDTCH-189 plugin CLI и runtime fixes

## Context

Generator plugins расширяют type resolution (`resolveSchemaTypeOverride`) и semantic-diff hooks (`beforeReportWrite`, `afterSemanticDiff`, `mapRecommendation`). Конфиг уже поддерживал поле `plugins: string[]`, но:

1. CLI не предоставлял `--plugins`, несмотря на частичное покрытие в spec.
2. Конфиг не мог хранить per-plugin options, нужные для стабильной инвалидации кэша.
3. `preAnalyze` жёстко передавал `plugins: []`, нарушая паритет с generate.
4. Hook diagnostics считали любой truthy return (включая `{}`) статусом `applied`.
5. Fingerprint logic понимал только legacy object shape `{ name, ...rest }`.

Baseline specs были разрознены по множеству `*-core` folders; этот change также вводит `document-service-baseline/` как domain map.

## Goals / Non-Goals

**Goals:**

- Единый путь разрешения plugin paths для generate, preAnalyze и analyze-diff.
- Config-first merge с дополнением из CLI и dedupe по resolved path.
- Object plugin entries `{ path, name?, config? }` валидируются в Zod и отражаются в `pluginsHash`.
- Strict vs soft failure modes для type overrides (generate) и hooks (analyze-diff, существующее поведение).
- Восстановленная пользовательская документация по plugins и предупреждения валидации конфига.
- Публичный экспорт helpers merge/load для plugins.

**Non-Goals:**

- Plugin API v3 factory или новые типы hooks.
- Передача inline plugin `config` через CLI (objects остаются только в конфиге).
- Замена поведения builtin `x-typescript-type` beyond opt-out через `disableBuiltinPlugins`.
- x-extension builtin plugins (отдельный change `x-extension-builtin-plugins`).

## Decisions

### 1. Централизация нормализации записей в `pluginEntries.ts`

**Выбор:** новый модуль с `normalizePluginEntry`, `mergePluginPaths`, `extractPluginPaths`.

**Обоснование:** три call site (generate CLI merge, analyze-diff resolve, fingerprinter) нуждаются в одних правилах. Dedupe использует `resolveHelper(cwd, path)`, чтобы `./a.cjs` и `a.cjs` схлопывались.

**Альтернатива:** inline merge в каждой CLI-команде — отклонена (риск расхождения).

### 2. Config-first merge; CLI не перезаписывает object config

**Выбор:** когда один resolved path есть в конфиге (с `config`) и в CLI, побеждает запись из конфига.

**Обоснование:** CLI принимает только строки-пути; структурированные опции принадлежат конфигу.

### 3. Разный scope `strictPluginMode` по командам

**Выбор:**

- `generate` / `Context`: strict только для throws в `resolveSchemaTypeOverride`; в soft mode цепочка продолжается.
- `analyze-diff`: strict для любого throw hook (сохранено существующее поведение).

**Обоснование:** цепочка type override по умолчанию best-effort; diff hooks критичнее для CI.

### 4. Diagnostic `applied` у hook через детекцию изменений

**Выбор:** сравнивать `currentReport !== previousReport || currentReportPath !== previousReportPath` после hook.

**Обоснование:** `{}` truthy, но no-op; прежнее `maybeResult ? 'applied'` было неверным.

### 5. Fingerprint plugin slice поддерживает `{ path, name?, config? }`

**Выбор:** name по умолчанию равен `path`, если не указан; в hash участвует только явный object `config` (не legacy spread неизвестных ключей, если нет поля `path` — backward compat для `{ name, ...rest }`).

**Обоснование:** string entries без изменений; смена object config мягко инвалидирует reuse cache.

### 6. `disableBuiltinPlugins` на границе loader

**Выбор:** `loadGeneratorPlugins(paths, { disableBuiltins })` пропускает `getBuiltinPlugins()`.

**Обоснование:** регистрация builtin в одном месте; OpenApiClient и preAnalyze передают флаг из options.

### 7. Layout spec: `document-service-baseline/`

**Выбор:** domain specs под baseline README; sibling delta specs (`artifact-fingerprint-correctness` и др.) ссылаются через `**Baseline:**` в Purpose.

**Обоснование:** меньше orphan `*-core` specs; specs привязаны к CLI entry points.

## Risks / Trade-offs

- **[CLI не может задать plugin config]** → задокументировать, что object entries только в конфиге.
- **[Dedupe скрывает intent переупорядочивания CLI]** → приемлемо; порядок config-first, затем append CLI.
- **[Асимметрия strict mode]** → задокументировать в plugins.md; пользователи должны учитывать семантику по командам.
- **[Baseline + legacy specs сосуществуют при переходе]** → archive change синхронизирует deltas; часть folders может дублироваться до завершения archive.

## Migration Plan

1. Выпустить `2.1.0-beta.15` с backward-compatible string `plugins` arrays.
2. Пользователи могут перейти на `{ path, config? }`, когда опции плагина влияют на output/cache.
3. Миграция конфига не требуется; `init`/`check-config` показывают `plugins: []` и предупреждения об отсутствующих paths.
4. Archive change для merge delta specs в main tree и удаления superseded standalone specs.

## Open Questions

- Добавить ли в baseline spec `generator-plugins` явные требования для CLI `--plugins` merge (сейчас только через delta specs)?
- Должен ли change `x-extension-builtin-plugins` переиспользовать `disableBuiltinPlugins` или расширять его?
