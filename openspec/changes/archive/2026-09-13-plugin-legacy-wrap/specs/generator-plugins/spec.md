## ADDED Requirements

### Requirement: Legacy-плагины оборачиваются в runtime apiVersion 3
После материализации и `configure` loader MUST прогонять каждый плагин через `wrapLegacyPlugin`. Объект v1/v2 MUST обновляться in-place до `apiVersion` `"3"`; функции хуков и `configure` MUST вызывать прежние реализации с `this`, привязанным к этому же объекту. Плагин, у которого уже `apiVersion` `"3"`, MUST остаться без изменений (та же ссылка). Конструктор `Context` и `applySemanticDiffPluginHooks` MUST оборачивать список плагинов так же.

#### Scenario: Загруженный v1-объект имеет runtime 3
- **WHEN** файл плагина экспортирует `{ name: "custom-type-override", resolveSchemaTypeOverride }` без apiVersion
- **THEN** `loadGeneratorPlugins` возвращает этот инстанс с `apiVersion` `"3"`

#### Scenario: Factory-плагин не оборачивается повторно
- **WHEN** загружается factory-модуль
- **THEN** возвращаемый объект — результат factory (`apiVersion` `"3"`), та же ссылка, что после `createPlugin`

#### Scenario: Состояние configure переживает wrap
- **WHEN** v1-плагин в `configure` ставит `this.seen = config`, а config у entry непустой
- **THEN** после загрузки `plugins[0].seen` равен этому config, и `plugins[0].apiVersion` равен `"3"`

---

### Requirement: Builtin x-typescript-type — factory-плагин
Встроенный плагин `x-typescript-type` MUST быть написан как Plugin factory API (`meta.apiVersion` `"3"` + `createPlugin`) и MUST отдавать `apiVersion` `"3"` в runtime. Семантика override (расширение `x-typescript-type` → trimmed string) MUST NOT меняться.

#### Scenario: Builtin сообщает apiVersion 3
- **WHEN** вызывается `loadGeneratorPlugins([])` (builtins включены)
- **THEN** у плагина `x-typescript-type` `apiVersion` равен `"3"`

#### Scenario: x-typescript-type по-прежнему мапит расширение
- **WHEN** у схемы есть `x-typescript-type: "File"`
- **THEN** `resolveSchemaTypeOverride` возвращает `"File"`
