### Файл конфигурации

Вместо передачи всех опций через CLI, вы можете использовать файл конфигурации. Создайте `openapi.config.json` в корне вашего проекта:

---

## Таблица решений

Используйте эту таблицу для поиска нужных вам ключей:

| Я хочу… | Установите эти ключи |
|-----------|----------------|
| Одну спецификацию OpenAPI | `input`, `output`, `httpClient` |
| Несколько спецификаций | `items[]`, `output`, `httpClient` |
| Включить CI gates | `analyze`, `strictOpenapi`, `failOnGovernanceErrors` |
| Пользовательский HTTP клиент | `customExecutorPath` (современно) или `request` (legacy) |
| Кэшировать сгенерированный код | `cache: true`, `cacheStrategy: "entity"` или `"reuse"` |
| Preview: Auto-select | `autoSelect: true`, `specAnalysis` |

---

**Формат с одним набором опций:**
```json
{
    "input": "./spec.json",
    "output": "./dist",
    "httpClient": "fetch",
    "useOptions": false,
    "useUnionTypes": false,
    "excludeCoreServiceFiles": false,
    "interfacePrefix": "I",
    "enumPrefix": "E",
    "typePrefix": "T",
    "useCancelableRequest": false,
    "sortByRequired": false,
    "useSeparatedIndexes": false,
    "request": "./custom-request.ts",
    "customExecutorPath": "./custom/createExecutorAdapter.ts",
    "modelsMode": "interfaces",
    "useHistory": false,
    "diffReport": "./.openapi-codegen-reports/openapi-diff-report.json",
    "models": {
        "mode": "interfaces"
    },
    "analyze": {
        "useHistory": false,
        "reportPath": "./.openapi-codegen-reports/openapi-diff-report.json"
    },
    "miracles": {
        "enabled": true,
        "confidence": 1,
        "types": ["RENAME", "TYPE_COERCION"]
    },
    "plugins": ["./plugins/custom-type.plugin.cjs"],
    "cache": false,
    "cachePath": ".openapi-codegen-store",
    "cacheStrategy": "entity",
    "reuseOnConflict": "fail",
    "cacheDebug": false,
    "failOnGovernanceErrors": false,
    "autoSelect": {
        "enabled": false,
        "strict": false,
        "preferSmallBundles": false,
        "preferStandards": false
    },
    "specAnalysis": {
        "enabled": false,
        "severity": "medium",
        "reportFormat": "json",
        "reportPath": "./.openapi-codegen-reports/anomaly-report.json",
        "failOnHigh": false,
        "crossSpec": true,
        "maxNestingDepth": 5
    },
    "prettierConfigPath": "./.prettierrc",
    "tsconfigPath": "./tsconfig.json",
    "eslintConfigPath": "./eslint.config.mjs"
}
```

**Формат с несколькими наборами опций (с общим блоком):**
```json
{
    "output": "./dist",
    "httpClient": "fetch",
    "excludeCoreServiceFiles": true,
    "items": [
        {
            "input": "./first.yml"
        },
        {
            "input": "./second.yml",
            "output": "./dist-v2"
        }
    ]
}
```

---

### Уровень 1 — Базовые

**Когда использовать:** Минимальная конфигурация для начала работы.

Эти опции нужны в каждом проекте. Задайте их в `openapi.config.json` перед первым запуском `generate`.

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `input` | string | — | Путь/URL спецификации OpenAPI (обязательно для items) |
| `output` | string | — | Выходная директория (обязательно) |
| `httpClient` | string | `fetch` | HTTP клиент: `fetch`, `xhr`, `node`, или `axios` |
| `useOptions` | boolean | `false` | Использовать опции вместо аргументов |
| `useUnionTypes` | boolean | `false` | Использовать union типы вместо enums |

---

### Уровень 2 — Структура вывода

**Когда использовать:** Контроль над местом размещения сгенерированных файлов.

Управляйте тем, куда записываются generated-файлы и какие из них создаются.

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `outputCore` | string | `{output}` | Выходная директория для core файлов |
| `outputServices` | string | `{output}` | Выходная директория для сервисов |
| `outputModels` | string | `{output}` | Выходная директория для моделей |
| `outputSchemas` | string | `{output}` | Выходная директория для схем |
| `excludeCoreServiceFiles` | boolean | `false` | Исключить генерацию core и сервисных файлов |
| `useSeparatedIndexes` | boolean | `false` | Использовать отдельные index-файлы для core, models, schemas и services |
| `items` | array | — | Массив конфигураций (для формата multi-options) |

---

### Уровень 3 — Стиль кода

