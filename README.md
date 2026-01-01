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


> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
- Quick, lightweight, robust and framework agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of fetch, XHR, Node.js and axios http clients
- Supports OpenAPI specification v2.0 and v3.0
- Supports JSON and YAML files for input
- Supports generation through CLI, Node.js and NPX
- Supports tsc and @babel/plugin-transform-typescript
- Supports customization names of models
- Supports external references using [`swagger-parser`](https://github.com/APIDevTools/swagger-parser/)

## Install

```
npm install ts-openapi-codegen --save-dev
```


## Usage

The CLI tool supports three main commands: `generate`, `check-openapi-config`, and `init-openapi-config`.

### Command: `generate`

Generates TypeScript client code based on OpenAPI specifications.

**Basic usage:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**All available options:**

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--input` | `-i` | string | - | OpenAPI specification (path, URL, or string content) - **required** |
| `--output` | `-o` | string | - | Output directory - **required** |
| `--openapi-config` | `-ocn` | string | `openapi.config.json` | Path to configuration file |
| `--outputCore` | `-oc` | string | `{output}` | Output directory for core files |
| `--outputServices` | `-os` | string | `{output}` | Output directory for services |
| `--outputModels` | `-om` | string | `{output}` | Output directory for models |
| `--outputSchemas` | `-osm` | string | `{output}` | Output directory for schemas |
| `--httpClient` | `-c` | string | `fetch` | HTTP client to generate: `fetch`, `xhr`, `node`, or `axios` |
| `--useOptions` | - | boolean | `false` | Use options instead of arguments |
| `--useUnionTypes` | - | boolean | `false` | Use union types instead of enums |
| `--excludeCoreServiceFiles` | - | boolean | `false` | Exclude generation of core and service files |
| `--request` | - | string | - | Path to custom request file |
| `--interfacePrefix` | - | string | `I` | Prefix for interface models |
| `--enumPrefix` | - | string | `E` | Prefix for enum models |
| `--typePrefix` | - | string | `T` | Prefix for type models |
| `--useCancelableRequest` | - | boolean | `false` | Use cancelable promise as return type |
| `--sortByRequired` | `-s` | boolean | `false` | Use extended sorting strategy for function arguments |
| `--useSeparatedIndexes` | - | boolean | `false` | Use separate index files for core, models, schemas, and services |
| `--logLevel` | `-l` | string | `error` | Logging level: `info`, `warn`, or `error` |
| `--logTarget` | `-t` | string | `console` | Logging target: `console` or `file` |
| `--validationLibrary` | - | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |

**Examples:**
```bash
# Basic generation
openapi generate --input ./spec.json --output ./dist

# With custom HTTP client
openapi generate --input ./spec.json --output ./dist --httpClient axios

# With configuration file
openapi generate --openapi-config ./my-config.json

# With all options via CLI
openapi generate \
  --input ./spec.json \
  --output ./dist \
  --httpClient fetch \
  --useOptions \
  --useUnionTypes \
  --logLevel info
```

### Command: `check-openapi-config`

Validates the configuration file structure and values.

**Usage:**
```bash
openapi check-openapi-config
openapi check-openapi-config --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)

### Command: `init-openapi-config`

Generates a configuration file template.

