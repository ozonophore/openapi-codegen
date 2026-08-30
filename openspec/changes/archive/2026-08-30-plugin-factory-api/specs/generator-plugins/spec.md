## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Loader предупреждает о неподдерживаемом apiVersion
Plugin loader MUST предупреждать, когда **legacy**-объект плагина объявляет `apiVersion`, отличный от `"1"` и `"2"` и отличный от `"3"`, но MUST всё равно загружать этот плагин. MUST предупреждать, когда v2-хуки есть, а `apiVersion` нет. MUST NOT делать warn-and-load для `apiVersion` `"3"` на legacy-объекте (см. отклонение плоского apiVersion 3).

#### Scenario: Неподдерживаемый apiVersion
- **WHEN** legacy-плагин экспортирует `apiVersion: "4"`
- **THEN** логируется предупреждение, и плагин загружается
