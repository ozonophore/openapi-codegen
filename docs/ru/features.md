## Возможности

### HTTP Клиенты

Генератор поддерживает несколько HTTP клиентов:
- **fetch** (по умолчанию) - Browser Fetch API
- **xhr** - XMLHttpRequest
- **node** - Node.js совместимый клиент, использующий `node-fetch`
- **axios** - Axios HTTP клиент

Выберите клиент используя опцию `--httpClient` или свойство `httpClient` в файле конфигурации.

### Кэш генерации `--cache`

Кэш генерации **включается явно** (по умолчанию выключен). Включите через `--cache` или `"cache": true` в файле конфигурации.

**Опции:**

- `cache` (по умолчанию: `false`)
- `cachePath` (по умолчанию: `.openapi-codegen-store`)
- `cacheStrategy` — `entity`, `reuse` или `content` (дефолт актуальной схемы: `reuse`; миграция конфигурации ставит `entity` для существующих конфигов)
- `reuseOnConflict` (по умолчанию: `fail`) — при `cacheStrategy: "reuse"`: `fail` прерывает при drift схемы; `namespace` хранит в spec-scoped путях
- `cacheDebug` (по умолчанию: `false`)

**Стратегии:**

- **`entity`** — per-output `.openapi-codegen-cache.json`; при cache hit генерация item пропускается.
- **`reuse`** — глобальный `.openapi-codegen-store` с общими артефактами model/schema, копируемыми в каждый output (preview; требует `modelsMode: "interfaces"` **или** `modelsMode: "classes"` с `models.layout: "per-file"`).
- **`content`** — генерация выполняется; записываются только изменённые файлы через `writeFileIfChanged` (без entity/reuse store).

**Когда какую стратегию выбирать:**

| Сценарий | Рекомендация | Почему |
|----------|--------------|--------|
| Одна спека, вход не менялся | `entity` | На cache hit пропускается вся генерация item |
| Monorepo / несколько спек с общими моделями | `reuse` | 2-я и следующие спеки переиспользуют отрендеренные model/schema |
| Без кэша или минимальный overhead | `cache: false` или `content` | Без manifest store; `content` всё равно пропускает неизменённые файлы |
| Честный бенчмарк reuse | `example/openapi.reuse.bench.config.json` | Те же items, что в базовом конфиге + только `cache`/`reuse`; в отличие от `openapi.reuse.config.json`, без Marauder (`autoSelect`, `specAnalysis`) |

Reuse всегда парсит спеку и генерирует core/services; не пропускает генерацию как entity cache. Warm reuse выигрывает при доминировании shared schemas (multi-item). Cold reuse может быть медленнее no-cache при заполнении store.

Для регрессионных perf-проверок см. `test/reusePerformance.test.ts`. Включите `cacheDebug: true`, чтобы в `{cachePath}/reports/latest.json` попали тайминги фаз manifest.

Reuse store использует MD5 для fingerprint (`manifest.json` version 2). При апгрейде с version 1 существующий store инвалидируется на следующем `generate` (артеfacts пересоздаются; orphans удаляет GC).

При включённых `cache` или `specAnalysis` unified-отчёт генерации пишется в `{output}/reports/latest.json` (или `<cachePath>/reports/latest.json` в режиме reuse).

### Marauder preview

Opt-in возможности во время `generate` (актуальная схема конфигурации):

- **`--auto-select` / `autoSelect`** — анализирует целевой проект и рекомендует `httpClient` и `validationLibrary`.
- **`--spec-analysis` / `specAnalysis`** — per-spec и cross-spec детекторы качества OpenAPI; пишет отчёт в `reportPath` (по умолчанию: `./.openapi-codegen-reports/anomaly-report.json`). `--anomaly-detection` — устаревший alias.
- **`--workspace-report` / `workspaceReport`** — multi-spec сводка workspace (JSON и/или Markdown).
- **`--traffic-splitter` / `trafficSplitter`** — генерирует автономный helper `TrafficSplitter.ts` (без live traffic).
- **`--swarm` / `swarm`** — пишет только Avatar Swarm **манифест** (top-level команды `swarm` / `heal` / `migrate` по-прежнему удалены).
- **`--pre-analyze` / `preAnalyze`** — cross-spec сводка shared-моделей / конфликтов в stdout до записи файлов.
- **`--reuse-mode` / `reuseMode`** — `copy` (по умолчанию) или `auto-group` общих моделей **и совместимого client core** в `{LCA}/__shared__/`.
- Dot-notation CLI: `--auto-select.strict`, `--spec-analysis.fail-on-high`, `--workspace-report.format`, `--traffic-splitter.strategy`, `--swarm.output`, inline JSON.

