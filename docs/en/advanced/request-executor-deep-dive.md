# RequestExecutor — deep dive

Edge cases and advanced patterns. For the main guide see **[request-executor.md](../request-executor.md)**.

---

## M8 — Non-HTTP transports (gRPC, GraphQL, mock bus)

When HTTP is not the wire protocol, replace or wrap the executor at **codegen** or **runtime**:

| Approach | Codegen | Runtime | When |
|----------|---------|---------|------|
| `customExecutorPath` | D | R1 | Adapter maps `RequestConfig` → your RPC client |
| `executorFactory` | A/C | R4 | Full swap without regen (A/B test, feature flag) |
| Direct inject | — | — | `new Service(customExecutor)` for one-off tools |

**Runtime R4 example** (wrap default):

```typescript
import { createClient } from './generated';
import type { RequestExecutor, RequestConfig } from './generated/core/executor/requestExecutor';

const client = createClient({
  executorFactory: ({ createDefaultExecutor }) => {
    const base = createDefaultExecutor();
    return {
      async request<T>(config: RequestConfig, options?) {
        // route to gRPC, GraphQL, etc.
        return base.request<T>(config, options);
      },
      requestRaw<T>(config, options?) {
        return base.requestRaw<T>(config, options);
      },
    };
  },
});
```

For a completely custom stack, implement `RequestExecutor` directly and pass to `new Service(executor)` or return from `executorFactory`.

---

## M10 — CancelablePromise

Enable in config:

```json
{
  "useCancelableRequest": true
}
```

All service methods return `CancelablePromise<T>` instead of `Promise<T>`.

**Requirements:**

- Transport must support cancellation (AbortSignal on fetch, axios cancel token, etc.)
- Custom adapter must propagate cancel semantics if using `customExecutorPath`

Verify generated `core/request.ts` for your `httpClient` before relying on cancel in production.

---

## M11 — Non-standard errors

Default stack: 4xx/5xx → throw `ApiError` via `catchErrors` + `apiErrorInterceptor`.

### Custom transport throws `{ status, body }`

Works with default `apiErrorInterceptor` → normalized `ApiError`.

### Error body without throw (ky, etc.)

Custom adapter returns `ApiResult` with `ok: false`. Options:

1. Map in adapter's `request()` to throw `{ status, body }`
2. Handle in `onResponse` interceptor (receives body for `method()`, `ApiResult` for `methodRaw()`)
3. Use `onError` with `RequestRecovery<T>` for selective recovery

```typescript
import { RequestRecovery } from './generated/core/interceptors/RequestRecovery';

createClient({
  interceptors: {
    onError: [
      (error) => {
        if (error.status === 404) {
          return new RequestRecovery({ items: [] });
        }
        throw error;
      },
    ],
  },
});
```

### Synthetic ApiResult (legacy adapter)

`createLegacyRequestAdapter` without real `requestRaw` always reports `ok: true, status: 200`. Do not use for error-path testing in production.

---

## Manual executor + interceptors

When not using `createClient`, wrap executor manually:

```typescript
import { withInterceptors } from './generated/core/interceptors/withInterceptors';
import { SimpleService } from './generated/services/SimpleService';

const executor = withInterceptors(baseExecutor, {
  onRequest: [(config) => ({ ...config, headers: { ...config.headers, Authorization: 'Bearer token' } })],
});

const service = new SimpleService(executor);
```

Note: `createClient` also applies `apiErrorInterceptor` automatically; manual setup should include equivalent error handling if needed.

---

## Ground truth in repo

| Scenario | File |
|----------|------|
| Transport + `requestRaw` (M2) | `test/custom/request.ts` |
| Custom adapter + `mapOptions` (M7) | `test/custom/createExecutorAdapter.ts` |
| Ky adapter (D + R1) | `example/executor.ts` |
| Interceptor tests | `test/requestExecutorInterceptors.test.ts` |
| Generated snapshots | `test/__snapshots__/v3/` |

---

## Related

- [RequestExecutor hub](../request-executor.md)
- [Config recipes](../config-recipes.md)
- [Migration guide](../migration.md)
