# RequestExecutor Reference

> Human docs: `node_modules/ts-openapi-codegen/docs/en/request-executor.md`

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

## ApiResult

```typescript
interface ApiResult<T> {
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  body: T;
}
```

## ApiError (2.1.0-beta.10+)

Slim `request` config; response payload in `error.body`.

## createClient options

```typescript
createClient({
  openApi?: Partial<TOpenAPIConfig>,
  interceptors?: { onRequest?, onResponse?, onError? },
  executorFactory?: ({ openApiConfig, createDefaultExecutor }) => RequestExecutor,
});
```

Always wraps executor with `withInterceptors` + `apiErrorInterceptor`.

## Codegen config fields

| Field | CLI flag | Default | Description |
|-------|----------|---------|-------------|
| `httpClient` | `--httpClient` | `fetch` | Transport template: `fetch`, `xhr`, `axios`, `node` |
| `request` | `--request` | — | Custom transport path → copied to `{output}/core/request.ts` |
| `customExecutorPath` | `--customExecutorPath` | — | Custom `createExecutorAdapter` → copied to `{output}/core/executor/` |
| `useCancelableRequest` | `--useCancelableRequest` | `false` | Methods return `CancelablePromise` |

## check-config warnings

| Warning | Action |
|---------|--------|
| `request file not found: …` | Fix path relative to cwd |
| `customExecutorPath file not found: …` | Fix path or `init --requestFormat adapter` |
| `customExecutorPath should export function createExecutorAdapter` | Rename export |
| `items[N]: …` | Fix per-item override |

## init --requestFormat

| Value | Config key set |
|-------|----------------|
| `transport` (default) | `"request"` |
| `adapter` | `"customExecutorPath"` |
| `executor` | Standalone executor for `new Service(executor)` — not `customExecutorPath` |

## Related

- [SKILL.md](SKILL.md) — agent cheatsheet
- [examples.md](examples.md) — inline code snippets