Подробнее — в разделе [Marauder preview features](#marauder-preview-features) ниже и в [Руководстве по миграции](../../MIGRATION.RU.md) (§10).

### Стиль аргументов vs. Стиль объектов `--useOptions`
В JavaScript или TypeScript нет [именованных параметров](https://en.wikipedia.org/wiki/Named_parameter), поэтому
мы предлагаем флаг `--useOptions` для генерации кода в двух разных стилях.

**Стиль аргументов:**
```typescript
function createUser(name: string, password: string, type?: string, address?: string) {
    // ...
}

// Использование
createUser('Jack', '123456', undefined, 'NY US');
```

**Стиль объектов:**
```typescript
function createUser({ name, password, type, address }: {
    name: string,
    password: string,
    type?: string
    address?: string
}) {
    // ...
}

// Использование
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```

### Enums vs. Union Types `--useUnionTypes`
Спецификация OpenAPI позволяет определять [enums](https://swagger.io/docs/specification/data-models/enums/) внутри
модели данных. По умолчанию мы конвертируем эти определения enums в [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html).
Однако эти enums объединяются внутри namespace модели, что не поддерживается Babel, [см. документацию](https://babeljs.io/docs/en/babel-plugin-transform-typescript#impartial-namespace-support).
Поскольку мы также хотим поддерживать проекты, использующие Babel [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript),
мы предлагаем флаг `--useUnionTypes` для генерации [union типов](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)
вместо традиционных enums. Разницу можно увидеть ниже:

**Enums:**
```typescript
// Модель
export interface Order {
    id?: number;
    quantity?: number;
    status?: Order.status;
}

export namespace Order {
    export enum status {
        PLACED = 'placed',
        APPROVED = 'approved',
        DELIVERED = 'delivered',
    }
}

// Использование
const order: Order = {
    id: 1,
    quantity: 40,
    status: Order.status.PLACED
}
```

**Union Types:**
```typescript
// Модель
export interface Order {
    id?: number;
    quantity?: number;
    status?: 'placed' | 'approved' | 'delivered';
}

// Использование
const order: Order = {
    id: 1,
    quantity: 40,
    status: 'placed'
}
```

### Схемы проверки `--validationLibrary`
По умолчанию генератор OpenAPI экспортирует только интерфейсы для ваших моделей. Эти интерфейсы помогут вам во время
разработки, но не будут доступны в JavaScript во время выполнения. Однако OpenAPI позволяет определять свойства,
которые могут быть полезны во время выполнения, например: `maxLength` строки или `pattern` для сопоставления и т.д.

Параметр `--validationLibrary` позволяет генерировать схемы валидации времени выполнения с использованием популярных библиотек валидации:
- **none** (по умолчанию) - Схемы валидации не генерируются
- **zod** - Генерация схем валидации Zod
- **joi** - Генерация схем валидации Joi
- **yup** - Генерация схем валидации Yup
- **jsonschema** - Генерация схем валидации JSON Schema

Если включен `--useHistory` и в diff‑отчёте есть смена типа, валидаторы будут пытаться выполнять коэрсинг:
- **Zod** использует `z.coerce.*`
- **Joi** использует `Joi.alternatives().try(...)`
- **Yup** использует `.transform(...)` (включая string→boolean при `needsCoercion`)
- **JSON Schema (AJV)** включает `coerceTypes`

### Режим моделей `--modelsMode`

По умолчанию модели генерируются как интерфейсы/типы. При `--modelsMode classes` генератор создаёт:
- `*Raw` интерфейсы (JSON‑формат API)
- `*Dto` классы с геттерами, дефолтами, рекурсивными конструкторами и `toJSON()`

**Раскладка (`models.layout` / `--modelsLayout`):**

| Значение | Поведение |
|----------|-----------|
| `bundle` (default) | Все Raw/Dto в одном `models.ts` (совместимо с beta.1+) |
| `per-file` | Один файл на `model.path` с Raw+Dto (+ alias), как у `interfaces` |

Для новых проектов рекомендуется `per-file`. `BaseDto`/`dtoUtils` добавляются в `core`. При `layout: "per-file"` ReuseStore работает и для classes; при `bundle` — entity-cache fallback.

Допустим, у нас есть следующая модель:

```json
{
    "MyModel": {
        "required": [
            "key",
            "name"
        ],
        "type": "object",
        "properties": {
            "key": {
                "maxLength": 64,
                "pattern": "^[a-zA-Z0-9_]*$",
                "type": "string"
            },
            "name": {
                "maxLength": 255,
                "type": "string"
            },
            "enabled": {
                "type": "boolean",
                "readOnly": true
            },
            "modified": {
                "type": "string",
                "format": "date-time",
                "readOnly": true
            }
        }
    }
}
```

**С Zod (`--validationLibrary zod`):**

```ts
import { z } from 'zod';

export const MyModelSchema = z.object({
    key: z.string().max(64).regex(/^[a-zA-Z0-9_]*$/),
    name: z.string().max(255),
    enabled: z.boolean().readonly().optional(),
    modified: z.string().datetime().readonly().optional(),
});

export type MyModel = z.infer<typeof MyModelSchema>;

export function validateMyModel(data: unknown): MyModel {
    return MyModelSchema.parse(data);
}

export function safeValidateMyModel(data: unknown): { success: true; data: MyModel } | { success: false; error: z.ZodError } {
    const result = MyModelSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}
```

**С Joi (`--validationLibrary joi`):**

```ts
import Joi from 'joi';

export const MyModelSchema = Joi.object({
    key: Joi.string().max(64).pattern(/^[a-zA-Z0-9_]*$/).required(),
    name: Joi.string().max(255).required(),
    enabled: Joi.boolean().readonly(),
    modified: Joi.string().isoDate().readonly(),
});
```

**С Yup (`--validationLibrary yup`):**

```ts
import * as yup from 'yup';

export const MyModelSchema = yup.object({
    key: yup.string().max(64).matches(/^[a-zA-Z0-9_]*$/).required(),
    name: yup.string().max(255).required(),
    enabled: yup.boolean().readonly(),
    modified: yup.string().datetime().readonly(),
});
```

**С JSON Schema (`--validationLibrary jsonschema`):**

```ts
export const MyModelSchema = {
    type: 'object',
    required: ['key', 'name'],
    properties: {
        key: {
            type: 'string',
            maxLength: 64,
            pattern: '^[a-zA-Z0-9_]*$',
        },
        name: {
            type: 'string',
            maxLength: 255,
        },
        enabled: {
            type: 'boolean',
            readOnly: true,
        },
        modified: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
        },
    },
};
```

Эти схемы валидации могут быть использованы для генерации форм, валидации ввода и проверки типов во время выполнения в вашем приложении.

### Отменяемый promise `--useCancelableRequest`
По умолчанию генератор OpenAPI генерирует сервисы для доступа к API, которые используют неотменяемые запросы. Поэтому мы добавили возможность переключить генератор на генерацию отменяемых API запросов. Для этого используйте флаг `--useCancelableRequest`.
Пример отменяемого запроса будет выглядеть так:

```typescript
export function request<T>(config: TOpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise(async(resolve, reject, onCancel) => {
        const url = `${config.BASE}${options.path}`.replace('{api-version}', config.VERSION);
        try {
            if (!onCancel.isCancelled) {
                const response = await sendRequest(options, url, config, onCancel);
                const responseBody = await getResponseBody(response);
                const responseHeader = getResponseHeader(response, options.responseHeader);
                const result: ApiResult = {
                    url,
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    body: responseHeader || responseBody,
                };

                catchErrors(options, result);
                resolve(result.body);
            }
        } catch (e) {
            reject(e);
        }
    });
}
```

### RequestExecutor

Начиная с версии **2.0.0**, сгенерированные сервисы используют интерфейс `RequestExecutor`
вместо прямых вызовов core-функции `request`.

`RequestExecutor` — это единая точка интеграции HTTP-логики, отвечающая за выполнение запросов
и расширение поведения клиента. Он позволяет:
- использовать любой транспорт (fetch / axios / xhr / custom);
- централизованно обрабатывать запросы, ответы и ошибки;
- расширять поведение клиента без изменения сгенерированных сервисов.

#### Interceptors

`RequestExecutor` поддерживает **interceptors**, которые позволяют внедрять дополнительную
логику на разных этапах жизненного цикла запроса:

- `onRequest` — модификация запроса перед отправкой (headers, auth, логирование);
- `onResponse` — обработка успешных ответов;
- `onError` — централизованная обработка ошибок.

Interceptors применяются на уровне executor’а и автоматически используются всеми
сгенерированными сервисами.

```ts
import { createClient } from './generated';

const client = createClient({
    interceptors: {
        onRequest: [
            (config) => ({
                ...config,
                headers: {
                    ...config.headers,
                    Authorization: 'Bearer token',
                },
            }),
        ],
        onError: [
            (error) => {
                console.error(error);
                throw error;
            },
        ],
    },
});
```

#### Пользовательская реализация RequestExecutor с interceptors

Пользовательский `RequestExecutor` может быть использован вместе с interceptors.
В этом случае executor отвечает только за транспорт и выполнение запроса,
а interceptors — за расширяемую бизнес-логику (авторизация, логирование, обработка ошибок).

```ts
import type { RequestExecutor, RequestConfig } from './generated/core/executor/requestExecutor';
import type { ApiResult } from './generated/core/ApiResult';
import { OpenAPI } from './generated/core/OpenAPI';
import { withInterceptors } from './generated/core/interceptors/withInterceptors';
import { SimpleService } from './generated/services/SimpleService';

interface MyCustomOptions {
    timeout?: number;
}

const buildUrl = (config: RequestConfig) => `${OpenAPI.BASE}${config.path}`;

const baseExecutor: RequestExecutor<MyCustomOptions> = {
    async request<T>(config: RequestConfig, options?: MyCustomOptions): Promise<T> {
        const response = await fetch(buildUrl(config), {
            method: config.method,
            headers: config.headers,
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: options?.timeout
                ? AbortSignal.timeout(options.timeout)
                : undefined,
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    },
    async requestRaw<T>(config: RequestConfig, options?: MyCustomOptions): Promise<ApiResult<T>> {
        const url = buildUrl(config);
        const response = await fetch(url, {
            method: config.method,
            headers: config.headers,
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        });
        const body = (await response.json()) as T;
        return {
            url,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            body,
        };
    },
};

// Оборачиваем executor interceptors
const executor = withInterceptors(baseExecutor, {
    onRequest: [
        (config) => ({
            ...config,
            headers: {
                ...config.headers,
                Authorization: 'Bearer token',
            },
        }),
    ],
    onError: [
        (error) => {
            console.error(error);
            throw error;
        },
    ],
});

const service = new SimpleService(executor);
await service.getCallWithoutParametersAndResponse({ timeout: 5000 });
```

#### Использование сгенерированного `createClient` с `customExecutorPath` и `executorFactory`

Если в конфигурации генерации задан `customExecutorPath`, в `createClient.ts` будет импортирован ваш
пользовательский `createExecutorAdapter`, и он станет базовым executor по умолчанию.

Дополнительно в runtime можно передать `executorFactory`, чтобы обернуть/расширить этот базовый executor
(retry, tracing, metrics и т.д.) без изменения сгенерированных сервисов.

```ts
import { createClient } from './generated';

const client = createClient({
    executorFactory: ({ openApiConfig, createDefaultExecutor }) => {
        const baseExecutor = createDefaultExecutor();

        return {
            async request<TResponse>(config, options) {
                console.debug('Request to', openApiConfig.BASE, config.path);
                return baseExecutor.request<TResponse>(config, options);
            },
            requestRaw<TResponse>(config, options) {
                return baseExecutor.requestRaw<TResponse>(config, options);
            },
        };
    },
});
```

### Стратегия сортировки аргументов функций `--sortByRequired`
По умолчанию генератор OpenAPI сортирует параметры сервисных функций согласно упрощенной схеме. Если вам нужна более строгая опция сортировки, используйте флаг `--sortByRequired`. Упрощенная опция сортировки похожа на ту, что использовалась в версии 0.2.3 генератора OpenAPI. Этот флаг позволяет обновиться до новой версии генератора, если вы "застряли" на версии 0.2.3.

### Отдельные index файлы `--useSeparatedIndexes`
По умолчанию генератор создает один index файл, который экспортирует весь сгенерированный код. С флагом `--useSeparatedIndexes` вы можете генерировать отдельные index файлы для core, models, schemas и services, что может помочь с лучшей организацией кода и tree-shaking.

### Enum с пользовательскими именами и описаниями
Вы можете использовать `x-enum-varnames` и `x-enum-descriptions` в вашей спецификации для генерации enum с пользовательскими именами и описаниями.
Это еще не в официальной [спецификации](https://github.com/OAI/OpenAPI-Specification/issues/681). Но это поддерживаемое расширение,
которое может помочь разработчикам использовать более осмысленные перечислители.
```json
{
    "EnumWithStrings": {
        "description": "This is a simple enum with strings",
        "enum": [
            0,
            1,
            2
        ],
        "x-enum-varnames": [
            "Success",
            "Warning",
            "Error"
        ],
        "x-enum-descriptions": [
            "Used when the status of something is successful",
            "Used when the status of something has a warning",
            "Used when the status of something has an error"
        ]
    }
}
```

Сгенерированный код:
```typescript
enum EnumWithStrings {
    /*
    * Used when the status of something is successful
    */
    Success = 0,
    /*
    * Used when the status of something has a warning
    */
    Waring = 1,
    /*
    * Used when the status of something has an error
    */
    Error = 2,
}
```


### Nullable в OpenAPI v2
В спецификации OpenAPI v3 вы можете создавать свойства, которые могут быть NULL, указав `nullable: true` в вашей схеме.
Однако спецификация v2 не позволяет этого делать. Вы можете использовать неофициальный `x-nullable` в вашей спецификации
для генерации nullable свойств в OpenApi v2.

```json
{
    "ModelWithNullableString": {
        "required": ["requiredProp"],
        "description": "This is a model with one string property",
        "type": "object",
        "properties": {
            "prop": {
                "description": "This is a simple string property",
                "type": "string",
                "x-nullable": true
            },
            "requiredProp": {
                "description": "This is a simple string property",
                "type": "string",
                "x-nullable": true
            }
        }
    }
}
```

Сгенерированный код:
```typescript
interface ModelWithNullableString {
    prop?: string | null,
    requiredProp: string | null,
}
```


### Авторизация
Генератор OpenAPI поддерживает авторизацию Bearer Token. Для включения отправки
токенов в каждом запросе вы можете установить токен используя глобальную конфигурацию OpenAPI:

```typescript
import { OpenAPI } from './generated';

OpenAPI.TOKEN = 'some-bearer-token';
```

Альтернативно, мы также поддерживаем асинхронный метод, который предоставляет токен для каждого запроса.
Вы можете просто назначить этот метод тому же свойству `TOKEN` в глобальном объекте OpenAPI.

```typescript
import { OpenAPI } from './generated';

const getToken = async () => {
    // Какой-то код, который запрашивает токен...
    return 'SOME_TOKEN';
}

OpenAPI.TOKEN = getToken;
```

### Ссылки

Локальные ссылки на определения схем (начинающиеся с `#/definitions/schemas/`)
будут преобразованы в ссылки на типы к эквивалентному сгенерированному типу верхнего уровня.

Генератор OpenAPI также поддерживает внешние ссылки, что позволяет разбить
ваш openapi.yml на несколько подфайлов или включить сторонние схемы
как часть ваших типов, чтобы обеспечить возможность генерации TypeScript для всего.

Внешние ссылки могут быть:
* *относительными ссылками* - ссылки на другие файлы в том же расположении, например
    `{ $ref: 'schemas/customer.yml' }`
* *удаленными ссылками* - полностью квалифицированные ссылки на другое удаленное расположение
     например `{ $ref: 'https://myexampledomain.com/schemas/customer_schema.yml' }`

    Для удаленных ссылок поддерживаются как файлы (когда файл находится в текущей файловой системе),
    так и http(s) URL.

Внешние ссылки также могут содержать внутренние пути во внешней схеме (например,
`schemas/collection.yml#/definitions/schemas/Customer`) и обратные ссылки на
базовый файл openapi или между файлами (так что вы можете ссылаться на другую
схему в главном файле как тип свойства объекта или массива, например).

При запуске файл OpenAPI или Swagger с внешними ссылками будет "собран",
так что все внешние ссылки и обратные ссылки будут разрешены (но локальные
ссылки сохранены).

FAQ
===

### Поддержка Babel
Если вы используете enums внутри ваших моделей / определений, то эти enums по умолчанию находятся внутри namespace с тем же именем,
что и ваша модель. Это называется объединением объявлений. Однако [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript)
не поддерживает эти namespace, поэтому если вы используете babel в вашем проекте, пожалуйста используйте флаг `--useUnionTypes`
для генерации union типов вместо традиционных enums. Больше информации можно найти здесь: [Enums vs. Union Types](#enums-vs-union-types---useuniontypes).

**Примечание:** Если вы используете Babel 7 и Typescript 3.8 (или выше), то вы должны включить `onlyRemoveTypeImports` для
игнорирования любых импортов 'type only', см. https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports для большей информации

```javascript
module.exports = {
    presets: [
        ['@babel/preset-typescript', {
            onlyRemoveTypeImports: true,
        }],
    ],
};
```


### Поддержка Node.js
По умолчанию эта библиотека будет генерировать клиент, совместимый с (браузерным) [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),
однако этот клиент не будет работать в среде Node.js. Если вы хотите сгенерировать клиент, совместимый с Node.js, то
вы можете указать `--httpClient node` в вызове openapi:

`openapi-codegen-cli generate --input ./spec.json --output ./dist --httpClient node`

Это сгенерирует клиент, который использует [`node-fetch`](https://www.npmjs.com/package/node-fetch) внутри. Однако,
для компиляции и запуска этого клиента вам нужно установить зависимости `node-fetch`:

```
npm install @types/node-fetch --save-dev
npm install node-fetch --save-dev
npm install form-data --save-dev
```

Для компиляции проекта и разрешения импортов вам нужно включить `allowSyntheticDefaultImports`
в вашем файле `tsconfig.json`.

```json
{
    "allowSyntheticDefaultImports": true
}
```

---

## Marauder Preview Features

> Актуальная схема конфигурации.

**Marauder** — preview-набор возможностей `openapi-codegen-cli`. Все фичи **opt-in** и обратно совместимы: существующие конфиги продолжают работать; новые блоки добавляются через `update-config`.

### Зачем Marauder?

OpenAPI-codegen по умолчанию генерирует клиент «в вакууме»: вы сами выбираете HTTP-клиент, валидатор, следите за качеством спеки и синхронизацией с backend. Marauder добавляет **контекст проекта**, **проверки спеки**, **инкрементальный кэш артефактов** и **multi-spec workspace helpers** — без ломки существующих workflow.

| Боль | Что даёт Marauder | CLI / конфиг |
|------|-------------------|--------------|
| Неясно, какой `httpClient` / `validationLibrary` подходит под ваш стек | Анализ `package.json` и рекомендация под React, Node, RN, edge | `--auto-select` / `autoSelect` |
| Спека «формально валидна», но неудобна для клиентов (циклы, дубли, deprecated) | Per-spec и cross-spec отчёт качества + опциональный CI gate | `--spec-analysis` / `specAnalysis` |
| Multi-spec monorepo: одни и те же модели генерируются повторно | Глобальный ReuseStore с shared артефактами (`copy` или `auto-group`) | `cacheStrategy: "reuse"`, `reuseMode` |
| Нужна multi-spec сводка после generate | Workspace report JSON/Markdown | `--workspace-report` / `workspaceReport` |
| Хочется увидеть конфликты shared-моделей до записи файлов | Pre-generation анализ в stdout | `--pre-analyze` / `preAnalyze` |
| Планирование canary-cutover между двумя клиентами | Автономный helper `TrafficSplitter.ts` | `--traffic-splitter` / `trafficSplitter` |
| Нужен machine-readable индекс multi-service | Avatar Swarm **манифест** | `--swarm` / `swarm` |

**Чего Marauder не делает:**
- не auto-fix спеки — только отчёты (`specAnalysis`);
- не заменяет semantic diff (`analyze-diff`) и проверку consumer-кода (`analyze-usage`);
- не переключает прод-трафик — `trafficSplitter` только эмитит helper-модуль;
- не возвращает удалённые top-level CLI-команды `heal` / `migrate` / `swarm` (`--swarm` пишет только манифест);
- не синхронизирует remote specs по URL.

---

### Карта возможностей: что выбрать

```
Ваша задача
│
├─ «Не знаю, что генерировать под наш monorepo / RN / Vercel»
│     → generate --auto-select
│
├─ «Хочу ловить проблемы спеки до merge / в CI»
│     → generate --spec-analysis (+ fail-on-high для gate)
│
├─ «Несколько спек — хочу переиспользовать model/schema артефакты»
│     → cache: true, cacheStrategy: "reuse" (+ опционально --reuse-mode auto-group)
│
├─ «Multi-spec сводка / проверка shared-моделей до записи»
│     → generate --workspace-report / --pre-analyze
│
├─ «Canary helper или Swarm-манифест (только codegen)»
│     → generate --traffic-splitter / --swarm
│
└─ «Полная цепочка quality gate»
      → analyze-diff → generate (strict + spec-analysis) → analyze-usage --diff-report
```

---

### Сценарий: Автоматический выбор (новый frontend-проект)

```bash
openapi-codegen-cli update-config -ocn openapi.config.json
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --auto-select
```

**Что получите:** для React/Next — `fetch` + `none` (без Zod, если его нет в deps).

### Сценарий: Строгий выбор из существующего стека

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": true
  }
}
```

AutoSelector выберет **только** из того, что уже есть в `package.json`.

### Сценарий: Контроль качества спеки в CI

```json
{
  "items": [{
    "input": "./openapi/spec.yaml",
    "output": "./src/api",
    "specAnalysis": {
      "enabled": true,
      "severity": "high",
      "failOnHigh": true,
      "reportPath": "./.openapi-codegen-reports/anomaly-report.json"
    }
  }]
}
```

```bash
openapi-codegen-cli generate -ocn openapi.config.json --spec-analysis
# dot-notation:
openapi-codegen-cli generate -i spec.yaml -o ./src/api \
  --spec-analysis \
  --spec-analysis.fail-on-high=true \
  --spec-analysis.severity=high
```

### Сценарий: Переиспользование моделей в multi-spec

```json
{
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "namespace",
  "items": [
    { "input": "./specs/a.yaml", "output": "./generated/a" },
    { "input": "./specs/b.yaml", "output": "./generated/b" }
  ]
}
```

### Сценарий: Комплексная аналитика спеки, клиента и использования

```bash
openapi-codegen-cli analyze-diff -i spec.yaml --compare-with spec.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json --auto-select --spec-analysis
openapi-codegen-cli analyze-usage -s ./src/api/index.ts -p . --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

### Сценарий: Monorepo со всеми фичами Marauder

Крупный проект с несколькими backend-командами, у каждой своя спека. Объединяет `--auto-select`, `--spec-analysis`, reuse store и opt-in Phase 2 (`workspaceReport`, `trafficSplitter`, манифест `swarm`, `preAnalyze`, `reuseMode`).

Полный пример: [`example/openapi.marauder.config.json`](../../example/openapi.marauder.config.json). Подробности Phase 2 — в [MIGRATION.RU.md](../../MIGRATION.RU.md) §10.

```json
{
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "namespace",
  "items": [
    {
      "input": "./specs/orders.yaml",
      "output": "./generated/orders",
      "autoSelect": { "enabled": true, "strict": true },
      "specAnalysis": { "enabled": true, "severity": "medium", "failOnHigh": true }
    },
    {
      "input": "./specs/catalog.yaml",
      "output": "./generated/catalog",
      "autoSelect": { "enabled": true, "strict": true },
      "specAnalysis": { "enabled": true, "severity": "medium", "failOnHigh": true }
    }
  ]
}
```

```bash
# CI: quality gate по спеке + генерация с reuse
openapi-codegen-cli analyze-diff -i specs/orders.yaml --compare-with specs/orders.base.yaml --ci
openapi-codegen-cli analyze-diff -i specs/catalog.yaml --compare-with specs/catalog.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json
# shared-модели записываются в .openapi-codegen-store один раз и переиспользуются в обоих output
```

**Что получите:** оба клиента делят модели из store, каждый получает правильный `httpClient`/`validationLibrary` под стек проекта, а любая `high`-проблема спеки блокирует билд.

---

### 1. `generate --auto-select`

**Какую проблему решает:** Ручной выбор `httpClient` и `validationLibrary` часто приводит к лишним deps, несовместимости (axios в RN/edge) и дублированию валидаторов.

**Auto-select** читает `package.json` целевого проекта и подставляет рекомендации **перед** генерацией.

```bash
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select.strict=true
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select.prefer-small-bundles=true
```

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": false,
    "preferSmallBundles": false,
    "preferStandards": false
  }
}
```

| Поле | По умолчанию | Эффект |
|------|--------------|--------|
| `enabled` | `false` | Запуск анализа перед generate |
| `strict` | `false` | Только deps из `package.json` |
| `preferSmallBundles` | `false` | При bundle constraints → `validationLibrary: none` |
| `preferStandards` | `false` | fetch + Zod как web-standard stack |

**Scope:** `autoSelect` — **только root** конфига. Per-item overrides для `httpClient`/`validationLibrary` применяются, когда probe recommendations различаются между output.

**Defaults без сигналов:** `fetch` + `none` (fallback валидатора — `NONE`, не `ZOD`).

---

### 2. `generate --spec-analysis`

**Какую проблему решает:** OpenAPI validator ловит синтаксис, но не **качество контракта**: циклические `$ref`, deeply nested schemas, inconsistent responses, ambiguous model names.

`specAnalysis` (каноническое имя) заменяет deprecated alias `anomalyDetection`. CLI: `--spec-analysis`; deprecated alias: `--anomaly-detection`.

**Per-spec детекторы:**
- `circular-schema-refs`
- `deeply-nested-schema`
- `inconsistent-response-types`
- `ambiguous-model-name`
- `deprecated-in-active-paths`
- `missing-operation-id`
- `empty-or-untyped-schema`

**Cross-spec детекторы** (`crossSpec: true` по умолчанию):
- `cross-spec-name-hash-conflict`
- `cross-spec-reuse-opportunity`
- `shared-output-collision-risk`

```json
{
  "specAnalysis": {
    "enabled": true,
    "severity": "medium",
    "reportFormat": "json",
    "reportPath": "./.openapi-codegen-reports/anomaly-report.json",
    "failOnHigh": false,
    "crossSpec": true,
    "maxNestingDepth": 5
  }
}
```

| Поле | По умолчанию | Описание |
|------|--------------|----------|
| `enabled` | `false` | Запуск при generate |
| `severity` | `medium` | Порог: `low` \| `medium` \| `high` |
| `reportFormat` | `json` | `json` \| `markdown` \| `html` |
| `reportPath` | `./.openapi-codegen-reports/anomaly-report.json` | Путь отчёта |
| `failOnHigh` | `false` | Fail generate при **high** severity |
| `crossSpec` | `true` | Cross-spec анализ в multi-item конфигах |
| `maxNestingDepth` | `5` | Порог deeply-nested-schema |

---

### 3. Кэш генерации и ReuseStore

| Стратегия | Поведение |
|-----------|-----------|
| `entity` | Per-output `.openapi-codegen-cache.json`; skip full regen на cache hit (дефолт после миграции конфигурации) |
| `reuse` | Глобальный `.openapi-codegen-store`; shared model/schema артефакты (дефолт актуальной схемы) |
| `content` | Только `writeFileIfChanged`; без entity/reuse store |

**`reuseMode`** (только при `cacheStrategy: "reuse"`):

| Значение | Поведение |
|----------|-----------|
| `copy` (по умолчанию) | Полные копии shared-артефактов в каждый output |
| `auto-group` | Общие модели в `{LCA}/__shared__/…` и переиспользуемое client core в `{LCA}/__shared__/core/…`, stub-реэкспорты в каждом output |

- `auto-group` требует `cacheStrategy: "reuse"`; иначе warn + fallback к `copy`
- Тривиальный LCA (нет полезного общего корня) → warn + fallback к `copy`

**Shared core:** идентичный boilerplate (`ApiError`, `ApiRequestOptions`, …) дедуплицируется в `__shared__/core/`. Файлы, которые отличаются между items, остаются локальными — в частности `OpenAPI.ts` при разных `server`/`version`, и `request.ts` / executor-адаптеры при разном эффективном `request`. Эффективный `request` = `items[].request ??` корневой `request` (как при нормализации генерации): корневой custom request шарится между items; per-item override запрещает кросс-item шаринг этого transport.

**Ограничения reuse:** требует `modelsMode: "interfaces"` (default) **или** `modelsMode: "classes"` с `models.layout: "per-file"`. Class mode с default `bundle` отключает artifact reuse (entity-cache fallback).

---

### 4. `generate --workspace-report`

**Какую проблему решает:** В multi-spec monorepo нужна единая сводка по всем items после generate.

Root-only. После генерации пишет `{path}.json` и/или `{path}.md` (`format`: `json` | `markdown` | `both`). Агрегирует per-spec статистику и cross-spec находки. Ошибки записи — warn; генерация не прерывается.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --workspace-report
openapi-codegen-cli generate -ocn openapi.config.json --workspace-report.format=both
```

```json
{
  "workspaceReport": {
    "enabled": true,
    "path": "./workspace-report",
    "format": "json"
  }
}
```

---

### 5. `generate --traffic-splitter`

**Какую проблему решает:** Нужен canary/routing helper между двумя клиентами без live cutover.

Root-only. Пишет автономный `TrafficSplitter.ts` в output **первого** item (без внешних import). Стратегии: `weighted` | `round-robin` | `header-based` | `header-and-weighted`. **Не** переключает live traffic и не деплоит клиенты. При multi-item — предупреждение; файл всё равно генерируется.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --traffic-splitter
openapi-codegen-cli generate -ocn openapi.config.json --traffic-splitter.strategy=weighted
```

```json
{
  "trafficSplitter": {
    "enabled": true,
    "strategy": "weighted"
  }
}
```

---

### 6. `generate --swarm` (манифест)

**Какую проблему решает:** Нужен machine-readable индекс multi-service без scaffolding клиентов.

Root-only. Пишет `swarm-manifest.json` (avatars, shared models, operation index). Это **не** возврат удалённой top-level команды `swarm` (без per-avatar client scaffolding). Top-level `swarm` / `heal` / `migrate` по-прежнему удалены.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --swarm
openapi-codegen-cli generate -ocn openapi.config.json --swarm.output=./swarm-manifest.json
```

```json
{
  "swarm": {
    "enabled": true,
    "output": "./swarm-manifest.json"
  }
}
```

---

### 7. `generate --pre-analyze`

**Какую проблему решает:** Хочется увидеть shared-модели / конфликты **до** записи файлов.

Root-only. До записи: парсит items, запускает `CrossSpecAnalyzer`, печатает сводку в stdout. Не блокирует генерацию; ошибки парсинга отдельных спек — warn. Отдельный report-файл не пишет.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --pre-analyze
```

```json
{
  "preAnalyze": true
}
```

---

### 8. Программный API

| Export | Назначение |
|--------|------------|
| `AutoSelector` | Project-aware selection (автоматический выбор) |
| `ProjectProbe` | Shared project context probe (анализатор проекта) |
| `runSpecAnalysis` | Spec quality analysis entry point (анализ качества спеки) |
| `CodegenSpecAnalyzer`, `CrossSpecAnalyzer` | Per-spec / cross-spec detectors (детекторы спеки) |
| `ReuseStore`, `GenerationReport` | Cache store и unified report (хранилище переиспользования, отчёт генерации) |
| `AvatarSwarmGenerator`, `writeSwarmOutput` | Генерация и запись Swarm-манифеста |
| `TrafficSplitter`, `generateTrafficSplitterModule` | Canary helper и запись `TrafficSplitter.ts` |
| `buildWorkspaceReport`, `writeWorkspaceReport` | Сборка и запись workspace report |
| `runAnomalyDetection` | Deprecated alias → `runSpecAnalysis` (обнаружение аномалий) |

```typescript
import { AutoSelector, ProjectProbe } from 'ts-openapi-codegen';
```

---

### 9. Ограничения preview

- `--auto-select` — при generate из `openapi.config.json` или merged multi-item configs
- `specAnalysis` — отчёты only; не auto-fix
- Reuse store — `modelsMode: "interfaces"` or `classes` + `layout: "per-file"`; `auto-group` требует `cacheStrategy: "reuse"`
- Phase 2 ключи (`workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode`) — root-oriented, opt-in
- `--swarm` на `generate` ≠ возвращённая top-level команда `swarm`
- `--traffic-splitter` не выполняет canary-cutover в production
- `preAnalyze` — advisory (только stdout); отдельный report-файл не пишет
- Marauder config merge — shallow spread, не recursive deep merge
- CLI dot-notation парсится **до** Commander (`parseNestedCliOptions`)
