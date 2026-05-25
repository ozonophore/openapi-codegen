
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
    "diffReport": "./openapi-diff-report.json",
    "models": {
        "mode": "interfaces"
    },
    "analyze": {
        "useHistory": false,
        "reportPath": "./openapi-diff-report.json"
    },
    "miracles": {
        "enabled": true,
        "confidence": 1,
        "types": ["RENAME", "TYPE_COERCION"]
    },
    "plugins": ["./plugins/custom-type.plugin.cjs"],
    "customExecutorPath": "./custom/createExecutorAdapter.ts"
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
| `reportFile` | string | `./openapi-report.json` | Путь к JSON-файлу strict-отчета по диагностике OpenAPI |
| `items` | array | - | Массив конфигураций (для формата multi-options) |
| `validationLibrary` | string | `none` | Библиотека валидации для генерации схем: `none`, `zod`, `joi`, `yup`, или `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Стратегия для пустых схем: `keep`, `semantic`, или `skip` |
| `modelsMode` | string | `interfaces` | Режим генерации моделей: `interfaces` или `classes` |
| `useHistory` | boolean | `false` | Применять diff‑отчёт при генерации |
| `diffReport` | string | `./openapi-diff-report.json` | Путь к diff‑отчёту |
| `models` | object | - | Секция конфигурации моделей (например, `mode`) |
| `analyze` | object | - | Секция анализа (например, reportPath, useHistory, ignore) |
| `miracles` | object | - | Секция чудес (enabled, confidence, types) |

**Примечание:** Вы можете использовать команду `init` для генерации шаблона файла конфигурации.

### Плагины

Плагины генератора позволяют переопределять маппинг типов схем (например через `x-typescript-type`) и расширять поведение генерации.

- Ключ конфигурации: `plugins` (массив путей к модулям)
- Поддерживаемые форматы модулей: CJS, ESM и TS (если рантайм поддерживает импорт TS)
- Подробная документация: [docs/plugins.md](./docs/plugins.md)

## Примеры
