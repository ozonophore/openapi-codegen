## Purpose

CLI flags `--plugins` and `--strict-plugin-mode` for the `generate` command, plugin merging from CLI and config sources, and schema validation for the new fields.

## Requirements

### Requirement: generate принимает CLI-флаг --plugins
Команда `generate` MUST предоставлять флаг `--plugins [paths...]`, принимающий один или несколько путей к модулям плагинов. Разобранные пути MUST передаваться в merge конфига перед генерацией.

#### Scenario: Один путь к плагину через CLI
- **WHEN** пользователь запускает `generate --plugins ./my-plugin.cjs`
- **THEN** `./my-plugin.cjs` загружается вместе с плагинами из конфига

#### Scenario: Несколько путей к плагинам через CLI
- **WHEN** пользователь запускает `generate --plugins ./a.cjs ./b.cjs`
- **THEN** оба плагина загружаются в порядке CLI после плагинов из конфига

---

### Requirement: generate принимает CLI-флаг --strict-plugin-mode
Команда `generate` MUST предоставлять флаг `--strict-plugin-mode`. При включении `Context.resolveSchemaTypeOverride` MUST бросать исключение, если плагин падает; при выключении MUST логировать предупреждение и переходить к следующему плагину.

#### Scenario: Strict mode прерывает генерацию при ошибке плагина
- **WHEN** установлен `--strict-plugin-mode` и плагин падает в `resolveSchemaTypeOverride`
- **THEN** генерация прерывается с ошибкой, содержащей имя плагина

#### Scenario: Soft mode продолжает работу после ошибки плагина
- **WHEN** `--strict-plugin-mode` не установлен и плагин падает в `resolveSchemaTypeOverride`
- **THEN** генерация продолжается, и следующий плагин может вернуть override

---

### Requirement: CLI-плагины generate сливаются с конфигом
Пути плагинов из CLI MUST сливаться с `plugins` конфига: сначала конфиг, затем dedupe по resolved absolute path. Запись из конфига MUST сохраняться, если тот же путь передан в CLI.

#### Scenario: Пути из конфига и CLI объединены
- **WHEN** конфиг содержит `./from-config.cjs`, а CLI передаёт `./from-cli.cjs`
- **THEN** итоговый список плагинов — `['./from-config.cjs', './from-cli.cjs']`

#### Scenario: Дубликат пути удалён
- **WHEN** конфиг содержит `./a.cjs`, а CLI передаёт `./a.cjs`
- **THEN** `./a.cjs` присутствует один раз (сохраняется запись из конфига)

---

### Requirement: generateOptionsSchema валидирует CLI-поля плагинов
`generateOptionsSchema` MUST принимать опциональные `plugins: string[]` и `strictPluginMode: boolean`.

#### Scenario: Схема принимает массив plugins
- **WHEN** опции содержат `plugins: ['./p.cjs']` и `strictPluginMode: true`
- **THEN** Zod-валидация проходит успешно
