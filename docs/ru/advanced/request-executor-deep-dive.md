# RequestExecutor — deep dive

Edge cases и продвинутые паттерны. Основное руководство: **[request-executor.md](../request-executor.md)**.

---

## M8 — Не-HTTP transport (gRPC, GraphQL, mock bus)

| Подход | Codegen | Runtime | Когда |
|--------|---------|---------|-------|
| `customExecutorPath` | D | R1 | Adapter мапит `RequestConfig` → RPC client |
| `executorFactory` | A/C | R4 | Полная замена без regen |
| Direct inject | — | — | `new Service(customExecutor)` |

**Runtime R4:**

```typescript
const client = createClient({
  executorFactory: ({ createDefaultExecutor }) => {
    const base = createDefaultExecutor();
    return {
      async request<T>(config, options?) {
        return base.request<T>(config, options);
      },
      requestRaw<T>(config, options?) {
        return base.requestRaw<T>(config, options);
      },
    };
  },
});
```

---

## M10 — CancelablePromise

```json
{ "useCancelableRequest": true }
```

Методы сервисов возвращают `CancelablePromise<T>`. Transport должен поддерживать отмену (AbortSignal и т.д.).

---

## M11 — Нестандартные ошибки

Дефолтный стек: 4xx/5xx → `ApiError`.

### Восстановление через `onError`

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

`createLegacyRequestAdapter` без `requestRaw` — всегда `ok: true, status: 200`. Не для production-тестов error path.

---

## Ручной executor + interceptors

```typescript
import { withInterceptors } from './generated/core/interceptors/withInterceptors';

const executor = withInterceptors(baseExecutor, {
  onRequest: [(config) => ({ ...config, headers: { ...config.headers, Authorization: 'Bearer token' } })],
});

const service = new SimpleService(executor);
```

`createClient` также применяет `apiErrorInterceptor` автоматически.

---

## Ground truth в репозитории

| Сценарий | Файл |
|----------|------|
| M2 transport | `test/custom/request.ts` |
| M7 adapter | `test/custom/createExecutorAdapter.ts`, `example/executor.ts` |
| Interceptor tests | `test/requestExecutorInterceptors.test.ts` |

---

## Связанные документы

- [RequestExecutor hub](../request-executor.md)
- [Рецепты конфигов](../config-recipes.md)
- [Миграция](../migration.md)

**English:** [request-executor-deep-dive.md (EN)](../en/advanced/request-executor-deep-dive.md)
