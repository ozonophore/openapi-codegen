## ADDED Requirements

### Requirement: analyze-diff принимает CLI-флаг --plugins
Команда `analyze-diff` MUST предоставлять флаг `--plugins [paths...]` для путей к модулям semantic-diff плагинов.

#### Scenario: Путь к плагину через CLI
- **WHEN** пользователь запускает `analyze-diff --plugins ./hooks.cjs --input ./new.yaml --compare-with ./old.yaml`
- **THEN** `./hooks.cjs` загружается для semantic diff hooks

---

### Requirement: analyze-diff принимает CLI-флаг --strict-plugin-mode
Команда `analyze-diff` MUST предоставлять флаг `--strict-plugin-mode`. При включении ошибки выполнения plugin hooks MUST прерывать run.

#### Scenario: Strict mode в analyze-diff
- **WHEN** установлен `--strict-plugin-mode` и hook бросает исключение
- **THEN** analyze-diff завершается с ошибкой

---

### Requirement: analyze-diff разрешает объединённые пути плагинов
`resolvePluginPaths(openapiConfig, cliPlugins)` MUST сливать записи плагинов из конфига с путями CLI (сначала конфиг, dedupe по path) и возвращать загружаемые строки путей.

#### Scenario: Только плагины из конфига
- **WHEN** openapi-конфиг содержит plugins, а CLI не передаёт `--plugins`
- **THEN** загружаются плагины из конфига

#### Scenario: Конфиг и CLI объединены
- **WHEN** конфиг содержит `./a.cjs`, а CLI передаёт `./b.cjs`
- **THEN** оба пути загружаются в порядке config-first

---

### Requirement: analyzeDiffOptionsSchema валидирует CLI-поля плагинов
`analyzeDiffOptionsSchema` MUST принимать опциональные `plugins: string[]` и `strictPluginMode: boolean`.

#### Scenario: Схема принимает plugins
- **WHEN** опции содержат `plugins: ['./hooks.cjs']`
- **THEN** Zod-валидация проходит успешно
