## Purpose

Documentation for the plugin system: English and Russian docs pages, feature anchors linking to plugin system sections, an example custom-type plugin, and the init config template including the `plugins` field.

## Requirements

### Requirement: Англоязычная документация по плагинам
Проект MUST содержать `docs/en/plugins.md` с описанием формы config plugins, CLI-флагов, strict mode, builtin-плагинов и примеров использования.

#### Scenario: Документ plugins существует
- **WHEN** пользователь открывает `docs/en/plugins.md`
- **THEN** документ описывает config `plugins`, `--plugins` и `--strict-plugin-mode`

---

### Requirement: Русскоязычная документация по плагинам
Проект MUST содержать `docs/ru/plugins.md` с эквивалентной документацией по plugin system на русском языке.

#### Scenario: Русский документ plugins существует
- **WHEN** пользователь открывает `docs/ru/plugins.md`
- **THEN** документ описывает plugin system на русском языке

---

### Requirement: Якоря plugin system на странице features
`docs/en/features.md` и `docs/ru/features.md` MUST содержать ссылки на разделы plugin system (`#plugin-system`, `#plugin-api-v2-rfc`).

#### Scenario: Features ссылается на plugins
- **WHEN** пользователь читает страницу features
- **THEN** plugin system доступен по ссылке из оглавления features

---

### Requirement: Пример custom type plugin
Репозиторий MUST содержать `example/plugins/custom-type.plugin.cjs`, демонстрирующий `resolveSchemaTypeOverride`.

#### Scenario: Пример плагина присутствует
- **WHEN** пользователь открывает файл примера плагина
- **THEN** файл экспортирует валидный объект плагина с `name` и override hook

---

### Requirement: Шаблон конфига init включает plugins
Шаблоны `buildConfig` / example config MUST содержать `plugins: []` с комментарием об опциональных записях плагинов.

#### Scenario: Новый конфиг содержит поле plugins
- **WHEN** пользователь запускает init и получает сгенерированный конфиг
- **THEN** конфиг содержит `plugins: []`
