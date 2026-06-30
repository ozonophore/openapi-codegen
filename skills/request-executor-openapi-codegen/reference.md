# RequestExecutor Reference

> Human docs: [docs/en/request-executor.md](../../docs/en/request-executor.md)

## RequestExecutor interface

```typescript
interface RequestExecutor<TOptions = unknown> {
  request<TResponse>(config: RequestConfig, options?: TOptions): Promise<TResponse>;
  requestRaw<TResponse>(config: RequestConfig, options?: TOptions): Promise<ApiResult<TResponse>>;
}
```

## RequestConfig fields

| Field | Type | Description |
|-------|------|-------------|
| `method` | `string` | HTTP method |
| `path` | `string` | URL path (relative to BASE) |
| `headers` | `Record<string, string>` | Request headers |
| `query` | `Record<string, any>` | Query parameters |
| `body` | `unknown` | Request body |
| `requestMediaType` | `string` | Content-Type |
| `responseType` | `'blob'` | Blob response handling |
| `cookies` | `Record<string, string>` | Cookies |

## ApiResult / ApiError / Interceptors / createClient

See [reference tables in hub](../../docs/en/request-executor.md) and type definitions in generated `core/executor/requestExecutor.ts`.

## Codegen config fields

| Field | CLI flag | Default | Description |
|-------|----------|---------|-------------|
| `httpClient` | `--httpClient` | `fetch` | Transport template |
| `request` | `--request` | — | Custom transport path |
| `customExecutorPath` | `--customExecutorPath` | — | Custom `createExecutorAdapter` |
| `useCancelableRequest` | `--useCancelableRequest` | `false` | CancelablePromise |

## Implementation map

| Concern | Source |
|---------|--------|
| Adapter template | `src/templates/client/core/executor/createExecutorAdapter.hbs` |
| Service codegen | `src/templates/client/exportService.hbs` |
| validateExecutorSetup | `src/cli/checkAndUpdateConfig/utils/validateExecutorSetup.ts` |
| Snapshots | `test/__snapshots__/v3/` |

## Related

- [SKILL.md](SKILL.md) — agent cheatsheet
- [examples.md](examples.md) — code snippets
- [example/REQUEST_EXECUTION_ARCHITECTURE.md](../../example/REQUEST_EXECUTION_ARCHITECTURE.md)
