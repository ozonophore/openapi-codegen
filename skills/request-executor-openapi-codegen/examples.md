# RequestExecutor Examples

> Full recipes: `node_modules/ts-openapi-codegen/docs/en/request-executor.md`

## 1. Standard client (M0)

```bash
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --httpClient fetch
```

```typescript
import { createClient } from './src/api';

const client = createClient({
  openApi: { BASE: process.env.API_URL ?? 'http://localhost:3000' },
});

await client.pets.getPets();
```

## 2. Auth interceptors (M6)

```typescript
const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  interceptors: {
    onRequest: [(config) => ({
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    })],
  },
});
```

## 3. Custom transport (M2)

**Config:**

```json
{
  "input": "./spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch",
  "request": "./src/api/custom/request.ts"
}
```

**Transport** (`./src/api/custom/request.ts`) — must export `request` and ideally `requestRaw`:

```typescript
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { ApiResult } from './ApiResult';
import type { TOpenAPIConfig } from './OpenAPI';

function buildUrl(options: ApiRequestOptions, config: TOpenAPIConfig): string {
  return `${config.BASE}${options.path}`;
}

export async function requestRaw<T>(
  options: ApiRequestOptions,
  config: TOpenAPIConfig,
): Promise<ApiResult<T>> {
  const url = buildUrl(options, config);
  const response = await fetch(url, {
    method: options.method,
    headers: options.headers as HeadersInit,
    body: options.body as BodyInit | undefined,
  });
  const body = (await response.json()) as T;
  return {
    url,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
  };
}

export async function request<T>(options: ApiRequestOptions, config: TOpenAPIConfig): Promise<T> {
  const result = await requestRaw<T>(options, config);
  if (!result.ok) {
    throw { status: result.status, body: result.body };
  }
  return result.body;
}
```

Regenerate, then `createClient({ openApi })`.

## 4. customExecutorPath with mapOptions (M7)

**Config:**

```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./src/api/custom/createExecutorAdapter.ts",
  "items": [{ "input": "./spec.yaml", "output": "./src/api" }]
}
```

**Adapter** — export must be named `createExecutorAdapter`:

```typescript
import type { ApiRequestOptions } from '../ApiRequestOptions';
import type { ApiResult } from '../ApiResult';
import type { TOpenAPIConfig } from '../OpenAPI';
import { OpenAPI } from '../OpenAPI';
import { request as transportRequest, requestRaw as transportRequestRaw } from '../request';
import type { RequestConfig, RequestExecutor } from './requestExecutor';

export function createExecutorAdapter<TRequestOptions extends Record<string, unknown> = Record<string, never>>(
  openApiConfig: TOpenAPIConfig = OpenAPI,
  mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,
): RequestExecutor<TRequestOptions> {
  const toApiRequestOptions = (config: RequestConfig): ApiRequestOptions => ({
    method: config.method as ApiRequestOptions['method'],
    path: config.path,
    headers: config.headers,
    query: config.query,
    body: config.body,
    cookies: config.cookies,
    mediaType: config.requestMediaType,
    responseType: config.responseType,
  });

  const merge = (config: RequestConfig, options?: TRequestOptions) => ({
    ...toApiRequestOptions(config),
    ...(mapOptions ? mapOptions(options) : {}),
  });

  return {
    request<T>(config, options) {
      return transportRequest<T>(merge(config, options), openApiConfig);
    },
    requestRaw<T>(config, options) {
      return transportRequestRaw<T>(merge(config, options), openApiConfig);
    },
  };
}
```

Runtime: `createClient({ openApi })` — adapter is wired at codegen time.

## 5. Legacy adapter (M2b, dev only)

> `requestRaw` synthesizes `ok: true, status: 200`. Dev/prototype only.

```typescript
import { createClient, createLegacyRequestAdapter } from './src/api';

const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  executorFactory: ({ openApiConfig }) => createLegacyRequestAdapter(openApiConfig),
});
```

## 6. Mock in tests (M9)

```typescript
import { PetsService } from './src/api/services/PetsService';
import type { RequestExecutor, RequestConfig } from './src/api/core/executor/requestExecutor';

const mockExecutor: RequestExecutor = {
  async request<T>(_config: RequestConfig): Promise<T> {
    return [{ id: 1, name: 'Fluffy' }] as T;
  },
  async requestRaw<T>(config: RequestConfig) {
    const body = await this.request<T>(config);
    return { url: 'http://test', ok: true, status: 200, statusText: 'OK', body };
  },
};

const pets = new PetsService(mockExecutor);
```

## Workflow

```bash
openapi-codegen-cli check-config -ocn openapi.config.json
openapi-codegen-cli preview-changes -ocn openapi.config.json
openapi-codegen-cli generate -ocn openapi.config.json
```
