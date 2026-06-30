# Getting started

Generate a TypeScript client from an OpenAPI spec and call it with `createClient` — no custom HTTP setup required.

## Prerequisites

- Node.js (see [package.json](../package.json) for minimum version)
- An OpenAPI 2.x or 3.x spec (JSON or YAML)

## Install

```bash
npm install ts-openapi-codegen --save-dev
```

The CLI binary is **`openapi-codegen-cli`** (also available via `npx ts-openapi-codegen`).

## Step 1 — Generate

**One-off:**

```bash
npx openapi-codegen-cli generate \
  --input ./openapi/spec.yaml \
  --output ./src/api \
  --httpClient fetch
```

**With config file** (recommended for teams):

```bash
npx openapi-codegen-cli init
# edit openapi.config.json, then:
npx openapi-codegen-cli generate --openapi-config ./openapi.config.json
```

Minimal config:

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch"
}
```

## Step 2 — Create a client

Generated code exports `createClient`. Pass runtime settings via `openApi`:

```typescript
import { createClient } from './src/api';

const client = createClient({
  openApi: {
    BASE: 'https://api.example.com',
    // TOKEN, HEADERS, WITH_CREDENTIALS, … as needed
  },
});

// Services are properties on the client object
const pets = await client.pets.getPets();
```

`createClient`:

- Builds a default `RequestExecutor` (fetch transport + adapter)
- Wraps it with interceptors (including default error handling)
- Returns an object with all generated services wired up

You do **not** need to pass a `RequestExecutor` manually when using `createClient`.

## Step 3 — Call API methods

| Method | Returns | Use when |
|--------|---------|----------|
| `service.method()` | Parsed response body | Normal API calls (2xx) |
| `service.methodRaw()` | `ApiResult<T>` (status, url, body) | Need status/headers on success |

HTTP errors (4xx/5xx) throw `ApiError` on the default stack.

## Custom HTTP?

If you have a custom `request.ts`, use ky/axios wrappers, need auth without regenerating, or `check-config` shows executor warnings:

→ **[RequestExecutor hub](request-executor.md)** — decision tree and scenarios M0–M12.

## Next steps

| Goal | Doc |
|------|-----|
| Config file patterns | [Config recipes](config-recipes.md) |
| All config keys | [Configuration reference](configuration-reference.md) |
| Upgrade from 1.x | [Migration guide](migration.md) |
| All CLI commands | [CLI reference](cli-reference.md) |
| Plugins, cache, diff reports | [Features](features.md) |

## Validate config before regen

```bash
npx openapi-codegen-cli check-config --openapi-config ./openapi.config.json
npx openapi-codegen-cli preview-changes --openapi-config ./openapi.config.json
```

See [RequestExecutor hub § check-config](request-executor.md#check-config-workflow) for warning decode.
