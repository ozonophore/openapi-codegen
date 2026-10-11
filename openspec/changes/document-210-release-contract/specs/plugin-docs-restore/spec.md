## MODIFIED Requirements

### Requirement: Якоря plugin system на странице features
`docs/en/features.md` и `docs/ru/features.md` MUST link the plugin system to the current author contract (Plugin factory API) and MUST NOT present «Plugin API v2 (RFC)» as the current API. A section that lists v2 hook names MAY remain if it points at `plugins.md` and does not use “RFC” as the current status. TOC / `usage.md` / `configuration.md` / README / `README.rus.md` / See also in `plugins.md` MUST NOT use `features.md#plugin-api-v2-rfc` as the primary plugin link. A hidden heading that preserves the old hash MAY exist only if it does not contain “RFC”.

#### Scenario: Features ссылается на plugins
- **WHEN** пользователь читает страницу features
- **THEN** plugin system доступен по ссылке из оглавления features

#### Scenario: RFC is not the current contract
- **WHEN** пользователь открывает `docs/en/usage.md`, `docs/ru/usage.md`, README, or `README.rus.md`
- **THEN** plugin links go to `plugins.md` (factory + v1/v2 files stay valid), not to an RFC heading as current

#### Scenario: plugins See also is not RFC-as-current
- **WHEN** пользователь открывает See also in `docs/en/plugins.md` or `docs/ru/plugins.md`
- **THEN** the current-contract link is factory / `plugins.md`, not «Plugin API v2 (RFC)»

---

### Requirement: Пример custom type plugin
Репозиторий MUST содержать `example/plugins/custom-type.plugin.cjs` (или эквивалент) для object v1/v2, **и** MUST содержать factory-пример (`meta` + `createPlugin` or function + `.meta`, `apiVersion: '3'`) под `example/plugins/`. The factory file MUST follow the author contract in `plugins.md` (PluginApi registration, not an empty stub).

#### Scenario: Пример плагина присутствует
- **WHEN** пользователь открывает файл примера плагина v1
- **THEN** файл экспортирует валидный объект плагина с `name` и override hook

#### Scenario: Factory example present
- **WHEN** пользователь открывает `example/plugins/`
- **THEN** at least one file exports Plugin factory API (`meta` + `createPlugin` or function + `.meta`) in the style of `plugins.md`
