# Справочник конфигурации

Все ключи `openapi.config.json` (schema V6). Готовые паттерны — [config-recipes.md](config-recipes.md).

`openapi-codegen-cli init` — scaffold; `openapi-codegen-cli update-config` — миграция старого файла.

## Single vs multi

**Single:**

```json
{
  "input": "./spec.json",
  "output": "./dist",
  "httpClient": "fetch"
}
```

**Multi:**

```json
{
  "httpClient": "fetch",
  "output": "./dist",
  "items": [
    { "input": "./first.yml" },
    { "input": "./second.yml", "output": "./dist-v2" }
  ]
}
```

Корневые ключи наследуются items, если не переопределены.

## Основные ключи

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `input` | string | — | Путь/URL OpenAPI spec |
| `output` | string | — | Выходная директория |
| `outputCore` | string | `{output}` | Core files |
| `outputServices` | string | `{output}` | Services |
| `outputModels` | string | `{output}` | Models |
| `outputSchemas` | string | `{output}` | Schemas |
| `httpClient` | string | `fetch` | `fetch`, `xhr`, `node`, `axios` |
| `items` | array | — | Multi-spec конфигурации |

## HTTP execution

> **Подробно:** [request-executor.md](request-executor.md)

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `request` | string | — | Путь к custom **transport**; копируется в `core/request.ts` |
| `customExecutorPath` | string | — | Модуль с `createExecutorAdapter`; копируется в `core/executor/createExecutorAdapter.ts` |
| `useCancelableRequest` | boolean | `false` | `CancelablePromise` в методах сервисов |

Проверка: `openapi-codegen-cli check-config`. [Расшифровка warnings](request-executor.md#check-config).

## Стиль генерации

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `useOptions` | boolean | `false` | Object-style параметры |
| `useUnionTypes` | boolean | `false` | Union types вместо enums |
| `excludeCoreServiceFiles` | boolean | `false` | Не генерировать core/services |
| `interfacePrefix` | string | `I` | Префикс интерфейсов |
| `enumPrefix` | string | `E` | Префикс enums |
| `typePrefix` | string | `T` | Префикс type aliases |
| `sortByRequired` | boolean | `false` | Required params первыми |
| `useSeparatedIndexes` | boolean | `false` | Отдельные index files |
| `modelsMode` | string | `interfaces` | `interfaces` или `classes` |

## Validation & schemas

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `validationLibrary` | string | `none` | `none`, `zod`, `joi`, `yup`, `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | `keep`, `semantic`, `skip` |

## Diff report & history

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `useHistory` | boolean | `false` | Применять diff report при generate |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Путь к diff report |
| `analyze` | object | — | `useHistory`, `reportPath`, `ignore` |
| `miracles` | object | — | `enabled`, `confidence`, `types` |

## Strict OpenAPI

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `strictOpenapi` | boolean | `false` | Strict diagnostics |
| `failOnGovernanceErrors` | boolean | `false` | Fail при governance errors |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Strict report path |

## Cache

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `cache` | boolean | `false` | Кэш генерации |
| `cachePath` | string | `.openapi-codegen-store` | Путь store |
| `cacheStrategy` | string | `entity` | `entity`, `reuse`, `content` |
| `reuseOnConflict` | string | `fail` | `fail` или `namespace` |
| `cacheDebug` | boolean | `false` | Debug cache hit/miss |

## Formatting & lint

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `prettierConfigPath` | string | — | Prettier для output |
| `tsconfigPath` | string | — | tsconfig (+ eslintConfigPath) |
| `eslintConfigPath` | string | — | ESLint (+ tsconfigPath) |

## Plugins

| Имя | Тип | Default | Описание |
|-----|-----|---------|----------|
| `plugins` | string[] | `[]` | Пути к plugin modules |

## CLI equivalents

| Config key | CLI flag |
|------------|----------|
| `httpClient` | `--httpClient` / `-c` |
| `request` | `--request` |
| `customExecutorPath` | `--customExecutorPath` |

Полный список: [cli-reference.md](cli-reference.md).

**English:** [configuration-reference.md (EN)](../en/configuration-reference.md)