**Usage:**
```bash
# Generate single options template
openapi init-openapi-config

# Generate multi-options template
openapi init-openapi-config --type MULTIOPTION

# Custom config file name
openapi init-openapi-config --openapi-config ./my-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to output configuration file (default: `openapi.config.json`)
- `--type` / `-t` - Template type: `OPTION` (single) or `MULTIOPTION` (multiple) (default: `OPTION`)

### Configuration File

Instead of passing all options via CLI, you can use a configuration file. Create `openapi.config.json` in your project root:

**Single options format:**
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

**Multi-options format (with common block):**
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

**Array format (multiple configs):**
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

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `input` | string | - | OpenAPI specification path/URL (required for items) |
| `output` | string | - | Output directory (required) |
| `outputCore` | string | `{output}` | Output directory for core files |
| `outputServices` | string | `{output}` | Output directory for services |
| `outputModels` | string | `{output}` | Output directory for models |
| `outputSchemas` | string | `{output}` | Output directory for schemas |
| `client` | string | `fetch` | HTTP client: `fetch`, `xhr`, `node`, or `axios` |
| `useOptions` | boolean | `false` | Use options instead of arguments |
| `useUnionTypes` | boolean | `false` | Use union types instead of enums |
| `excludeCoreServiceFiles` | boolean | `false` | Exclude core and service files generation |
| `request` | string | - | Path to custom request file |
| `interfacePrefix` | string | `I` | Prefix for interface models |
| `enumPrefix` | string | `E` | Prefix for enum models |
| `typePrefix` | string | `T` | Prefix for type models |
| `useCancelableRequest` | boolean | `false` | Use cancelable promise as return type |
| `sortByRequired` | boolean | `false` | Extended sorting strategy for arguments |
| `useSeparatedIndexes` | boolean | `false` | Use separate index files |
| `items` | array | - | Array of configurations (for multi-options format) |
| `validationLibrary` | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |

**Note:** You can use the `init-openapi-config` command to generate a template configuration file.

## Examples

### Using CLI commands

**Basic generation:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**With configuration file:**
```bash
# First, create config file
openapi init-openapi-config

# Then generate
openapi generate
```

**Check configuration:**
```bash
openapi check-openapi-config
```

### Using NPX

```bash
npx ts-openapi-codegen generate --input ./spec.json --output ./dist
```

### Using package.json scripts

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

// Or by providing the content of the spec directly 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```


## Features

### HTTP Clients

The generator supports multiple HTTP clients:
- **fetch** (default) - Browser Fetch API
- **xhr** - XMLHttpRequest
- **node** - Node.js compatible client using `node-fetch`
- **axios** - Axios HTTP client

Select the client using the `--httpClient` option or `client` property in config file.

### Argument style vs. Object style `--useOptions`
There's no [named parameter](https://en.wikipedia.org/wiki/Named_parameter) in JavaScript or TypeScript, because of
that, we offer the flag `--useOptions` to generate code in two different styles.

**Argument-style:**
```typescript
function createUser(name: string, password: string, type?: string, address?: string) {
    // ...
}

// Usage
createUser('Jack', '123456', undefined, 'NY US');
```

**Object-style:**
```typescript
function createUser({ name, password, type, address }: {
    name: string,
    password: string,
    type?: string
    address?: string
}) {
    // ...
}

// Usage
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```

