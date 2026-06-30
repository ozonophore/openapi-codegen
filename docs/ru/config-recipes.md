# Рецепты конфигов

Готовые паттерны для `openapi.config.json`. HTTP-рецепты (5–9) ссылаются на [RequestExecutor hub](request-executor.md).

## HTTP (начните здесь при апгрейде)

| # | Рецепт | Сценарий hub |
|---|--------|--------------|
| 5 | [Дефолтный HTTP](#5-дефолтный-http-fetchaxios) | M0 |
| 6 | [Сохранить custom transport](#6-сохранить-custom-transport) | M2 |
| 6b | [Legacy transport без requestRaw](#6b-legacy-transport-без-requestraw) | M2b |
| 7 | [Custom adapter](#7-custom-adapter) | M7 |
| 7b | [Несовместимая сигнатура transport](#7b-несовместимая-сигнатура-transport) | M3/M4 |
| 8 | [Auth/logging без regen](#8-authlogging-без-regen) | M6 |
| 9 | [Mock в тестах](#9-mock-в-тестах) | M9 |

---

## 5. Дефолтный HTTP (fetch/axios)

**Когда:** новый проект, без custom HTTP.

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch"
}
```

Runtime: [M0 в request-executor.md](request-executor.md#m0--дефолтный-клиент).

---

## 6. Сохранить custom transport

**Когда:** есть `request.ts` с сигнатурой `(ApiRequestOptions, TOpenAPIConfig)`.

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch",
  "request": "./src/api/custom/request.ts"
}
```

Добавьте `requestRaw` → `ApiResult<T>` для production `methodRaw()`. См. [M2](request-executor.md#m2--сохранить-custom-transport).

---

## 6b. Legacy transport без requestRaw

**Когда:** временная dev-миграция; только `request()`, без `requestRaw`.

Конфиг как в рецепте 6. Runtime: `createLegacyRequestAdapter` — [M2b](request-executor.md#m2b--legacy-transport-без-requestraw). **Не для production.**

---

## 7. Custom adapter

**Когда:** ky, custom errors, `mapOptions`.

```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./src/api/custom/createExecutorAdapter.ts",
  "items": [{ "input": "./openapi/spec.yaml", "output": "./src/api" }]
}
```

Экспорт: `function createExecutorAdapter`. Пример: [example/executor.ts](../../example/executor.ts).

---

## 7b. Несовместимая сигнатура transport

**Когда:** старый transport с `(url, options)` или axios-config.

**Вариант A — shim** (оставить `"request"`):

```json
{
  "request": "./src/api/custom/request.ts",
  "httpClient": "fetch",
  "input": "./openapi/spec.yaml",
  "output": "./src/api"
}
```

**Вариант B — custom adapter** (рецепт 7). См. [M3/M4](request-executor.md#выбор-сценария-m0m12).

---

## 8. Auth/logging без regen

Без специальных ключей конфига. `createClient({ interceptors })` — [M6](request-executor.md#m6--auth-без-regen).

---

## 9. Mock в тестах

Без изменений конфига. Inject mock `RequestExecutor` — [M9](request-executor.md#m9--mock-executor-в-тестах).

---

## Прочие рецепты

### 1. Одна spec, validation schemas (Zod)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch",
  "validationLibrary": "zod",
  "emptySchemaStrategy": "keep"
}
```

### 2. Multi-spec monorepo

```json
{
  "httpClient": "fetch",
  "items": [
    { "input": "./openapi/users.yaml", "output": "./packages/users-api" },
    { "input": "./openapi/orders.yaml", "output": "./packages/orders-api" }
  ]
}
```

Общий transport (M12): корневой `"request": "./shared/request.ts"`.

### 3. History-aware generation

```json
{
  "input": "./openapi/current.yaml",
  "output": "./src/api",
  "useHistory": true,
  "diffReport": "./.openapi-codegen-reports/openapi-diff-report.json"
}
```

### 4. Models as classes

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "modelsMode": "classes"
}
```

### 10. Кэш генерации

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "cache": true,
  "cacheStrategy": "entity"
}
```

### 11. Prettier + ESLint после generate

```json
{
  "prettierConfigPath": "./.prettierrc",
  "tsconfigPath": "./tsconfig.json",
  "eslintConfigPath": "./eslint.config.mjs"
}
```

### 12. Plugins

```json
{
  "plugins": ["./plugins/custom-type.plugin.cjs"]
}
```

См. [plugins.md](plugins.md).

---

## Связанные документы

- [Справочник конфигурации](configuration-reference.md)
- [RequestExecutor hub](request-executor.md)
- [Быстрый старт](getting-started.md)

**English:** [config-recipes.md (EN)](../en/config-recipes.md)