**Когда использовать:** Соглашения об именовании и форматировании сгенерированного кода.

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `interfacePrefix` | string | `I` | Префикс для интерфейсов моделей |
| `enumPrefix` | string | `E` | Префикс для enum моделей |
| `typePrefix` | string | `T` | Префикс для type моделей |
| `modelsMode` | string | `interfaces` | Режим генерации моделей: `interfaces` или `classes` |
| `validationLibrary` | string | `none` | Библиотека валидации: `none`, `zod`, `joi`, `yup`, или `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Стратегия для пустых схем: `keep`, `semantic`, или `skip` |
| `useCancelableRequest` | boolean | `false` | Использовать отменяемый promise как тип возврата |
| `sortByRequired` | boolean | `false` | Расширенная стратегия сортировки для аргументов |
| `prettierConfigPath` | string | — | Путь к файлу конфигурации Prettier для форматирования сгенерированного кода |
| `tsconfigPath` | string | — | Путь к `tsconfig.json` для пакетного ESLint fix (вместе с `eslintConfigPath`) |
| `eslintConfigPath` | string | — | Путь к конфигу ESLint для пакетного ESLint fix (вместе с `tsconfigPath`) |

---

### Уровень 4 — Diff и governance

**Когда использовать:** Опции для CI quality gates, валидации спеки и отслеживания breaking changes.

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `strictOpenapi` | boolean | `false` | Включить строгую диагностику OpenAPI и падать на strict-ошибках |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Путь к JSON-файлу strict-отчёта диагностики OpenAPI |
| `failOnGovernanceErrors` | boolean | `false` | Прерывать генерацию при ошибках governance (требует `strictOpenapi`) |
| `governanceConfig` | string | — | Путь к JSON-файлу правил governance |
| `useHistory` | boolean | `false` | Применять diff-отчёт при генерации |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Путь к diff-отчёту |
| `analyze` | object | — | Секция анализа (reportPath, useHistory, ignore) |
| `miracles` | object | — | Секция чудес (enabled, confidence, types) |
| `plugins` | string[] | `[]` | Пути к плагинам генератора |

---

### Уровень 5 — Кэш / Reuse

**Когда использовать:** Стратегии инкрементальной генерации. Используйте `entity` для одной спеки, `reuse` — для multi-spec monorepo.

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `cache` | boolean | `false` | Включить кэш генерации |
| `cachePath` | string | `.openapi-codegen-store` | Путь к store (`entity`: файл в output; `reuse`: корень global store) |
| `cacheStrategy` | string | `reuse` (схема V6); `entity` после миграции конфигурации | Стратегия кэша: `entity`, `reuse` или `content` |
| `reuseOnConflict` | string | `fail` | Политика конфликтов reuse store: `fail` или `namespace` |
| `cacheDebug` | boolean | `false` | Показывать debug-логи cache hit/miss |

---

### Уровень 6 — Preview (Marauder)

**Когда использовать:** Opt-in возможности для расширенных workflow-ов.

Opt-in возможности, добавленные в актуальную схему конфигурации. Запустите `update-config` для добавления этих блоков. Подробности — в разделе [Marauder preview features](features.md#marauder-preview-features).

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `autoSelect` | object \| boolean | выключен | Проектно-зависимый выбор HTTP-клиента и валидатора (*preview*, только root) |
| `specAnalysis` | object \| boolean | выключен | Анализ качества OpenAPI spec при generate (*preview*; root и per-item) |
| `anomalyDetection` | object \| boolean | — | Устаревший alias для `specAnalysis` |

---

### HTTP transport options

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `request` | string | — | Путь к пользовательскому файлу запросов (legacy) |
| `customExecutorPath` | string | — | Путь к пользовательскому модулю `createExecutorAdapter` (современно) |
| `models` | object | — | Секция конфигурации моделей (например, `mode`) |

**Примечание:** `request` (legacy) и `customExecutorPath` (современно) — взаимоисключающие альтернативы. Используйте `customExecutorPath` для новых проектов.

---

**Примечание:** Используйте команду `init` для генерации шаблона конфигурации. Запустите `update-config` для миграции на актуальную схему (добавляет блоки `autoSelect` и `specAnalysis`).

### Плагины

Плагины генератора позволяют переопределять маппинг типов схем (например через `x-typescript-type`) и расширять поведение генерации.

- Ключ конфигурации: `plugins` (массив путей к модулям)
- Поддерживаемые форматы модулей: CJS, ESM и TS (если рантайм поддерживает импорт TS)
- Подробное руководство: [Плагины](features.md#plugin-system)
- Plugin API v2 (RFC, хуки `analyze-diff`): [Plugin API v2](features.md#plugin-api-v2-rfc)