### Enums vs. Union Types `--useUnionTypes`
The OpenAPI spec allows you to define [enums](https://swagger.io/docs/specification/data-models/enums/) inside the
data model. By default, we convert these enums definitions to [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html).
However, these enums are merged inside the namespace of the model, this is unsupported by Babel, [see docs](https://babeljs.io/docs/en/babel-plugin-transform-typescript#impartial-namespace-support).
Because we also want to support projects that use Babel [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript),
we offer the flag `--useUnionTypes` to generate [union types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)
instead of the traditional enums. The difference can be seen below:

**Enums:**
```typescript
// Model
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

// Usage
const order: Order = {
    id: 1,
    quantity: 40,
    status: Order.status.PLACED
}
```

**Union Types:**
```typescript
// Model
export interface Order {
    id?: number;
    quantity?: number;
    status?: 'placed' | 'approved' | 'delivered';
}

// Usage
const order: Order = {
    id: 1,
    quantity: 40,
    status: 'placed'
}
```

### Validation schemas `--validationLibrary`
By default, the OpenAPI generator only exports interfaces for your models. These interfaces will help you during
development, but will not be available in JavaScript during runtime. However, OpenAPI allows you to define properties
that can be useful during runtime, for instance: `maxLength` of a string or a `pattern` to match, etc.

The `--validationLibrary` parameter allows you to generate runtime validation schemas using popular validation libraries:
- **none** (default) - No validation schemas generated
- **zod** - Generate Zod validation schemas
- **joi** - Generate Joi validation schemas
- **yup** - Generate Yup validation schemas
- **jsonschema** - Generate JSON Schema validation schemas

Let's say we have the following model:

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

**With Zod (`--validationLibrary zod`):**

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

**With Joi (`--validationLibrary joi`):**

```ts
import Joi from 'joi';

export const MyModelSchema = Joi.object({
    key: Joi.string().max(64).pattern(/^[a-zA-Z0-9_]*$/).required(),
    name: Joi.string().max(255).required(),
    enabled: Joi.boolean().readonly(),
    modified: Joi.string().isoDate().readonly(),
});
```

**With Yup (`--validationLibrary yup`):**

```ts
import * as yup from 'yup';

export const MyModelSchema = yup.object({
    key: yup.string().max(64).matches(/^[a-zA-Z0-9_]*$/).required(),
    name: yup.string().max(255).required(),
    enabled: yup.boolean().readonly(),
    modified: yup.string().datetime().readonly(),
});
```

**With JSON Schema (`--validationLibrary jsonschema`):**

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
These validation schemas can be used for form generation, input validation, and runtime type checking in your application.

### Cancelable promise `--useCancelableRequest`
By default, the OpenAPI generator generates services for accessing the API that use non-cancellable requests. Therefore, we have added the ability to switch the generator to generate canceled API requests. To do this, use the flag `--useCancelableRequest`.
An example of a cancelled request would look like this:

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

### Custom Request Executor

Starting from version 2.0.0-beta.1, generated services use the `RequestExecutor` interface instead of calling the core `request` function directly. This allows you to provide your own request implementation or adapt existing ones.

**Using a custom RequestExecutor:**

You can create your own `RequestExecutor` implementation:

```ts
import type { RequestExecutor, RequestConfig } from './generated/core/request-executor';
import { SimpleService } from './generated/services/SimpleService';

// Define your custom options type (optional)
interface MyCustomOptions {
    timeout?: number;
    retries?: number;
}

// Create a custom executor
const customExecutor: RequestExecutor<MyCustomOptions> = {
    async request<TResponse>(config: RequestConfig, options?: MyCustomOptions): Promise<TResponse> {
        // Your custom request logic here
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

// Use it with generated services
const simpleService = new SimpleService<MyCustomOptions>(customExecutor);
await simpleService.getCallWithoutParametersAndResponse({ timeout: 5000, retries: 3 });
```

**Using legacy request adapter:**

If you have an existing custom `request` file (specified via `--request` option), you can use the `createLegacyExecutor` helper to adapt it to the new `RequestExecutor` interface:

```ts
import { createLegacyExecutor } from './generated/core/legacy-request-adapter';
import { OpenAPI } from './generated/core/OpenAPI';
import { SimpleService } from './generated/services/SimpleService';

// The legacy adapter wraps your existing request function
const executor = createLegacyExecutor(OpenAPI);

// Optionally, you can map custom options to ApiRequestOptions
interface XHROptions {
    timeout?: number;
}

const executorWithOptions = createLegacyExecutor<XHROptions>(OpenAPI, (options) => {
    // Map your custom options to ApiRequestOptions if needed
    return {
        // Add any ApiRequestOptions fields based on options
    };
});

// Use with services
const simpleService = new SimpleService(executor);
await simpleService.getCallWithoutParametersAndResponse();
```

**Note:** The `--request` option still works for customizing the core `request` function. The generated 
`legacy-request-adapter` will automatically use your custom request implementation when creating the adapter.

### Sorting strategy for function arguments `--sortByRequired`
By default, the OpenAPI generator sorts the parameters of service functions according to a simplified scheme. If you need a more strict sorting option, then you need to use the `--sortByRequired` flag. The simplified sorting option is similar to the one used in version 0.2.3 of the OpenAPI generator. This flag allows you to upgrade to a new version of the generator if you are "stuck" on version 0.2.3.

### Separate index files `--useSeparatedIndexes`
By default, the generator creates a single index file that exports all generated code. With the `--useSeparatedIndexes` flag, you can generate separate index files for core, models, schemas, and services, which can help with better code organization and tree-shaking.

### Enum with custom names and descriptions
You can use `x-enum-varnames` and `x-enum-descriptions` in your spec to generate enum with custom names and descriptions.
It's not in official [spec](https://github.com/OAI/OpenAPI-Specification/issues/681) yet. But it's a supported extension
that can help developers use more meaningful enumerators.
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

Generated code:
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


### Nullable in OpenAPI v2
In the OpenAPI v3 spec you can create properties that can be NULL, by providing a `nullable: true` in your schema.
However, the v2 spec does not allow you to do this. You can use the unofficial `x-nullable` in your specification
to generate nullable properties in OpenApi v2.

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

Generated code:
```typescript
interface ModelWithNullableString {
    prop?: string | null,
    requiredProp: string | null,
}
```


### Authorization
The OpenAPI generator supports Bearer Token authorization. In order to enable the sending
of tokens in each request you can set the token using the global OpenAPI configuration:

```typescript
import { OpenAPI } from './generated';

OpenAPI.TOKEN = 'some-bearer-token';
```

Alternatively, we also support an async method that provides the token for each request.
You can simply assign this method to the same `TOKEN `property in the global OpenAPI object.

```typescript
import { OpenAPI } from './generated';

const getToken = async () => {
    // Some code that requests a token...
    return 'SOME_TOKEN';
}

OpenAPI.TOKEN = getToken;
```

### References

Local references to schema definitions (those beginning with `#/definitions/schemas/`)
will be converted to type references to the equivalent, generated top-level type.

The OpenAPI generator also supports external references, which allows you to break
down your openapi.yml into multiple sub-files, or incorporate third-party schemas
as part of your types to ensure everything is able to be TypeScript generated.

External references may be:
* *relative references* - references to other files at the same location e.g.
    `{ $ref: 'schemas/customer.yml' }`
* *remote references* - fully qualified references to another remote location
     e.g. `{ $ref: 'https://myexampledomain.com/schemas/customer_schema.yml' }`

    For remote references, both files (when the file is on the current filesystem)
    and http(s) URLs are supported.

External references may also contain internal paths in the external schema (e.g.
`schemas/collection.yml#/definitions/schemas/Customer`) and back-references to
the base openapi file or between files (so that you can reference another
schema in the main file as a type of an object or array property, for example).

At start-up, an OpenAPI or Swagger file with external references will be "bundled",
so that all external references and back-references will be resolved (but local
references preserved).

FAQ
===

### Babel support
If you use enums inside your models / definitions then those enums are by default inside a namespace with the same name
as your model. This is called declaration merging. However, the [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript)
does not support these namespaces, so if you are using babel in your project please use the `--useUnionTypes` flag
to generate union types instead of traditional enums. More info can be found here: [Enums vs. Union Types](#enums-vs-union-types---useuniontypes).

**Note:** If you are using Babel 7 and Typescript 3.8 (or higher) then you should enable the `onlyRemoveTypeImports` to
ignore any 'type only' imports, see https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports for more info

```javascript
module.exports = {
    presets: [
        ['@babel/preset-typescript', {
            onlyRemoveTypeImports: true,
        }],
    ],
};
```


### Node.js support
By default, this library will generate a client that is compatible with the (browser based) [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),
however this client will not work inside the Node.js environment. If you want to generate a Node.js compatible client then
you can specify `--httpClient node` in the openapi call:

`openapi generate --input ./spec.json --output ./dist --httpClient node`

This will generate a client that uses [`node-fetch`](https://www.npmjs.com/package/node-fetch) internally. However,
in order to compile and run this client, you will need to install the `node-fetch` dependencies:

```
npm install @types/node-fetch --save-dev
npm install node-fetch --save-dev
npm install form-data --save-dev
```

In order to compile the project and resolve the imports, you will need to enable the `allowSyntheticDefaultImports`
in your `tsconfig.json` file.

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
