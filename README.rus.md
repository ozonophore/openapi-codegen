# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Downloads][coverage-image]][coverage-url]
[![TypeScript][typescript-image]][typescript-url]
[![CI][CI-image]][CI-url]
[![ISSUES][issues-image]][issues-url]
[![issues-pr][issues-pr-image]][issues-pr-url]
[![issues-pr-closed][issues-pr-closed-image]][issues-pr-closed-url]
[![stars-closed][stars-image]][stars-url]
![librariesio-image]
![lines-image]
![Minimum node.js version](https://badgen.net/npm/node/next)


> Node.js библиотека, которая генерирует клиенты Typescript на основе спецификации OpenAPI.

## Почему?
- Интерфейс ❤️ OpenAPI, но мы не хотим использовать JAVA codegen в наших сборках
- Быстрый, легкий, надежный и не зависящий от фреймворка. 🚀
- Поддерживает генерацию клиентов TypeScript
- Поддерживает генерацию http-клиентов fetch, XHR, Node.js и axios
- Поддерживает спецификации OpenAPI версии 2.0 и 3.0
- Поддерживает файлы JSON и YAML для ввода
- Поддерживает генерацию через CLI, Node.js и NPX
- Поддерживает tsc и @babel/plugin-transform-typescript
- Поддерживает кастомизацию имен моделей
- Поддерживает внешние ссылки с помощью [`swagger-parser`](https://github.com/APIDevTools/swagger-parser/)

## Установка

```
npm install ts-openapi-codegen --save-dev
```

## Использование

CLI инструмент поддерживает три основные команды: `generate`, `check-openapi-config`, и `init-openapi-config`.

### Команда: `generate`

Генерирует TypeScript клиент на основе спецификаций OpenAPI.

**Базовое использование:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**Все доступные опции:**

| Опция | Короткая | Тип | По умолчанию | Описание |
|-------|----------|-----|--------------|----------|
| `--input` | `-i` | string | - | Спецификация OpenAPI (путь, URL или строковое содержимое) - **обязательно** |
| `--output` | `-o` | string | - | Выходная директория - **обязательно** |
| `--openapi-config` | `-ocn` | string | `openapi.config.json` | Путь к файлу конфигурации |
| `--outputCore` | `-oc` | string | `{output}` | Выходная директория для core файлов |
| `--outputServices` | `-os` | string | `{output}` | Выходная директория для сервисов |
| `--outputModels` | `-om` | string | `{output}` | Выходная директория для моделей |
| `--outputSchemas` | `-osm` | string | `{output}` | Выходная директория для схем |
| `--httpClient` | `-c` | string | `fetch` | HTTP клиент для генерации: `fetch`, `xhr`, `node`, или `axios` |
| `--useOptions` | - | boolean | `false` | Использовать опции вместо аргументов |
| `--useUnionTypes` | - | boolean | `false` | Использовать union типы вместо enums |
| `--excludeCoreServiceFiles` | - | boolean | `false` | Исключить генерацию core и сервисных файлов |
| `--request` | - | string | - | Путь к пользовательскому файлу запросов |
| `--interfacePrefix` | - | string | `I` | Префикс для интерфейсов моделей |
| `--enumPrefix` | - | string | `E` | Префикс для enum моделей |
| `--typePrefix` | - | string | `T` | Префикс для type моделей |
| `--useCancelableRequest` | - | boolean | `false` | Использовать отменяемый promise как тип возврата |
| `--sortByRequired` | `-s` | boolean | `false` | Использовать расширенную стратегию сортировки для аргументов функций |
| `--useSeparatedIndexes` | - | boolean | `false` | Использовать отдельные index файлы для core, models, schemas и services |
| `--logLevel` | `-l` | string | `error` | Уровень логирования: `info`, `warn`, или `error` |
| `--logTarget` | `-t` | string | `console` | Цель логирования: `console` или `file` |
| `--validationLibrary` | - | string | `none` | Библиотека валидации для генерации схем: `none`, `zod`, `joi`, `yup`, или `jsonschema` |

**Примеры:**
```bash
# Базовая генерация
openapi generate --input ./spec.json --output ./dist

# С пользовательским HTTP клиентом
openapi generate --input ./spec.json --output ./dist --httpClient axios

# С файлом конфигурации
openapi generate --openapi-config ./my-config.json

# Со всеми опциями через CLI
openapi generate \
  --input ./spec.json \
  --output ./dist \
  --httpClient fetch \
  --useOptions \
  --useUnionTypes \
  --logLevel info
```

### Команда: `check-openapi-config`

Проверяет структуру и значения файла конфигурации.

**Использование:**
```bash
openapi check-openapi-config
openapi check-openapi-config --openapi-config ./custom-config.json
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к файлу конфигурации (по умолчанию: `openapi.config.json`)

### Команда: `init-openapi-config`

Генерирует шаблон файла конфигурации.

**Использование:**
```bash
# Генерация шаблона с одним набором опций
openapi init-openapi-config

# Генерация шаблона с несколькими наборами опций
openapi init-openapi-config --type MULTIOPTION

# Пользовательское имя файла конфигурации
openapi init-openapi-config --openapi-config ./my-config.json
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к выходному файлу конфигурации (по умолчанию: `openapi.config.json`)
- `--type` / `-t` - Тип шаблона: `OPTION` (одиночный) или `MULTIOPTION` (множественный) (по умолчанию: `OPTION`)

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
    "request": "./custom-request.ts"
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
| `interfacePrefix` | string | `I` | Префикс для интерфейсов моделей |
| `enumPrefix` | string | `E` | Префикс для enum моделей |
| `typePrefix` | string | `T` | Префикс для type моделей |
| `useCancelableRequest` | boolean | `false` | Использовать отменяемый promise как тип возврата |
| `sortByRequired` | boolean | `false` | Расширенная стратегия сортировки для аргументов |
| `useSeparatedIndexes` | boolean | `false` | Использовать отдельные index файлы |
| `items` | array | - | Массив конфигураций (для формата multi-options) |
| `validationLibrary` | string | `none` | Библиотека валидации для генерации схем: `none`, `zod`, `joi`, `yup`, или `jsonschema` |

**Примечание:** Вы можете использовать команду `init-openapi-config` для генерации шаблона файла конфигурации.

## Примеры

### Использование CLI команд

**Базовая генерация:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**С файлом конфигурации:**
```bash
# Сначала создайте файл конфигурации
openapi init-openapi-config

# Затем выполните генерацию
openapi generate
```

**Проверка конфигурации:**
```bash
openapi check-openapi-config
```

### Использование NPX

```bash
npx ts-openapi-codegen generate --input ./spec.json --output ./dist
```

### Использование скриптов в package.json

**package.json**
```json
{
    "scripts": {
        "generate": "openapi generate --input ./spec.json --output ./dist",
        "generate:config": "openapi generate",
        "check-config": "openapi check-openapi-config",
        "init-config": "openapi init-openapi-config"
    }
}
```

### Node.js API

```javascript
const OpenAPI = require('ts-openapi-codegen');

OpenAPI.generate({
    input: './spec.json',
    output: './dist'
});

// Или передав содержимое спецификации напрямую 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```


## Возможности

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

### Пользовательский Request Executor

Начиная с версии 2.0.0, сгенерированные сервисы используют интерфейс `RequestExecutor` вместо прямых вызовов core-функции `request`. Это позволяет вам предоставить свою собственную реализацию запросов или адаптировать существующие.

**Использование пользовательского RequestExecutor:**

Вы можете создать свою собственную реализацию `RequestExecutor`:

```ts
import type { RequestExecutor, RequestConfig } from './generated/core/request-executor';
import { SimpleService } from './generated/services/SimpleService';

// Определите свой тип опций (опционально)
interface MyCustomOptions {
    timeout?: number;
    retries?: number;
}

// Создайте пользовательский executor
const customExecutor: RequestExecutor<MyCustomOptions> = {
    async request<TResponse>(config: RequestConfig, options?: MyCustomOptions): Promise<TResponse> {
        // Ваша пользовательская логика запросов здесь
        const response = await fetch(config.url, {
            method: config.method,
            headers: config.headers,
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        });
        
        if (!response.ok) {
            throw new Error(`Request failed: ${response.statusText}`);
        }
        
        return response.json();
    },
};

// Используйте его со сгенерированными сервисами
const simpleService = new SimpleService<MyCustomOptions>(customExecutor);
await simpleService.getCallWithoutParametersAndResponse({ timeout: 5000, retries: 3 });
```

**Использование legacy request adapter:**

Если у вас есть существующий пользовательский файл `request` (указанный через опцию `--request`), вы можете использовать хелпер `createLegacyExecutor` для адаптации его к новому интерфейсу `RequestExecutor`:

```ts
import { createLegacyExecutor } from './generated/core/legacy-request-adapter';
import { OpenAPI } from './generated/core/OpenAPI';
import { SimpleService } from './generated/services/SimpleService';

// Legacy адаптер оборачивает вашу существующую функцию request
const executor = createLegacyExecutor(OpenAPI);

// Опционально, вы можете мапить пользовательские опции в ApiRequestOptions
interface XHROptions {
    timeout?: number;
}

const executorWithOptions = createLegacyExecutor<XHROptions>(OpenAPI, (options) => {
    // Мапьте ваши пользовательские опции в ApiRequestOptions при необходимости
    return {
        // Добавьте любые поля ApiRequestOptions на основе options
    };
});

// Используйте со сервисами
const simpleService = new SimpleService(executor);
await simpleService.getCallWithoutParametersAndResponse();
```

**Примечание:** Опция --request по-прежнему работает для кастомизации core-функции request. Сгенерированный legacy-request-adapter автоматически будет использовать вашу пользовательскую реализацию request при создании адаптера.

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

[npm-url]: https://www.npmjs.com/package/ts-openapi-codegen
[npm-image]: https://img.shields.io/npm/v/ts-openapi-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/ts-openapi-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=ts-openapi-codegen
[downloads-image]: http://img.shields.io/npm/dm/ts-openapi-codegen.svg
[travis-url]: https://app.travis-ci.com/github/ozonophore/openapi-codegen
[travis-image]: https://app.travis-ci.com/github/ozonophore/openapi-codegen.svg?branch=master
[coverage-url]: https://codecov.io/gh/ozonophore/openapi-codegen
[coverage-image]: https://codecov.io/gh/ozonophore/openapi-codegen/branch/master/graph/badge.svg?token=RBPZ01BW0Y
[typescript-url]: https://www.typescriptlang.org
[typescript-image]: https://badgen.net/badge/icon/typescript?icon=typescript&label
[CI-url]: https://github.com/ozonophore/openapi-codegen/actions/workflows/CI.yml
[CI-image]: https://github.com/ozonophore/openapi-codegen/actions/workflows/CI.yml/badge.svg?branch=master
[issues-url]: https://github.com/ozonophore/openapi-codegen/issues
[issues-image]: https://img.shields.io/github/issues/ozonophore/openapi-codegen.svg
[issues-pr-url]: https://github.com/ozonophore/openapi-codegen/pulls
[issues-pr-image]: https://img.shields.io/github/issues-pr/ozonophore/openapi-codegen.svg
[issues-pr-closed-url]: https://github.com/ozonophore/openapi-codegen/pulls?q=is%3Apr+is%3Aclosed
[issues-pr-closed-image]: https://img.shields.io/github/issues-pr-closed/ozonophore/openapi-codegen.svg
[stars-url]: https://github.com/ozonophore/openapi-codegen/stargazers
[stars-image]: https://img.shields.io/github/stars/ozonophore/openapi-codegen.svg
[librariesio-image]: https://img.shields.io/librariesio/github/ozonophore/openapi-codegen
[lines-image]: https://img.shields.io/tokei/lines/github/ozonophore/openapi-codegen



