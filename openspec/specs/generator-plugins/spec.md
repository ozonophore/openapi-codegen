## Purpose

Загрузка generator plugins и semantic diff hooks: export shape, Plugin factory API, `configure` injection, preAnalyze load, `beforeReportWrite` diagnostics, schema type override errors, apiVersion warnings, `disableBuiltins`.

**Related:** `generate-cli-plugins`, `analyze-diff-cli-plugins`, `plugin-config-entries`, `plugin-docs-restore`, `artifact-fingerprint-correctness` (plugin config in cache hash).

## Requirements

### Requirement: Plugin export shape validation
Каждый plugin module MUST export object с string field `name`; иначе load MUST throw invalid plugin error.

#### Scenario: Invalid export
- **WHEN** plugin file exports function without name
- **THEN** error "expected export with shape { name: string }"

---

### Requirement: Export resolution order
Plugin loader MUST resolve export as default, then named `plugin`, then module itself.

#### Scenario: Default export
- **WHEN** module has `export default { name: "my-plugin" }`
- **THEN** plugin loaded successfully

---

### Requirement: ESM fallback loading
CommonJS require MUST be attempted first; при ESM-related errors MUST fallback to dynamic import.

#### Scenario: ESM-only plugin
- **WHEN** require throws ERR_REQUIRE_ESM
- **THEN** plugin loaded via dynamic import

---

### Requirement: Builtin plugins appended
После user plugins MUST append builtin plugins как fallback handlers.

#### Scenario: No user plugins
- **WHEN** plugins array empty
- **THEN** only builtin plugins active (e.g. x-typescript-type override)

---

### Requirement: Semantic diff plugin hooks
Plugins MAY modify semantic diff report via hooks; hook diagnostics MUST log через analyze-diff diagnostic callback.

#### Scenario: Plugin modifies report
- **WHEN** plugin hook returns modified report
- **THEN** downstream ignore rules и miracles use modified report

---

### Requirement: Plugin paths from config in analyze-diff
analyze-diff MUST resolve plugin paths from openapi config when not passed explicitly on CLI.

#### Scenario: Config-defined plugins
- **WHEN** openapi.config.json lists plugins and analyze-diff runs
- **THEN** same plugins loaded for semantic diff hooks

---

### Requirement: Plugin configure receives non-empty config
Loader MUST accept plugin entries with path and config (not only string paths). After loading a plugin object, if it defines `configure` and the entry config has at least one own key, loader MUST await `configure(config)`. Empty config (string path entry) MUST NOT call `configure`. A throw from `configure` MUST fail plugin loading. Generate and preAnalyze MUST pass full entries so config is not stripped before load.

#### Scenario: Non-empty config is injected
- **WHEN** config entry is `{ path: "./p.cjs", config: { mode: "strict" } }` and plugin exports `configure`
- **THEN** loader calls `configure({ mode: "strict" })` before returning the plugin

#### Scenario: String path skips configure
- **WHEN** entry is `"./p.cjs"` (normalized config `{}`)
- **THEN** loader MUST NOT call `configure` even if the method exists

#### Scenario: configure throw is fatal
- **WHEN** `configure` throws
- **THEN** plugin load rejects / throws and generation fails

---

### Requirement: preAnalyze загружает эффективные плагины
preAnalyze MUST загружать плагины из эффективных опций item `plugins` и `disableBuiltinPlugins`, совпадая с generate. Передача пустого массива plugins в Context запрещена. Плагин с `resolveSchemaTypeOverride` MUST вызываться при парсинге схем в preAnalyze. При `strictPluginMode: true` ошибка override MUST пробрасываться из Context; preAnalyze MUST залогировать warn для этого item и продолжить остальные specs (не ронять весь generate).

#### Scenario: preAnalyze с настроенным плагином
- **WHEN** item содержит `plugins: ['./custom-type.plugin.cjs']` и запускается preAnalyze
- **THEN** Context получает загруженные экземпляры плагинов

#### Scenario: preAnalyze учитывает disableBuiltinPlugins
- **WHEN** item устанавливает `disableBuiltinPlugins: true`
- **THEN** builtin-плагины не загружаются во время preAnalyze

#### Scenario: Плагин влияет на parse context preAnalyze
- **WHEN** item настраивает плагин с `resolveSchemaTypeOverride` и `preAnalyze: true`
- **THEN** Context preAnalyze вызывает этот плагин при парсинге схем

#### Scenario: strictPluginMode в preAnalyze
- **WHEN** item устанавливает `strictPluginMode: true` и плагин падает в resolveSchemaTypeOverride во время preAnalyze
- **THEN** parse этого item падает с ошибкой плагина; preAnalyze логирует warn и не прерывает остальные items

---

### Requirement: Статус applied у beforeReportWrite отражает реальные изменения
Semantic diff plugin hooks MUST помечать diagnostic `beforeReportWrite` как `applied` только когда hook меняет ссылку/значение `report` или `reportPath`. Возврат пустого объекта `{}` MUST давать статус `skipped`.

#### Scenario: No-op hook возвращает пустой объект
- **WHEN** plugin `beforeReportWrite` возвращает `{}`
- **THEN** diagnostic status — `skipped`

#### Scenario: Hook меняет путь отчёта
- **WHEN** plugin возвращает `{ reportPath: './other.json' }`
- **THEN** diagnostic status — `applied`

---

