
### HTTP Клиенты

Генератор поддерживает несколько HTTP клиентов:
- **fetch** (по умолчанию) - Browser Fetch API
- **xhr** - XMLHttpRequest
- **node** - Node.js совместимый клиент, использующий `node-fetch`
- **axios** - Axios HTTP клиент

Выберите клиент используя опцию `--httpClient` или свойство `client` в файле конфигурации.

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
- **Yup** использует `.transform(...)`
- **JSON Schema (AJV)** включает `coerceTypes`

### Режим моделей `--modelsMode`

По умолчанию модели генерируются как интерфейсы/типы. При `--modelsMode classes` генератор создаёт:
- `*Raw` интерфейсы (JSON‑формат API)
- `*Dto` классы с геттерами, дефолтами, рекурсивными конструкторами и `toJSON()`

Вывод консолидируется в один файл `models.ts`, а `BaseDto`/`dtoUtils` добавляются в `core`.

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
import { withInterceptors } from './generated/core/interceptors/withInterceptors';
import { SimpleService } from './generated/services/SimpleService';

interface MyCustomOptions {
    timeout?: number;
}

const baseExecutor: RequestExecutor<MyCustomOptions> = {
    async request<T>(config: RequestConfig, options?: MyCustomOptions): Promise<T> {
        const response = await fetch(config.url, {
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

`openapi generate --input ./spec.json --output ./dist --httpClient node`

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

