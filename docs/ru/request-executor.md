# RequestExecutor — хаб HTTP-слоя

> **Каноническое руководство** по настройке и использованию HTTP в сгенерированных клиентах (2.0.0+).
> При миграции с 1.x начните с [дерева решений](#быстрое-дерево-решений) или [руководства по миграции](migration.md).

## TL;DR — 30 секунд

**По умолчанию (без custom HTTP):** сгенерируйте клиент, затем:

```typescript
import { createClient } from './generated';

const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
});

await client.pets.getPets();
```

Больше ничего не нужно — `createClient` собирает executor с interceptors.

**Custom HTTP:** ответьте на два вопроса:

1. Есть ли у вас custom `request.ts` или нестандартный transport?
2. Нужны ky, опции на запрос, auth без перегенерации или моки?

→ Используйте [дерево решений](#быстрое-дерево-решений) и [таблицу сценариев](#выбор-сценария-m0m12) ниже.

---

## Глоссарий

| Термин | Что это | Где живёт |
|--------|---------|-----------|
| **Transport** | Низкоуровневые функции `request` / `requestRaw` с `ApiRequestOptions` | Сгенерированный `core/request.ts` (или ваш файл, скопированный туда) |
| **Adapter** | Мост `RequestConfig` → transport; фабрика `createExecutorAdapter` | `core/executor/createExecutorAdapter.ts` |
| **Executor** | Контракт `RequestExecutor` с `request()` / `requestRaw()` и `RequestConfig` | `core/executor/requestExecutor.ts` |
| **Service** | Сгенерированный API-класс; вызывает executor, не transport | `services/*.ts` |

**Два разных «request»:**

| Имя | Значение |
|-----|----------|
| Ключ конфига `"request"` | Путь к модулю **transport**; копируется в `core/request.ts` при codegen |
| Метод `executor.request()` | Возвращает **тело ответа** при успехе |

**Ключи конфига — когда что использовать:**

| Ключ | Слой | Когда |
|------|------|-------|
| `httpClient` | Шаблон transport | fetch / xhr / axios / node (по умолчанию: fetch) |
| `"request"` | Custom transport | Сохранить существующий `request.ts` с канонической сигнатурой |
| `customExecutorPath` | Custom adapter | ky, `mapOptions`, обход дефолтного маппинга |
| `executorFactory` (runtime) | Полная замена executor | gRPC, mock bus, legacy adapter — **без regen** |

---

## Четырёхслойный стек

```
Service.method() / methodRaw()
  → RequestExecutor.request / requestRaw       (контракт: RequestConfig)
    → createExecutorAdapter                    (мост: RequestConfig → ApiRequestOptions)
      → core/request.ts request / requestRaw   (transport: fetch|xhr|axios|node|custom)
```

| Слой | Вход | Выход `request` | Выход `requestRaw` |
|------|------|-----------------|-------------------|
| Transport | `ApiRequestOptions`, `TOpenAPIConfig` | `Promise<T>` | `Promise<ApiResult<T>>` |
| Adapter | `RequestConfig`, `TOptions?` | делегирует | делегирует |
| Executor | `RequestConfig`, `TOptions?` | `Promise<T>` | `Promise<ApiResult<T>>` |
| Service | через executor | `getPets()` | `getPetsRaw()` |

**Диагностика:** несовместимость transport ≠ несовместимость RequestExecutor. Если старый `request()` имеет другую сигнатуру — исправляйте на **уровне transport** (shim или переписать). `createLegacyRequestAdapter` всё равно вызывает `request` из `core/request.ts` — неканоническую сигнатуру он не обойдёт.

---

## Быстрое дерево решений

```
Что нужно?
├─ Стандартный клиент, без custom HTTP
│    → generate --httpClient fetch + createClient({ openApi })
├─ Сохранить старый custom request() transport
│    → config "request": "./path/to/request.ts" (см. M2)
├─ Custom adapter (ky, mapOptions)
│    → config "customExecutorPath" (см. M7)
├─ Auth / logging / retry без regen
│    → createClient({ interceptors }) или executorFactory wrap (см. M6)
├─ Типизированные опции на запрос
│    → customExecutorPath + mapOptions (см. M7)
├─ Mock API в тестах
│    → new Service(mockExecutor) (см. M9)
├─ Нужны status / url / headers при успехе
│    → service.methodRaw(), не method()
└─ Проверить конфиг перед regen
     → check-config → preview-changes → generate
```

### Ветка custom request / executor (M2–M5)

```
Есть custom request или executor?
├─ Нет → M0: generate + createClient
└─ Да → Transport принимает (ApiRequestOptions, TOpenAPIConfig)?
         ├─ Нет → M3 или M4: shim в request.ts ИЛИ customExecutorPath / executorFactory
         └─ Да → Есть requestRaw с ApiResult?
                  ├─ Да → M2: "request" в конфиге, regen
                  ├─ Нет, добавлю → M2: добавить requestRaw (см. test/custom/request.ts)
                  └─ Нет, не буду → M2b: createLegacyRequestAdapter (только dev, status 200)
```

---

## Выбор сценария (M0–M12)

Две оси несовместимости — проверьте перед рекомендацией `customExecutorPath`:

| Ось | Вопрос | Совместимо значит |
|-----|--------|-------------------|
| **Input** | Transport принимает `(ApiRequestOptions, TOpenAPIConfig)`? | Дефолтный adapter работает без shim |
| **Output Raw** | `requestRaw` возвращает `ApiResult<T>`? | `getXxxRaw()` отдаёт реальный status/url |

| ID | Ситуация | Ключи конфига | Runtime | Codegen | Runtime |
|----|----------|---------------|---------|---------|---------|
| **M0** | Новый проект | только `httpClient` | `createClient({ openApi })` | A | R1 |
| **M1** | App вызывал `request()` напрямую | regen | `createClient()` вместо прямых вызовов | A | R1 |
| **M2** | Custom transport, совместимый input, нет `requestRaw` | `"request": "./path"` | `createClient({ openApi })` | C | R1 |
| **M2b** | Не буду добавлять `requestRaw` | `"request": "./path"` | `executorFactory` → `createLegacyRequestAdapter` | C | R5 |
| **M3** | Несовместимый input (axios config, url+opts) | `"request"` или shim | shim или `customExecutorPath` | C/D | R1/R4 |
| **M4** | Несовместимый input + raw output | `customExecutorPath` | mappers или `executorFactory` | D | R4 |
| **M5** | Совместимый input, raw не `ApiResult` | `"request"` или `customExecutorPath` | исправить `requestRaw` в transport | C/D | R1 |
| **M6** | Auth, logging, retry без regen | — | `createClient({ interceptors })` | A/C | R2 |
| **M7** | Опции на запрос (`TOptions`) | `customExecutorPath` | `createClient` + `mapOptions` | D/E | R1 |
| **M8** | Не HTTP (gRPC, GraphQL, mock bus) | `customExecutorPath` | `executorFactory` или inject | D | R4 |
| **M9** | Тесты / один сервис | — | `new FooService(mockExecutor)` | — | inject |
| **M10** | CancelablePromise | `useCancelableRequest: true` | проверить cancel в transport | F | R1 |
| **M11** | Нестандартные ошибки | — | `onError` + `RequestRecovery`; transport бросает `{ status, body }` | * | R2 |
| **M12** | Monorepo, общий transport | один `"request"`, несколько output | `openApi.BASE` по окружениям | C | R1 |

**Path A vs B:** выбирайте **A** (shim/adapter), если переиспользуется ≥80% старой логики transport; **B** (custom executor), если обёртка сложнее переписывания или transport не HTTP.

Примеры JSON: [config-recipes.md](config-recipes.md).

---

## Матрица codegen (A–F)

| # | `httpClient` | `request` | `customExecutorPath` | `useCancelableRequest` | Результат |
|---|--------------|-----------|----------------------|------------------------|-----------|
| A | fetch (default) | — | — | false | Дефолтный transport + adapter |
| B | xhr / axios / node | — | — | * | Тот же стек, другой шаблон transport |
| C | any | `./custom/request.ts` | — | * | Transport → `core/request.ts`; дефолтный adapter |
| D | any | — | `./custom/createExecutorAdapter.ts` | * | Adapter скопирован; transport может не использоваться (ky) |
| E | any | `./custom/request.ts` | `./custom/adapter.ts` | * | Оба скопированы; типично для `mapOptions` |
| F | any | * | * | true | Все методы возвращают `CancelablePromise` |

| Поле | CLI flag | Примечание |
|------|----------|------------|
| `httpClient` | `--httpClient` | `fetch` \| `xhr` \| `axios` \| `node` |
| `request` | `--request` | Custom **transport** → `core/request.ts` |
| `customExecutorPath` | `--customExecutorPath` | Модуль с **`createExecutorAdapter`** |
| `useCancelableRequest` | `--useCancelableRequest` | `ExecutorReturn<T>` = `CancelablePromise<T>` |

**Важно:** `request` = transport; `customExecutorPath` = фабрика adapter. Комбинируются (вариант E).

**Codegen D ≠ Runtime R4:** `customExecutorPath` (D) меняет adapter при **codegen** — runtime остаётся R1. Пример: ky через `example/executor.ts` → **D + R1**. Runtime R4 — `executorFactory` в `createClient` — полная замена executor **без regen**.

```bash
openapi-codegen-cli generate -i ./spec.yaml -o ./src/api --httpClient fetch
openapi-codegen-cli check-config -ocn openapi.config.json
openapi-codegen-cli preview-changes -ocn openapi.config.json
openapi-codegen-cli generate -ocn openapi.config.json
```

---

## Матрица runtime (R1–R5)

| # | `openApi` | `interceptors` | `executorFactory` | Поведение |
|---|-----------|----------------|-------------------|-----------|
| R1 | BASE, TOKEN… | — | — | Дефолтный executor + всегда `withInterceptors` + `apiErrorInterceptor` |
| R2 | * | onRequest / onResponse / onError | — | Цепочки interceptors |
| R3 | * | — | wrap default | Logging, retry, tracing без regen |
| R4 | * | * | replace → custom | Полная замена executor (gRPC, mock bus) |
| R5 | * | * | → `createLegacyRequestAdapter` | Мягкая миграция без `requestRaw` в transport |

```typescript
const client = createClient({
  openApi?: Partial<TOpenAPIConfig>,
  interceptors?: { onRequest?, onResponse?, onError? },
  executorFactory?: ({ openApiConfig, createDefaultExecutor }) => RequestExecutor,
});
```

**Breaking (2.1.0-beta.10):** `createClient` **всегда** оборачивает executor в `withInterceptors` — даже без custom interceptors. `apiErrorInterceptor` **всегда** первый в `onError`.

Сервисы: `getXxx()` → body; `getXxxRaw()` → `ApiResult<T>`.

---

## Готовые рецепты

### M0 — Дефолтный клиент

**Конфиг:**

```json
{
  "input": "./spec.yaml",
  "output": "./generated",
  "httpClient": "fetch"
}
```

**Runtime:**

```typescript
import { createClient } from './generated';

const client = createClient({
  openApi: { BASE: process.env.API_URL ?? 'https://api.example.com' },
});

await client.users.getUser({ userId: '1' });
```

### M2 — Сохранить custom transport

**Конфиг:**

```json
{
  "input": "./spec.yaml",
  "output": "./generated",
  "httpClient": "fetch",
  "request": "./src/api/custom/request.ts"
}
```

Transport должен экспортировать `request` и желательно `requestRaw` с сигнатурой `(options: ApiRequestOptions, config: TOpenAPIConfig)`. См. `test/custom/request.ts`.

После regen — `createClient({ openApi })` как в M0.

### M2b — Legacy transport без `requestRaw`

> **Предупреждение:** `requestRaw` всегда синтезирует `ok: true, status: 200`. Только dev/prototype — не для production.

**Конфиг:** как M2 (`"request": "./path"`).

**Runtime:**

```typescript
import { createClient, createLegacyRequestAdapter } from './generated';

const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  executorFactory: ({ openApiConfig }) => createLegacyRequestAdapter(openApiConfig),
});
```

Для production лучше добавить `requestRaw` в transport (M2).

### M6 — Auth без regen

```typescript
const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  interceptors: {
    onRequest: [
      (config) => ({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    ],
  },
});
```

### M7 — Custom adapter (ky + mapOptions)

**Конфиг:**

```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./example/executor.ts",
  "items": [{ "input": "./spec.yaml", "output": "./generated" }]
}
```

Экспорт должен называться `createExecutorAdapter`. Полный пример: `example/executor.ts`.

**Runtime:** `createClient({ openApi })` — adapter подключается при codegen.

### M9 — Mock executor в тестах

```typescript
import { PetsService } from './generated/services/PetsService';
import type { RequestExecutor, RequestConfig } from './generated/core/executor/requestExecutor';

const mockExecutor: RequestExecutor = {
  async request<T>(_config: RequestConfig): Promise<T> {
    return { id: 1, name: 'Fluffy' } as T;
  },
  async requestRaw<T>(config: RequestConfig) {
    const body = await this.request<T>(config);
    return { url: 'http://test', ok: true, status: 200, statusText: 'OK', body };
  },
};

const pets = new PetsService(mockExecutor);
```

---

## method() vs methodRaw() vs ApiError

| Уровень | `request` | `requestRaw` |
|---------|-----------|--------------|
| Transport | body `Promise<T>` | `Promise<ApiResult<T>>` |
| Executor | `ExecutorReturn<T>` | `ExecutorReturn<ApiResult<T>>` |
| Service | `getPets()` | `getPetsRaw()` |

- **`method()`** — типизированное тело при **успешном** ответе (большинство вызовов).
- **`methodRaw()`** — `status` / `ok` / `url` при **успешном** ответе (2xx, включая 204).

**HTTP-ошибки (4xx/5xx):** на дефолтном fetch transport и `request`, и `requestRaw` бросают **`ApiError`** — вызывающий не получает `ApiResult` с `ok: false`. Custom adapters (ky с `throwHttpErrors: false` в `example/executor.ts`) могут возвращать ошибку без throw.

**Форма ApiError (2.1.0-beta.10):** компактный `request`; payload ответа в `error.body`.

**Interceptors:** `onResponse` для `method()` получает **body**; для `methodRaw()` — **ApiResult**.

**Восстановление в `onError`:** `return new RequestRecovery<T>(value)` — не голый `return`.

---

## init --requestFormat

Scaffold custom HTTP при `openapi-codegen-cli init --request ./path`:

| Значение | Создаёт | В конфиге |
|----------|---------|-----------|
| `transport` (default) | Legacy `request` + `requestRaw` | `"request"` |
| `adapter` | модуль `createExecutorAdapter` | `"customExecutorPath"` |
| `executor` | автономный `RequestExecutor` | для `new Service(executor)` — **не** `customExecutorPath` |

Scaffold `customExecutor` из CLI — для `new Service(customExecutor)`, **не** для ключа `customExecutorPath`.

---

## check-config

Перед каждым regen при custom HTTP:

```bash
openapi-codegen-cli check-config --openapi-config ./openapi.config.json
```

### Предупреждения → действие

| Предупреждение | Значение | Действие |
|----------------|----------|----------|
| `request file not found: ./path` | Файл transport не найден | Исправить путь или создать файл; cwd = корень проекта |
| `customExecutorPath file not found: ./path` | Нет модуля adapter | Исправить путь или `init --requestFormat adapter` |
| `customExecutorPath should export function createExecutorAdapter` | Неверное имя экспорта | Переименовать в `createExecutorAdapter` |
| `items[N]: request file not found` | Неверный путь в `items[N]` | Исправить override в multi-spec конфиге |

Предупреждения **не фатальны** — generate может пройти, но runtime сломается.

Цепочка: `check-config` → исправить → `preview-changes` → `generate`.

---

## FAQ / Troubleshooting

### «Сервисы требуют RequestExecutor в конструкторе»

Сервисы (2.0+) принимают `RequestExecutor`. Используйте **`createClient()`**:

```typescript
const client = createClient({ openApi: { BASE: '...' } });
await client.myService.myMethod();
```

Или вручную: `new MyService(executor)`.

### «Чем отличаются `request` и `customExecutorPath`?»

- **`request`** — custom **transport**, копируется в `core/request.ts`
- **`customExecutorPath`** — фабрика **`createExecutorAdapter`**, копируется в `core/executor/createExecutorAdapter.ts`
- Можно комбинировать (вариант E)

### «`createClient` оборачивает interceptors, которых я не просил»

Ожидаемо с 2.1.0-beta.10: `withInterceptors` + `apiErrorInterceptor` всегда. Custom interceptors идут после дефолтного обработчика ошибок.

### «`customExecutorPath` не найден в runtime»

Файл **копируется при codegen**, не импортируется в runtime. Regen после изменения исходника. В конфиге — **исходный** путь до `generate`.

### «`requestRaw` всегда возвращает status 200»

Вы на **M2b** (`createLegacyRequestAdapter`) или transport без настоящего `requestRaw`. Добавьте `requestRaw` (M2) для production.

### «Откуда импортировать RequestExecutor?»

Из **сгенерированного** клиента (`./generated/core/executor/requestExecutor`) — не из `ts-openapi-codegen` / `openapi-codegen-cli`.

---

## Примеры до/после миграции

### 1.x — прямой вызов `request()`

**Было:**

```typescript
import { request } from './generated/core/request';
import { OpenAPI } from './generated/core/OpenAPI';

const data = await request({ method: 'GET', path: '/pets' }, OpenAPI);
```

**Стало:**

```typescript
import { createClient } from './generated';

const client = createClient({ openApi: { BASE: OpenAPI.BASE } });
const data = await client.pets.getPets();
```

### Custom transport — минимальный diff

1. Оставить transport; сигнатура `(ApiRequestOptions, TOpenAPIConfig)`.
2. Добавить `"request": "./path/to/request.ts"` в конфиг.
3. `openapi-codegen-cli generate -ocn openapi.config.json`
4. Заменить прямые вызовы `request()` на `createClient({ openApi })`.

---

## Связанные документы

- [Быстрый старт](getting-started.md)
- [Рецепты конфигов](config-recipes.md) — recipes 5–9 (HTTP)
- [Миграция](migration.md) — чеклист Path B
- [Справочник конфигурации](configuration-reference.md)
- [Справочник CLI](cli-reference.md)
- [RequestExecutor deep dive](advanced/request-executor-deep-dive.md) — M8, M10, M11

**Cheatsheet для агентов:** [skills/request-executor-openapi-codegen/SKILL.md](../../skills/request-executor-openapi-codegen/SKILL.md)

**English:** [request-executor.md (EN)](../en/request-executor.md)
