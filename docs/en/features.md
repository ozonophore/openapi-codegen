## Features

### HTTP Clients

The generator supports multiple HTTP clients:
- **fetch** (default) - Browser Fetch API
- **xhr** - XMLHttpRequest
- **node** - Node.js compatible client using `node-fetch`
- **axios** - Axios HTTP client

Select the client using the `--httpClient` option or `httpClient` property in config file.

### Generation cache `--cache`

Generation cache is **opt-in** (disabled by default). Enable it with `--cache` or `"cache": true` in the config file.

**Options:**

- `cache` (default: `false`)
- `cachePath` (default: `.openapi-codegen-store`)
- `cacheStrategy` — `entity`, `reuse`, or `content` (current schema default: `reuse`; config schema migration sets `entity` for existing configs)
- `reuseOnConflict` (default: `fail`) — when `cacheStrategy` is `reuse`: `fail` throws on schema drift; `namespace` stores under spec-scoped paths
- `cacheDebug` (default: `false`)

**Strategies:**

- **`entity`** — per-output `.openapi-codegen-cache.json`; on cache hit, item generation is skipped; fastest for unchanged inputs and options.
- **`reuse`** — global `.openapi-codegen-store` with shared model/schema artifacts copied into each output (preview; requires `modelsMode: "interfaces"`).
- **`content`** — generation still runs; only changed files are written via `writeFileIfChanged` (no entity/reuse store).

**When to use which strategy:**

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Single spec, unchanged input | `entity` | Skips the entire item on cache hit |
| Monorepo / multi-spec with shared models | `reuse` | 2nd+ specs reuse rendered model/schema artifacts |
| No cache or minimal overhead | `cache: false` or `content` | No store manifest; `content` still skips unchanged file writes |
| Fair reuse benchmark | `example/openapi.reuse.bench.config.json` | Same items as base config + only `cache`/`reuse`; unlike `openapi.reuse.config.json`, no Marauder extras (`autoSelect`, `specAnalysis`) |

Reuse always parses the spec and generates core/services; it does not skip generation like entity cache. Warm reuse wins when shared schemas dominate (multi-item configs). Cold reuse may be slower than no-cache while populating the store.

For perf regression checks, see `test/reusePerformance.test.ts`. Enable `cacheDebug: true` to include manifest phase timings in `{cachePath}/reports/latest.json`.

Reuse store fingerprints use MD5 (`manifest.json` version 2). Upgrading from version 1 invalidates the existing store on the next generate (artifacts are recreated; orphans are removed by GC).

When `cache` or `specAnalysis` is enabled, a unified generation report is written to `{output}/reports/latest.json` (or `<cachePath>/reports/latest.json` in reuse mode).

### Marauder preview

Opt-in features during `generate` (current config schema):

- **`--auto-select` / `autoSelect`** — probes the target project and recommends `httpClient` and `validationLibrary`.
- **`--spec-analysis` / `specAnalysis`** — per-spec and cross-spec OpenAPI quality detectors; writes a report to `reportPath` (default: `./.openapi-codegen-reports/anomaly-report.json`). `--anomaly-detection` is a deprecated alias.
- **`--workspace-report` / `workspaceReport`** — multi-spec workspace summary (JSON and/or Markdown).
- **`--traffic-splitter` / `trafficSplitter`** — generates a standalone `TrafficSplitter.ts` helper (no live traffic).
- **`--swarm` / `swarm`** — writes an Avatar Swarm **manifest** only (top-level `swarm` / `heal` / `migrate` commands stay removed).
- **`--pre-analyze` / `preAnalyze`** — cross-spec shared-model / conflict summary to stdout before any files are written.
- **`--reuse-mode` / `reuseMode`** — `copy` (default) or `auto-group` shared models **and compatible client core** under `{LCA}/__shared__/`.
- Dot-notation CLI flags: `--auto-select.strict`, `--spec-analysis.fail-on-high`, `--workspace-report.format`, `--traffic-splitter.strategy`, `--swarm.output`, inline JSON objects.

