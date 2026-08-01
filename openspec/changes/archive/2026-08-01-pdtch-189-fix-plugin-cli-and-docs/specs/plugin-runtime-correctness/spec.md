## ADDED Requirements

### Requirement: preAnalyze загружает эффективные плагины
`runPreAnalyze` MUST загружать плагины из эффективных опций item `plugins` и `disableBuiltinPlugins`, совпадая с поведением generate. Передача пустого массива plugins в Context запрещена.

#### Scenario: preAnalyze с настроенным плагином
- **WHEN** item содержит `plugins: ['./custom-type.plugin.cjs']` и запускается preAnalyze
- **THEN** Context получает загруженные экземпляры плагинов

#### Scenario: preAnalyze учитывает disableBuiltinPlugins
- **WHEN** item устанавливает `disableBuiltinPlugins: true`
- **THEN** builtin-плагины не загружаются во время preAnalyze

---

### Requirement: Статус applied у beforeReportWrite отражает реальные изменения
`applySemanticDiffPluginHooks` MUST помечать diagnostic `beforeReportWrite` как `applied` только когда hook меняет ссылку/значение `report` или `reportPath`. Возврат пустого объекта `{}` MUST давать статус `skipped`.

#### Scenario: No-op hook возвращает пустой объект
- **WHEN** plugin `beforeReportWrite` возвращает `{}`
- **THEN** diagnostic status — `skipped`

#### Scenario: Hook меняет путь отчёта
- **WHEN** plugin возвращает `{ reportPath: './other.json' }`
- **THEN** diagnostic status — `applied`

---

### Requirement: Обработка ошибок resolveSchemaTypeOverride
`Context.resolveSchemaTypeOverride` MUST перехватывать ошибки плагинов. В strict mode MUST пробрасывать исключение с именем плагина; в soft mode MUST логировать предупреждение и пробовать следующий плагин.

#### Scenario: Soft mode продолжает цепочку
- **WHEN** первый плагин падает, а второй возвращает `'CustomType'`
- **THEN** override равен `'CustomType'`

---

### Requirement: Loader предупреждает о неподдерживаемом apiVersion
`loadGeneratorPlugins` MUST предупреждать, когда плагин объявляет `apiVersion`, отличный от `"1"` или `"2"`, но MUST всё равно загружать плагин. MUST предупреждать, когда v2 hooks присутствуют без `apiVersion`.

#### Scenario: Неподдерживаемый apiVersion
- **WHEN** плагин экспортирует `apiVersion: '3'`
- **THEN** предупреждение логируется, и плагин загружается

---

### Requirement: loadGeneratorPlugins принимает опцию disableBuiltins
`loadGeneratorPlugins(pluginPaths, { disableBuiltins? })` MUST пропускать добавление builtin-плагинов, когда `disableBuiltins` равен true.

#### Scenario: Опция передаётся из OpenApiClient
- **WHEN** generate запускается с `disableBuiltinPlugins: true`
- **THEN** loader вызывается с `disableBuiltins: true`
