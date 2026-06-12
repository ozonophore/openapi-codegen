### Файл конфигурации

Вместо передачи всех опций через CLI, вы можете использовать файл конфигурации. Создайте `openapi.config.json` в корне вашего проекта:

**Формат с одним набором опций:**
```json
{
    "input": "./spec.json",
    "output": "./dist",
    "client": "fetch",
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
    "customExecutorPath": "./custom/createExecutorAdapter.ts",
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
    "client": "fetch",
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

**Формат массива (несколько конфигураций):**
```json
[
    {
        "input": "./first.yml",
        "output": "./dist",
        "client": "xhr"
    },
    {
        "input": "./second.yml",
        "output": "./dist",
        "client": "fetch"
    }
]
```

| Имя | Тип | По умолчанию | Описание |
|-----|-----|--------------|----------|
| `input` | string | - | Путь/URL спецификации OpenAPI (обязательно для items) |
| `output` | string | - | Выходная директория (обязательно) |
| `outputCore` | string | `{output}` | Выходная директория для core файлов |
| `outputServices` | string | `{output}` | Выходная директория для сервисов |
| `outputModels` | string | `{output}` | Выходная директория для моделей |
| `outputSchemas` | string | `{output}` | Выходная директория для схем |
| `client` | string | `fetch` | HTTP клиент: `fetch`, `xhr`, `node`, или `axios` |
| `useOptions` | boolean | `false` | Использовать опции вместо аргументов |
| `useUnionTypes` | boolean | `false` | Использовать union типы вместо enums |
| `excludeCoreServiceFiles` | boolean | `false` | Исключить генерацию core и сервисных файлов |
| `request` | string | - | Путь к пользовательскому файлу запросов |
| `plugins` | string[] | `[]` | Пути к плагинам генератора |
| `customExecutorPath` | string | - | Путь к пользовательскому модулю `createExecutorAdapter` |
| `interfacePrefix` | string | `I` | Префикс для интерфейсов моделей |
| `enumPrefix` | string | `E` | Префикс для enum моделей |
| `typePrefix` | string | `T` | Префикс для type моделей |
| `useCancelableRequest` | boolean | `false` | Использовать отменяемый promise как тип возврата |
| `sortByRequired` | boolean | `false` | Расширенная стратегия сортировки для аргументов |
| `useSeparatedIndexes` | boolean | `false` | Использовать отдельные index файлы |
| `strictOpenapi` | boolean | `false` | Включить строгую диагностику OpenAPI и падать на strict-ошибках |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Путь к JSON-файлу strict-отчета по диагностике OpenAPI |
| `failOnGovernanceErrors` | boolean | `false` | Прерывать генерацию при ошибках governance (требует `strictOpenapi`) |
| `governanceConfig` | string | - | Путь к JSON-файлу правил governance |
| `items` | array | - | Массив конфигураций (для формата multi-options) |
| `validationLibrary` | string | `none` | Библиотека валидации для генерации схем: `none`, `zod`, `joi`, `yup`, или `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Стратегия для пустых схем: `keep`, `semantic`, или `skip` |
| `modelsMode` | string | `interfaces` | Режим генерации моделей: `interfaces` или `classes` |
| `useHistory` | boolean | `false` | Применять diff‑отчёт при генерации |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Путь к diff‑отчёту |
| `models` | object | - | Секция конфигурации моделей (например, `mode`) |
| `analyze` | object | - | Секция анализа (например, reportPath, useHistory, ignore) |
| `miracles` | object | - | Секция чудес (enabled, confidence, types) |
| `cache` | boolean | `false` | Включить кэш генерации |
| `cachePath` | string | `.openapi-codegen-store` | Путь к store (`entity`: файл в output; `reuse`: корень global store) |
| `cacheStrategy` | string | `reuse` (схема V6); `entity` после миграции v5→v6 | Стратегия кэша: `entity`, `reuse` или `content` |
| `reuseOnConflict` | string | `fail` | Политика конфликтов reuse store: `fail` или `namespace` |
| `cacheDebug` | boolean | `false` | Показывать debug-логи cache hit/miss |
| `autoSelect` | object \| boolean | выключен | Проектно-зависимый выбор HTTP-клиента и валидатора (*preview*, только root) |
| `specAnalysis` | object \| boolean | выключен | Анализ качества OpenAPI spec при generate (*preview*; root и per-item) |
| `anomalyDetection` | object \| boolean | - | Устаревший alias для `specAnalysis` |
| `prettierConfigPath` | string | - | Путь к файлу конфигурации Prettier для форматирования сгенерированного кода |
| `tsconfigPath` | string | - | Путь к `tsconfig.json` для пакетного ESLint fix (вместе с `eslintConfigPath`) |
| `eslintConfigPath` | string | - | Путь к конфигу ESLint для пакетного ESLint fix (вместе с `tsconfigPath`) |

**Примечание:** Используйте команду `init` для генерации шаблона конфигурации. Запустите `update-config` для миграции на схему **V6** (добавляет блоки `autoSelect` и `specAnalysis`). См. [Marauder user guide](../MARAUDER_USER_GUIDE.md) для preview-возможностей.

### Плагины

Плагины генератора позволяют переопределять маппинг типов схем (например через `x-typescript-type`) и расширять поведение генерации.

- Ключ конфигурации: `plugins` (массив путей к модулям)
- Поддерживаемые форматы модулей: CJS, ESM и TS (если рантайм поддерживает импорт TS)
- Подробное руководство: [Плагины](plugins.md)
- Plugin API v2 (RFC, хуки `analyze-diff`): [Plugin API v2](plugin-api-v2.md)