See [Marauder preview features](#marauder-preview-features) below and [Migration guide](../../MIGRATION.md) (§10).

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

When `--useHistory` is enabled and a diff report marks a type change, validators will attempt to coerce values:
- **Zod** uses `z.coerce.*`
- **Joi** uses `Joi.alternatives().try(...)`
- **Yup** uses `.transform(...)`
- **JSON Schema (AJV)** enables `coerceTypes`

### Models mode `--modelsMode`

By default, models are generated as TypeScript interfaces/types. When `--modelsMode classes` is used, the generator produces:
- `*Raw` interfaces matching the API JSON
- `*Dto` classes with getters, defaults, recursive constructors, and `toJSON()`

The output is consolidated into a single `models.ts` file, and `BaseDto`/`dtoUtils` are emitted in `core`.

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

### RequestExecutor

Starting from version **2.0.0** the generated services use the `RequestExecutor` interface
instead of direct calls to the `request` core function.

The `RequestExecutor` is a single HTTP logic integration point responsible for executing requests
and extending client behavior. It allows you to:
- use any transport (fetch/axios/xhr/custom);
- Centrally handle requests, responses, and errors;
- expand the client's behavior without changing the generated services.

#### Interceptors

`RequestExecutor` supports **interceptors**, which allow you to implement additional
logic at different stages of the request lifecycle.:

- `onRequest` — modification of the request before sending (headers, auth, logging);
- `onResponse` — processing successful responses;
- `onError` — centralized error handling.

Interceptors are applied at the executor level and are automatically used by all
generated services.

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

#### Custom implementation of RequestExecutor with interceptors

A custom `RequestExecutor` can be used together with interceptors.
In this case, the executor is responsible only for the transport and execution of the request,
while the interceptors are responsible for the extensible business logic (authorization, logging, error handling).

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

// Wrapping the executor interceptors
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

#### Using generated `createClient` with `customExecutorPath` and `executorFactory`

If you set `customExecutorPath` in generation config, `createClient.ts` imports your custom
`createExecutorAdapter` and uses it as the default executor.

You can additionally pass `executorFactory` at runtime to wrap/extend this default executor
(for retry, tracing, metrics, etc.) without changing generated services.

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

`openapi-codegen-cli generate --input ./spec.json --output ./dist --httpClient node`

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

---

## Marauder Preview Features

> Current config schema.

**Marauder** is the preview feature set of `openapi-codegen-cli`. All features are **opt-in** and backward compatible: existing configs continue to work; new blocks are added via `update-config`.

### Why Marauder?

By default, openapi-codegen generates a client "in a vacuum": you choose the HTTP client, the validator, track spec quality, and maintain sync with the backend yourself. Marauder adds **project context**, **spec quality checks**, **incremental artifact caching**, and **multi-spec workspace helpers** — without breaking existing workflows.

| Pain | What Marauder gives | CLI / config |
|------|---------------------|--------------|
| Unclear which `httpClient` / `validationLibrary` fits your stack | Analyzes `package.json` and recommends for React, Node, RN, edge | `--auto-select` / `autoSelect` |
| Spec is "formally valid" but inconvenient for clients (cycles, duplicates, deprecated) | Per-spec and cross-spec quality report + optional CI gate | `--spec-analysis` / `specAnalysis` |
| Multi-spec monorepo: the same models are generated repeatedly | Global ReuseStore with shared artifacts (`copy` or `auto-group`) | `cacheStrategy: "reuse"`, `reuseMode` |
| Need a multi-spec summary after generate | Workspace report JSON/Markdown | `--workspace-report` / `workspaceReport` |
| Want shared-model conflicts before writes | Pre-generation stdout analysis | `--pre-analyze` / `preAnalyze` |
| Planning canary cutover between two clients | Standalone `TrafficSplitter.ts` helper | `--traffic-splitter` / `trafficSplitter` |
| Need a machine-readable multi-service index | Avatar Swarm **manifest** | `--swarm` / `swarm` |

**What Marauder does not do:**
- does not auto-fix the spec — reports only (`specAnalysis`);
- does not replace semantic diff (`analyze-diff`) or consumer code check (`analyze-usage`);
- does not switch production traffic — `trafficSplitter` only emits a helper module;
- does not restore removed top-level `heal` / `migrate` / `swarm` CLI commands (`--swarm` writes a manifest only);
- does not sync remote specs by URL.

---

### Feature map: what to choose

```
Your task
│
├─ "Don't know what to generate for our monorepo / RN / Vercel"
│     → generate --auto-select
│
├─ "Want to catch spec issues before merge / in CI"
│     → generate --spec-analysis (+ fail-on-high for gate)
│
├─ "Multiple specs — want to reuse model/schema artifacts"
│     → cache: true, cacheStrategy: "reuse" (+ optional --reuse-mode auto-group)
│
├─ "Multi-spec summary / shared-model check before writes"
│     → generate --workspace-report / --pre-analyze
│
├─ "Canary helper or Swarm manifest (codegen only)"
│     → generate --traffic-splitter / --swarm
│
└─ "Full quality gate chain"
      → analyze-diff → generate (strict + spec-analysis) → analyze-usage --diff-report
```

---

### Scenario: Automatic Selection (new frontend project)

```bash
openapi-codegen-cli update-config -ocn openapi.config.json
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --auto-select
```

**Result:** for React/Next — `fetch` + `none` (no Zod if it's not in deps).

### Scenario: Strict Selection from Existing Stack

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": true
  }
}
```

AutoSelector will choose **only** from what is already in `package.json`.

### Scenario: API Quality Control in CI

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

### Scenario: Model Reuse in Multi-Spec Monorepo

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

### Scenario: Comprehensive Spec, Client, and Usage Analytics

```bash
openapi-codegen-cli analyze-diff -i spec.yaml --compare-with spec.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json --auto-select --spec-analysis
openapi-codegen-cli analyze-usage -s ./src/api/index.ts -p . --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

