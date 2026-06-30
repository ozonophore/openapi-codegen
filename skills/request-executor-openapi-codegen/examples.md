# RequestExecutor Examples

> Full recipes: [docs/en/request-executor.md](../../docs/en/request-executor.md)

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

```json
{ "request": "./src/api/custom/request.ts", "httpClient": "fetch", "input": "./spec.yaml", "output": "./src/api" }
```

See `test/custom/request.ts`.

## 4. customExecutorPath (M7)

```json
{ "customExecutorPath": "./example/executor.ts" }
```

See `example/executor.ts`.

## 5. Legacy adapter (M2b, dev only)

```typescript
import { createClient, createLegacyRequestAdapter } from './src/api';

const client = createClient({
  executorFactory: ({ openApiConfig }) => createLegacyRequestAdapter(openApiConfig),
});
```

## 6. Mock in tests (M9)

```typescript
const mockExecutor: RequestExecutor = {
  request: vi.fn().mockResolvedValue([{ id: 1 }]),
  requestRaw: vi.fn(),
};
const service = new PetsService(mockExecutor);
```

## Workflow

```bash
openapi-codegen-cli check-config -ocn openapi.config.json
openapi-codegen-cli preview-changes -ocn openapi.config.json
openapi-codegen-cli generate -ocn openapi.config.json
```
