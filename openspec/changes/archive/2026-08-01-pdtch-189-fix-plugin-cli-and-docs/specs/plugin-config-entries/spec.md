## ADDED Requirements

### Requirement: plugins в конфиге принимают строку или объект
Versioned config schema MUST принимать `plugins` как массив строк-путей или объектов `{ path: string, name?: string, config?: Record<string, unknown> }`.

#### Scenario: Строковая запись
- **WHEN** конфиг содержит `plugins: ['./my-plugin.cjs']`
- **THEN** валидация проходит успешно

#### Scenario: Объектная запись с config
- **WHEN** конфиг содержит `plugins: [{ path: './p.cjs', name: 'my-plugin', config: { mode: 'strict' } }]`
- **THEN** валидация проходит успешно

---

### Requirement: Опция конфига disableBuiltinPlugins
Конфиг MUST поддерживать опциональный boolean `disableBuiltinPlugins` на root и в каждом `items[]`. При `true` builtin-плагины (например, `x-typescript-type`) MUST NOT добавляться после пользовательских плагинов.

#### Scenario: Builtin-плагины отключены
- **WHEN** `disableBuiltinPlugins: true` и пользовательских плагинов нет
- **THEN** `loadGeneratorPlugins` возвращает пустой массив

#### Scenario: Builtin-плагины включены по умолчанию
- **WHEN** `disableBuiltinPlugins` не указан
- **THEN** builtin-плагины добавляются после пользовательских

---

### Requirement: Опция конфига strictPluginMode
Конфиг MUST поддерживать опциональный boolean `strictPluginMode` на root и в каждом `items[]`, с merge CLI override при generate.

#### Scenario: Strict mode на уровне item
- **WHEN** item устанавливает `strictPluginMode: true`
- **THEN** генерация этого item использует strict-поведение plugin override

---

### Requirement: Хелпер mergePluginPaths
Core MUST экспортировать `mergePluginPaths(configEntries?, cliPaths?)`, возвращающий нормализованные записи с dedupe по resolved path.

#### Scenario: Публичный экспорт доступен
- **WHEN** потребитель импортирует из package core/plugins
- **THEN** доступны `mergePluginPaths`, `extractPluginPaths` и `normalizePluginEntry`

---

### Requirement: check-config проверяет существование файлов плагинов
`check-config` MUST выдавать предупреждение (не ошибку), если настроенный путь к плагину отсутствует на диске — для root и per-item `plugins`.

#### Scenario: Отсутствующий файл плагина
- **WHEN** конфиг содержит `./missing.cjs`, а файл отсутствует
- **THEN** check-config выводит предупреждение с этим путём