### Scenario: Monorepo with Full Marauder Capabilities

A large project with multiple backend teams, each with its own spec. Combines `--auto-select`, `--spec-analysis`, reuse store, and optional Phase 2 helpers. Full example: [`example/openapi.marauder.config.json`](../../example/openapi.marauder.config.json). See also [Migration guide §10](../../MIGRATION.md).

```json
{
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "namespace",
  "reuseMode": "auto-group",
  "preAnalyze": true,
  "workspaceReport": {
    "enabled": true,
    "path": "./reports/workspace-report",
    "format": "both"
  },
  "items": [
    {
      "input": "./specs/orders.yaml",
      "output": "./generated/orders",
      "specAnalysis": { "enabled": true, "severity": "medium", "failOnHigh": true }
    },
    {
      "input": "./specs/catalog.yaml",
      "output": "./generated/catalog",
      "specAnalysis": { "enabled": true, "severity": "medium", "failOnHigh": true }
    }
  ],
  "autoSelect": { "enabled": true, "strict": true }
}
```

```bash
# CI step: spec quality gate + generation with reuse
openapi-codegen-cli analyze-diff -i specs/orders.yaml --compare-with specs/orders.base.yaml --ci
openapi-codegen-cli analyze-diff -i specs/catalog.yaml --compare-with specs/catalog.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json --pre-analyze --workspace-report
# shared models land in .openapi-codegen-store (and __shared__/ when reuseMode is auto-group)
```

**Result:** Clients share model artifacts, get stack-aware `httpClient`/`validationLibrary`, and `high`-severity spec issues block the build. Optional workspace report / pre-analyze surface cross-spec overlap before and after writes.

---

### 1. `generate --auto-select`

**Problem it solves:** Manual selection of `httpClient` and `validationLibrary` often leads to unnecessary deps, incompatibility (axios in RN/edge), and duplicated validators.

**Auto-select** reads `package.json` of the target project and applies recommendations **before** generation.

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

| Field | Default | Effect |
|-------|---------|--------|
| `enabled` | `false` | Run analysis before generate |
| `strict` | `false` | Only deps from `package.json` |
| `preferSmallBundles` | `false` | At bundle constraints → `validationLibrary: none` |
| `preferStandards` | `false` | fetch + Zod as web-standard stack |

**Scope:** `autoSelect` is **root-only** (applied to all items). Per-item `httpClient`/`validationLibrary` overrides are applied when probe recommendations differ between outputs.

**Defaults without signals:** `fetch` + `none` (validator fallback — `NONE`, not `ZOD`).

---

### 2. `generate --spec-analysis`

**Problem it solves:** OpenAPI validators catch syntax, but not **contract quality**: circular `$ref`, deeply nested schemas, inconsistent responses, ambiguous model names.

`specAnalysis` (canonical name) replaces deprecated alias `anomalyDetection`. CLI: `--spec-analysis`; deprecated alias: `--anomaly-detection`.

**Per-spec detectors:**
- `circular-schema-refs`
- `deeply-nested-schema`
- `inconsistent-response-types`
- `ambiguous-model-name`
- `deprecated-in-active-paths`
- `missing-operation-id`
- `empty-or-untyped-schema`

**Cross-spec detectors** (`crossSpec: true` by default):
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

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `false` | Run during generate |
| `severity` | `medium` | Threshold: `low` \| `medium` \| `high` |
| `reportFormat` | `json` | `json` \| `markdown` \| `html` |
| `reportPath` | `./.openapi-codegen-reports/anomaly-report.json` | Report path |
| `failOnHigh` | `false` | Fail generate on **high** severity |
| `crossSpec` | `true` | Cross-spec analysis in multi-item configs |
| `maxNestingDepth` | `5` | Threshold for deeply-nested-schema |

---

### 3. Generation cache and ReuseStore

| Strategy | Behavior |
|----------|----------|
| `entity` | Per-output `.openapi-codegen-cache.json`; skips full regen on cache hit (default after config schema migration) |
| `reuse` | Global `.openapi-codegen-store`; shared model/schema artifacts (current schema default) |
| `content` | Only `writeFileIfChanged`; no entity/reuse store |

