# Быстрый старт

Сгенерируйте TypeScript-клиент из OpenAPI и вызывайте API через `createClient` — без настройки custom HTTP.

## Требования

- Node.js (минимальная версия — в [package.json](../../package.json))
- Спецификация OpenAPI 2.x или 3.x (JSON или YAML)

## Установка

```bash
npm install ts-openapi-codegen --save-dev
```

CLI-бинарник — **`openapi-codegen-cli`** (также через `npx ts-openapi-codegen`).

## Шаг 1 — Генерация

**Разово:**

```bash
npx openapi-codegen-cli generate \
  --input ./openapi/spec.yaml \
  --output ./src/api \
  --httpClient fetch
```

**С конфигом** (рекомендуется для команд):

```bash
npx openapi-codegen-cli init
# отредактируйте openapi.config.json, затем:
npx openapi-codegen-cli generate --openapi-config ./openapi.config.json
```

Минимальный конфиг:

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch"
}
```

## Шаг 2 — Создание клиента

Сгенерированный код экспортирует `createClient`. Runtime-настройки — через `openApi`:

```typescript
import { createClient } from './src/api';

const client = createClient({
  openApi: {
    BASE: 'https://api.example.com',
    // TOKEN, HEADERS, WITH_CREDENTIALS, …
  },
});

const pets = await client.pets.getPets();
```

`createClient`:

- Собирает дефолтный `RequestExecutor` (fetch + adapter)
- Оборачивает interceptors (включая обработку ошибок)
- Возвращает объект со всеми сервисами

Передавать `RequestExecutor` вручную **не нужно**.

## Шаг 3 — Вызов методов API

| Метод | Возвращает | Когда |
|-------|------------|-------|
| `service.method()` | Тело ответа | Обычные вызовы (2xx) |
| `service.methodRaw()` | `ApiResult<T>` (status, url, body) | Нужны status/headers при успехе |

HTTP-ошибки (4xx/5xx) на дефолтном стеке бросают `ApiError`.

## Custom HTTP?

Custom `request.ts`, ky/axios, auth без regen, предупреждения `check-config`:

→ **[RequestExecutor hub](request-executor.md)** — дерево решений и сценарии M0–M12.

## Дальше

| Цель | Документ |
|------|----------|
| Паттерны конфига | [Рецепты конфигов](config-recipes.md) |
| Все ключи | [Справочник конфигурации](configuration-reference.md) |
| Апгрейд с 1.x | [Миграция](migration.md) |
| Все команды CLI | [Справочник CLI](cli-reference.md) |
| Плагины, кэш, diff | [Возможности](features.md) |

## Проверка конфига

```bash
npx openapi-codegen-cli check-config --openapi-config ./openapi.config.json
npx openapi-codegen-cli preview-changes --openapi-config ./openapi.config.json
```

Расшифровка предупреждений: [RequestExecutor § check-config](request-executor.md#check-config).

**English:** [getting-started.md (EN)](../en/getting-started.md)
