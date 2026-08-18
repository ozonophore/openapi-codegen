## Purpose

Lifecycle openapi.config.json: init, check-config, update-config.

**Related:** `logger-messages-english` (message text policy).

## Requirements

### Requirement: Init scaffold format определяет поле конфига
При init с `--request` формат scaffold (`transport` | `adapter` | `executor`) MUST определять, какое поле попадёт в конфиг: `request`, `customExecutorPath`, или ни одно (executor).

#### Scenario: Transport format
- **WHEN** init с `--request ./req.ts --requestFormat transport`
- **THEN** в конфиг записывается `request: "./req.ts"`, не `customExecutorPath`

#### Scenario: Adapter format
- **WHEN** init с `--request ./adapter.ts --requestFormat adapter`
- **THEN** в конфиг записывается `customExecutorPath: "./adapter.ts"`

#### Scenario: Executor format
- **WHEN** init с `--requestFormat executor`
- **THEN** путь request не попадает ни в request, ни в customExecutorPath конфига

---

### Requirement: Interactive init — взаимоисключающие ветки
В interactive mode пользователю MUST предлагаться либо создание конфига, либо (при отказе) создание custom request — не оба автоматически.

#### Scenario: Отказ от конфига
- **WHEN** пользователь в interactive mode отвечает «нет» на создание конфига
- **THEN** система предлагает создать custom request файл отдельным вопросом

---

### Requirement: Миграция конфига до latest schema version
check-config и update-config MUST прогонять данные через цепочку migration plans до актуальной unified schema version перед валидацией.

#### Scenario: Устаревшая версия схемы
- **WHEN** конфиг на старой версии схемы загружается в check-config
- **THEN** данные мигрируются, `isActualConfigVersion=false`, пользователю предлагается действие обновления

#### Scenario: Array-формат конфига deprecated
- **WHEN** конфиг представлен JSON-массивом items
- **THEN** система MUST предупредить о deprecated формате и считать версию неактуальной (`isActualConfigVersion=false`)

---

### Requirement: Обнаружение default values в конфиге
После миграции check-config MUST сравнить конфиг с версией без значений по умолчанию; при совпадении с дефолтами MUST предложить очистку.

#### Scenario: Конфиг с явными дефолтами
- **WHEN** migrated config содержит поля, равные schema defaults
- **THEN** `hasDefaultValues=true` и пользователю предлагается удалить дефолты

---

### Requirement: Executor setup warnings
check-config MUST выдавать предупреждения при некорректной комбинации executor-related полей (customExecutorPath vs request), не блокируя успешную проверку.

#### Scenario: Конфликт executor paths
- **WHEN** конфиг содержит взаимоисключающие executor настройки
- **THEN** в лог выводятся warnings с префиксом "Executor config:"