**`reuseMode`** (when `cacheStrategy: "reuse"`):

| Value | Behavior |
|-------|----------|
| `copy` (default) | Full artifact copies into each output |
| `auto-group` | Canonical models under `{LCA}/__shared__/…` and shareable client core under `{LCA}/__shared__/core/…`, with `export * from '…'` stubs in each client |

`auto-group` requires `cacheStrategy: "reuse"`; otherwise warn + fallback to `copy`. Trivial LCA (no useful shared root among outputs) also falls back to `copy`.

**Shared core:** identical boilerplate (`ApiError`, `ApiRequestOptions`, …) is deduplicated under `__shared__/core/`. Files that differ per item stay local — notably `OpenAPI.ts` when `server`/`version` differ, and `request.ts` / executor adapters when the effective `request` differs. Effective `request` is `items[].request ??` root `request` (same as generation normalization): a root-level custom request is shared across items; a per-item override prevents cross-item sharing of that transport.

**Reuse limitations:** requires `modelsMode: "interfaces"` (default). Class mode disables artifact reuse.

---

### 4. `generate --workspace-report`

After multi-spec `generate`, writes a workspace summary as `{path}.json` and/or `{path}.md`.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --workspace-report
openapi-codegen-cli generate -ocn openapi.config.json \
  --workspace-report.format=both \
  --workspace-report.path=./reports/workspace-report
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

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `false` | Write report after generate |
| `path` | `./workspace-report` | Base path (extensions added by format) |
| `format` | `json` | `json` \| `markdown` \| `both` |

Root-oriented. Write failures are warnings; generation is not blocked.

---

### 5. `generate --traffic-splitter`

Writes a standalone `TrafficSplitter.ts` into the **first** item’s output for canary-style routing helpers. Does **not** switch live traffic or deploy clients.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --traffic-splitter
openapi-codegen-cli generate -ocn openapi.config.json --traffic-splitter.strategy=weighted
```

```json
{
  "trafficSplitter": {
    "enabled": true,
    "strategy": "weighted",
    "oldClientWeight": 80,
    "newClientWeight": 20,
    "stickySessions": true
  }
}
```

Strategies: `weighted` \| `round-robin` \| `header-based` \| `header-and-weighted`. Multi-item configs log a warning but still write the helper to the first output.

---

### 6. `generate --swarm` (manifest only)

Writes `swarm-manifest.json` (`avatars`, `sharedModels`, `operationIndex`). This is **not** the removed top-level `swarm` command — no per-avatar client scaffolding.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --swarm
openapi-codegen-cli generate -ocn openapi.config.json --swarm.output=./reports/swarm-manifest.json
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

Before any client files are written: parses items, runs cross-spec analysis, prints shared-model / conflict summary to stdout. Non-blocking; individual parse failures are warnings.

```bash
openapi-codegen-cli generate -ocn openapi.config.json --pre-analyze
```

```json
{
  "preAnalyze": true
}
```

---

### 8. Programmatic API

| Export | Purpose |
|--------|---------|
| `AutoSelector` | Project-aware selection |
| `ProjectProbe` | Shared project context probe |
| `runSpecAnalysis` | Spec quality analysis entry point |
| `CodegenSpecAnalyzer`, `CrossSpecAnalyzer` | Per-spec / cross-spec detectors |
| `ReuseStore`, `GenerationReport` | Cache store and unified report |
| `AvatarSwarmGenerator`, `writeSwarmOutput` | Swarm manifest generation |
| `TrafficSplitter`, `generateTrafficSplitterModule` | Canary helper class / generated module |
| `buildWorkspaceReport`, `writeWorkspaceReport` | Workspace summary build/write |
| `runAnomalyDetection` | Deprecated alias → `runSpecAnalysis` |

```typescript
import { AutoSelector, ProjectProbe, buildWorkspaceReport } from 'ts-openapi-codegen';
```

---

### 9. Preview limitations

- `--auto-select` — available during `generate` from `openapi.config.json` or merged multi-item configs
- `specAnalysis` — reports only; no auto-fix
- Reuse store — `modelsMode: "interfaces"` only
- `reuseMode: "auto-group"` — needs `cacheStrategy: "reuse"` and a non-trivial LCA among outputs
- `workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode` — root-oriented
- `--traffic-splitter` — helper only; no live cutover; multi-item writes to first output
- `--swarm` on `generate` ≠ restored top-level `swarm` / `heal` / `migrate`
- `preAnalyze` — advisory stdout only; no report file
- Marauder config merge — shallow spread, not recursive deep merge
- CLI dot-notation is parsed **before** Commander (`parseNestedCliOptions`)