### Requirement: Обработка ошибок resolveSchemaTypeOverride
Schema type override MUST перехватывать ошибки плагинов. В strict mode MUST пробрасывать исключение с именем плагина; в soft mode MUST логировать предупреждение и пробовать следующий плагин.

#### Scenario: Soft mode продолжает цепочку
- **WHEN** первый плагин падает, а второй возвращает `'CustomType'`
- **THEN** override равен `'CustomType'`

---

### Requirement: Loader предупреждает о неподдерживаемом apiVersion
Plugin loader MUST предупреждать, когда **legacy**-объект плагина объявляет `apiVersion`, отличный от `"1"` и `"2"` и отличный от `"3"`, но MUST всё равно загружать этот плагин. MUST предупреждать, когда v2-хуки есть, а `apiVersion` нет. MUST NOT делать warn-and-load для `apiVersion` `"3"` на legacy-объекте (см. отклонение плоского apiVersion 3).

#### Scenario: Неподдерживаемый apiVersion
- **WHEN** legacy-плагин экспортирует `apiVersion: "4"`
- **THEN** логируется предупреждение, и плагин загружается

---

### Requirement: Plugin loader принимает опцию disableBuiltins
Plugin loader MUST пропускать добавление builtin-плагинов, когда `disableBuiltins` равен true.

#### Scenario: Опция передаётся из generate
- **WHEN** generate запускается с `disableBuiltinPlugins: true`
- **THEN** loader вызывается с `disableBuiltins: true`

---

### Requirement: Загрузка Plugin factory API
Plugin loader MUST считать factory-модулем `{ meta, createPlugin }` с `meta.apiVersion` `"3"` и строковым `meta.name`, либо function-export с `.meta` той же формы. MUST дождаться `createPlugin(PluginApi)` и MUST положить получившийся `OpenApiGeneratorPlugin` (`apiVersion` `"3"`) в Context как любой другой плагин. Generate, preAnalyze и analyze-diff MUST идти этим путём.

#### Scenario: Загружается модульный factory
- **WHEN** файл плагина экспортирует `{ meta: { name: "f", apiVersion: "3" }, createPlugin }` и `createPlugin` регистрирует `onSchemaTypeOverride`
- **THEN** loader возвращает плагин с именем `"f"`, `apiVersion` `"3"` и этим хуком

#### Scenario: Загружается function factory
- **WHEN** resolved export — функция с `.meta` `{ name: "f", apiVersion: "3" }`
- **THEN** loader await'ит эту функцию с PluginApi и возвращает материализованный плагин

---

### Requirement: Однократная регистрация на PluginApi
PluginApi MUST отдавать `meta`, `onConfigure`, `onSchemaTypeOverride`, `onAfterSemanticDiff`, `onMapRecommendation` и `onBeforeReportWrite`. Каждый `on*` MUST принимать не больше одного handler; повторный вызов MUST бросать ошибку.

#### Scenario: Повторный onSchemaTypeOverride падает
- **WHEN** `createPlugin` вызывает `onSchemaTypeOverride` дважды
- **THEN** загрузка плагина бросает ошибку

---

### Requirement: Factory configure идёт через существующий injection
Если зарегистрирован `onConfigure`, материализованный плагин MUST иметь `configure`. Loader MUST затем вызывать `configure` только когда в entry config есть хотя бы один ключ — как у v1/v2.

#### Scenario: Factory получает непустой config
- **WHEN** factory регистрирует `onConfigure`, а entry — `{ path, config: { mode: "strict" } }`
- **THEN** loader вызывает этот configure с `{ mode: "strict" }`

#### Scenario: Строковый path у factory не вызывает configure
- **WHEN** factory регистрирует `onConfigure`, а entry — строковый path
- **THEN** loader MUST NOT вызывать configure

---

### Requirement: Runtime-контекст хуков
Вызывающие MUST передавать `PluginRuntimeContext` вторым аргументом хуков плагина: `cwd`, `executionMode` (`"generate"` или `"analyze-diff"`), опциональный `emitDiagnostic`. `resolveSchemaTypeOverride` на Context MUST использовать `"generate"`. Semantic-diff хуки MUST использовать `"analyze-diff"`. Legacy-хуки v1/v2 MAY игнорировать второй аргумент.

#### Scenario: Override-хук видит режим generate
- **WHEN** handler `onSchemaTypeOverride` factory-плагина читает `runtime.executionMode` во время parse generate или preAnalyze
- **THEN** значение равно `"generate"`

#### Scenario: Semantic-diff хук видит режим analyze-diff
- **WHEN** handler `onAfterSemanticDiff` factory-плагина выполняется внутри `applySemanticDiffPluginHooks`
- **THEN** `runtime.executionMode` равен `"analyze-diff"`

---

### Requirement: Плоский объект apiVersion 3 отклоняется
Объект плагина со строковым `name` и `apiVersion` `"3"`, который не является factory-модулем, MUST провалить загрузку. `"3"` MUST NOT означать legacy-объект.

#### Scenario: Плоский v3-объект падает
- **WHEN** плагин экспортирует `{ name: "future-v3", apiVersion: "3", resolveSchemaTypeOverride }`
- **THEN** loader бросает ошибку (не warn-and-load)

#### Scenario: name плюс createPlugin без meta падает
- **WHEN** плагин экспортирует `{ name: "x", createPlugin }` без factory `meta`
- **THEN** loader бросает ошибку
