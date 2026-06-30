# RequestExecutor — HTTP execution hub

> **Canonical guide** for configuring and using HTTP execution in generated clients (2.0.0+).
> For migration from 1.x, start with the [decision tree](#quick-decision-tree) or [migration guide](migration.md).

## TL;DR — 30 seconds

**Default (no custom HTTP):** generate a client, then:

```typescript
import { createClient } from './generated';

const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
});

await client.pets.getPets();
```

Nothing else is required — `createClient` builds a default executor with interceptors.

**Custom HTTP:** answer two questions:

1. Do you have a custom `request.ts` or non-standard transport?
2. Do you need ky, per-request options, auth without regen, or mocks?

→ Use the [decision tree](#quick-decision-tree) and [scenario picker](#scenario-picker-m0m12) below.

---

## Glossary

| Term | What it is | Where it lives |
|------|------------|----------------|
| **Transport** | Low-level HTTP functions `request` / `requestRaw` taking `ApiRequestOptions` | Generated `core/request.ts` (or your file copied there) |
| **Adapter** | Bridges `RequestConfig` → transport; factory `createExecutorAdapter` | Generated `core/executor/createExecutorAdapter.ts` |
| **Executor** | Contract `RequestExecutor` with `request()` / `requestRaw()` taking `RequestConfig` | Generated `core/executor/requestExecutor.ts` |
| **Service** | Generated API class; calls executor, not transport directly | `services/*.ts` |

**Two different "request" names:**

| Name | Meaning |
|------|---------|
| Config key `"request"` | Path to your **transport** module; copied to `core/request.ts` at codegen time |
| Method `executor.request()` | Returns parsed **response body** on success |

**Config keys — when to use which:**

| Key | Layer | When |
|-----|-------|------|
| `httpClient` | Transport template | Choose fetch / xhr / axios / node (default: fetch) |
| `"request"` | Custom transport | Keep existing `request.ts` with canonical signature |
| `customExecutorPath` | Custom adapter | ky, `mapOptions`, bypass default transport mapping |
| `executorFactory` (runtime) | Full executor swap | gRPC bridge, mock bus, legacy adapter — **no regen** |

---

## Four-layer stack

```
Service.method() / methodRaw()
  → RequestExecutor.request / requestRaw       (contract: RequestConfig)
    → createExecutorAdapter                    (bridge: RequestConfig → ApiRequestOptions)
      → core/request.ts request / requestRaw   (transport: fetch|xhr|axios|node|custom)
```

| Layer | Input | `request` output | `requestRaw` output |
|-------|-------|------------------|---------------------|
| Transport | `ApiRequestOptions`, `TOpenAPIConfig` | `Promise<T>` | `Promise<ApiResult<T>>` |
| Adapter | `RequestConfig`, `TOptions?` | delegates | delegates |
| Executor | `RequestConfig`, `TOptions?` | `Promise<T>` | `Promise<ApiResult<T>>` |
| Service | via executor | `getPets()` | `getPetsRaw()` |

**Diagnostic rule:** transport incompatibility ≠ RequestExecutor incompatibility. If your old `request()` has a different signature, fix at the **transport** layer (shim or rewrite). `createLegacyRequestAdapter` still calls `request` from `core/request.ts` — it cannot bridge a non-canonical transport signature.

---

## Quick decision tree

```
What do you need?
├─ Standard client, no custom HTTP
│    → generate --httpClient fetch + createClient({ openApi })
├─ Keep old custom request() transport
│    → config "request": "./path/to/request.ts" (see M2)
├─ Custom adapter (ky, mapOptions)
│    → config "customExecutorPath" (see M7)
├─ Auth / logging / retry without regen
│    → createClient({ interceptors }) or executorFactory wrap (see M6)
├─ Typed per-request options
│    → customExecutorPath + mapOptions (see M7)
├─ Mock API in tests
│    → new Service(mockExecutor) (see M9)
├─ Need status / url / headers on success
│    → service.methodRaw(), not method()
└─ Validate config before regen
     → check-config → preview-changes → generate
```

### Custom request / executor branch (M2–M5)

```
Has custom request or executor?
├─ No → M0: generate + createClient
└─ Yes → Transport input = (ApiRequestOptions, TOpenAPIConfig)?
         ├─ No → M3 or M4: shim in request.ts OR customExecutorPath / executorFactory
         └─ Yes → Has requestRaw returning ApiResult?
                  ├─ Yes → M2: "request" in config, regen
                  ├─ No, will add → M2: add requestRaw (see test/custom/request.ts)
                  └─ No, won't add → M2b: createLegacyRequestAdapter (dev only, status 200)
```

---

## Scenario picker (M0–M12)

Two incompatibility axes — check before recommending `customExecutorPath`:

| Axis | Question | Compatible means |
|------|----------|------------------|
| **Input** | Does transport accept `(ApiRequestOptions, TOpenAPIConfig)`? | Default adapter works without shim |
| **Output Raw** | Does `requestRaw` return `ApiResult<T>`? | `getXxxRaw()` exposes real status/url |

| ID | Situation | Config keys | Runtime code | Codegen | Runtime |
|----|-----------|-------------|--------------|---------|---------|
| **M0** | New project | `httpClient` only | `createClient({ openApi })` | A | R1 |
| **M1** | App called `request()` directly | regen | `createClient()` replaces direct calls | A | R1 |
| **M2** | Custom transport, compatible input, no `requestRaw` | `"request": "./path"` | `createClient({ openApi })` | C | R1 |
| **M2b** | Won't add `requestRaw` | `"request": "./path"` | `executorFactory` → `createLegacyRequestAdapter` | C | R5 |
| **M3** | Incompatible input (axios config, url+opts) | `"request"` or shim | shim or `customExecutorPath` | C/D | R1/R4 |
| **M4** | Incompatible input + raw output | `customExecutorPath` | mappers both ways or `executorFactory` | D | R4 |
| **M5** | Compatible input, raw not `ApiResult` | `"request"` or `customExecutorPath` | fix `requestRaw` in transport | C/D | R1 |
| **M6** | Auth, logging, retry without regen | — | `createClient({ interceptors })` | A/C | R2 |
| **M7** | Per-request options (`TOptions`) | `customExecutorPath` | `createClient` + `mapOptions` | D/E | R1 |
| **M8** | Non-HTTP (gRPC, GraphQL, mock bus) | `customExecutorPath` | `executorFactory` or direct inject | D | R4 |
| **M9** | Tests / single service | — | `new FooService(mockExecutor)` | — | inject |
| **M10** | CancelablePromise | `useCancelableRequest: true` | verify transport supports cancel | F | R1 |
| **M11** | Non-standard errors | — | `onError` + `RequestRecovery`; transport throws `{ status, body }` | * | R2 |
| **M12** | Monorepo shared transport | one `"request"`, multiple outputs | `openApi.BASE` per env | C | R1 |

**Path A vs B:** choose **A** (shim/adapter) when ≥80% of old transport logic is reused; choose **B** (custom executor) when the wrapper is harder than a rewrite or transport is non-HTTP.

See [config recipes](config-recipes.md) for copy-paste JSON examples.

---

## Codegen matrix (A–F)

| # | `httpClient` | `request` | `customExecutorPath` | `useCancelableRequest` | Result |
|---|--------------|-----------|----------------------|------------------------|--------|
| A | fetch (default) | — | — | false | Default transport + default adapter |
| B | xhr / axios / node | — | — | * | Same stack, different transport template |
| C | any | `./custom/request.ts` | — | * | Transport copied → `core/request.ts`; default adapter |
| D | any | — | `./custom/createExecutorAdapter.ts` | * | Adapter copied; may bypass transport (ky). `core/request.ts` still generated but may be unused |
| E | any | `./custom/request.ts` | `./custom/adapter.ts` | * | Both copied; typical for `mapOptions` |
| F | any | * | * | true | All methods return `CancelablePromise` |

| Field | CLI flag | Notes |
|-------|----------|-------|
| `httpClient` | `--httpClient` | `fetch` \| `xhr` \| `axios` \| `node` |
| `request` | `--request` | Custom **transport** copied to `core/request.ts` |
| `customExecutorPath` | `--customExecutorPath` | Module exporting **`createExecutorAdapter`** |
| `useCancelableRequest` | `--useCancelableRequest` | `ExecutorReturn<T>` = `CancelablePromise<T>` |

**Critical:** `request` = transport; `customExecutorPath` = adapter factory. They combine (variant E).

**Codegen D ≠ Runtime R4:** `customExecutorPath` (D) replaces the adapter at **codegen** — runtime stays R1. Example: ky via `example/executor.ts` → **D + R1**. Runtime R4 is `executorFactory` in `createClient` — full executor swap **without regen**.

```bash
openapi-codegen-cli generate -i ./spec.yaml -o ./src/api --httpClient fetch
openapi-codegen-cli check-config -ocn openapi.config.json
openapi-codegen-cli preview-changes -ocn openapi.config.json
openapi-codegen-cli generate -ocn openapi.config.json
```

---

## Runtime matrix (R1–R5)

| # | `openApi` | `interceptors` | `executorFactory` | Behavior |
|---|-----------|----------------|-------------------|----------|
| R1 | BASE, TOKEN… | — | — | Default executor + always `withInterceptors` + `apiErrorInterceptor` |
| R2 | * | onRequest / onResponse / onError | — | Interceptor chains on default executor |
| R3 | * | — | wrap default | Logging, retry, tracing without regen |
| R4 | * | * | replace → custom | Full runtime executor swap (gRPC, mock bus) |
| R5 | * | * | → `createLegacyRequestAdapter` | Soft migration when transport lacks `requestRaw` |

```typescript
const client = createClient({
  openApi?: Partial<TOpenAPIConfig>,
  interceptors?: { onRequest?, onResponse?, onError? },
  executorFactory?: ({ openApiConfig, createDefaultExecutor }) => RequestExecutor,
});
```

**Breaking (2.1.0-beta.10):** `createClient` **always** wraps executor in `withInterceptors` — even without custom interceptors. `apiErrorInterceptor` is **always** prepended to `onError`.

Services: `getXxx()` → body; `getXxxRaw()` → `ApiResult<T>`.

---

## Copy-paste recipes

### M0 — Default client

**Config:**

```json
{
  "input": "./spec.yaml",
  "output": "./generated",
  "httpClient": "fetch"
}
```

**Runtime:**

```typescript
import { createClient } from './generated';

const client = createClient({
  openApi: { BASE: process.env.API_URL ?? 'https://api.example.com' },
});

await client.users.getUser({ userId: '1' });
```

### M2 — Keep custom transport

**Config:**

```json
{
  "input": "./spec.yaml",
  "output": "./generated",
  "httpClient": "fetch",
  "request": "./src/api/custom/request.ts"
}
```

Your transport must export `request` and ideally `requestRaw` with signature `(options: ApiRequestOptions, config: TOpenAPIConfig)`. See `test/custom/request.ts` in the repo.

Regenerate, then use `createClient({ openApi })` as in M0.

### M2b — Legacy transport without `requestRaw`

> **Warning:** `requestRaw` synthesizes `ok: true, status: 200` always. Dev/prototype only — not for production.

**Config:** same as M2 (`"request": "./path"`).

**Runtime:**

```typescript
import { createClient, createLegacyRequestAdapter } from './generated';

const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  executorFactory: ({ openApiConfig }) => createLegacyRequestAdapter(openApiConfig),
});
```

Prefer adding `requestRaw` to your transport (M2) for production.

### M6 — Auth without regen

```typescript
const client = createClient({
  openApi: { BASE: 'https://api.example.com' },
  interceptors: {
    onRequest: [
      (config) => ({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    ],
  },
});
```

### M7 — Custom adapter (ky + mapOptions)

**Config:**

```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./example/executor.ts",
  "items": [{ "input": "./spec.yaml", "output": "./generated" }]
}
```

Export must be named `createExecutorAdapter`. Full example: `example/executor.ts`.

**Runtime:** `createClient({ openApi })` — adapter is wired at codegen time.

### M9 — Mock executor in tests

```typescript
import { PetsService } from './generated/services/PetsService';
import type { RequestExecutor, RequestConfig } from './generated/core/executor/requestExecutor';

const mockExecutor: RequestExecutor = {
  async request<T>(_config: RequestConfig): Promise<T> {
    return { id: 1, name: 'Fluffy' } as T;
  },
  async requestRaw<T>(config: RequestConfig) {
    const body = await this.request<T>(config);
    return { url: 'http://test', ok: true, status: 200, statusText: 'OK', body };
  },
};

const pets = new PetsService(mockExecutor);
```

---

## method() vs methodRaw() vs ApiError

| Level | `request` | `requestRaw` |
|-------|-----------|--------------|
| Transport | `Promise<T>` body | `Promise<ApiResult<T>>` |
| Executor | `ExecutorReturn<T>` | `ExecutorReturn<ApiResult<T>>` |
| Service | `getPets()` | `getPetsRaw()` |

- Use **`method()`** for typed body on **successful** responses (most calls).
- Use **`methodRaw()`** for `status` / `ok` / `url` on **successful** responses (2xx, including 204).

**HTTP errors (4xx/5xx):** on the default fetch transport, both `request` and `requestRaw` throw **`ApiError`** — callers do not receive `ApiResult` with `ok: false`. Custom adapters (e.g. ky with `throwHttpErrors: false` in `example/executor.ts`) can return error results without throwing.

**ApiError shape (2.1.0-beta.10):** slim `request` config; response payload in `error.body` (not full `ApiRequestOptions` in `request`).

**Interceptors:** `onResponse` for `method()` receives **body**; for `methodRaw()` receives **ApiResult**.

**Error recovery in `onError`:** return `new RequestRecovery<T>(value)` — not bare `return`.

---

## init --requestFormat

Scaffolds custom HTTP layers when running `openapi-codegen-cli init --request ./path`:

| Value | Scaffolds | Sets in config |
|-------|-----------|----------------|
| `transport` (default) | Legacy `request` + `requestRaw` | `"request"` |
| `adapter` | `createExecutorAdapter` module | `"customExecutorPath"` |
| `executor` | Standalone `RequestExecutor` object | for direct `new Service(executor)` — **not** `customExecutorPath` |

CLI scaffold `customExecutor` is for `new Service(customExecutor)` — **not** for the `customExecutorPath` config key.

---

## check-config workflow

Run before every regen when using custom HTTP:

```bash
openapi-codegen-cli check-config --openapi-config ./openapi.config.json
```

### Warning messages → action

| Warning | Meaning | Action |
|---------|---------|--------|
| `request file not found: ./path` | Config points to missing transport file | Fix path or create file; run from project root (paths resolve relative to cwd) |
| `customExecutorPath file not found: ./path` | Missing adapter module | Fix path or run `init --requestFormat adapter` |
| `customExecutorPath should export function createExecutorAdapter` | Wrong export name or missing export | Rename export to `createExecutorAdapter` matching generated signature |
| `items[N]: request file not found` | Per-item override path invalid | Fix path in `items[N]` |

Warnings are **non-fatal** — generation may still run, but output will be wrong or fail at runtime.

Recommended chain: `check-config` → fix warnings → `preview-changes` → `generate`.

---

## FAQ / Troubleshooting

### "Services need RequestExecutor in constructor"

Generated services (2.0+) take a `RequestExecutor` in the constructor. Use **`createClient()`** — it builds the executor and wires all services:

```typescript
const client = createClient({ openApi: { BASE: '...' } });
await client.myService.myMethod();
```

Or inject manually: `new MyService(executor)`.

### "Difference between `request` and `customExecutorPath`?"

- **`request`** — custom **transport** (`request`/`requestRaw` with `ApiRequestOptions`), copied to `core/request.ts`
- **`customExecutorPath`** — custom **`createExecutorAdapter`** factory, copied to `core/executor/createExecutorAdapter.ts`
- They can be combined (codegen variant E)

### "`createClient` wraps interceptors I didn't ask for"

Expected since 2.1.0-beta.10: `withInterceptors` + `apiErrorInterceptor` are always applied. Custom interceptors chain after the default error handler.

### "`customExecutorPath` not found at runtime"

The file is **copied at codegen time**, not imported at runtime. Regenerate after changing the source file. Point config at the **source** path before `generate`.

### "`requestRaw` returns status 200 always"

You're on **M2b** (`createLegacyRequestAdapter`) or a transport without real `requestRaw`. Add `requestRaw` to your transport (M2) for production.

### "Where is RequestExecutor imported from?"

From the **generated** client (`./generated/core/executor/requestExecutor`) — not from `ts-openapi-codegen` / `openapi-codegen-cli`.

---

## Before/After migration examples

### 1.x — service calling `request()` directly

**Before:**

```typescript
import { request } from './generated/core/request';
import { OpenAPI } from './generated/core/OpenAPI';

const data = await request({ method: 'GET', path: '/pets' }, OpenAPI);
```

**After:**

```typescript
import { createClient } from './generated';

const client = createClient({ openApi: { BASE: OpenAPI.BASE } });
const data = await client.pets.getPets();
```

### Custom transport — minimal diff

1. Keep your transport file; ensure signature `(ApiRequestOptions, TOpenAPIConfig)`.
2. Add `"request": "./path/to/request.ts"` to config.
3. `openapi-codegen-cli generate -ocn openapi.config.json`
4. Replace direct `request()` calls with `createClient({ openApi })`.

---

## Related docs

- [Getting started](getting-started.md) — first client with `createClient`
- [Config recipes](config-recipes.md) — JSON recipes 5–9 (HTTP cluster)
- [Migration guide](migration.md) — Path B checklist for upgraders
- [Configuration reference](configuration-reference.md) — all config keys
- [CLI reference](cli-reference.md) — all commands including `check-config`
- [RequestExecutor deep dive](advanced/request-executor-deep-dive.md) — M8, M10, M11 edge cases

**Agent-optimized cheatsheet:** [skills/request-executor-openapi-codegen/SKILL.md](../../skills/request-executor-openapi-codegen/SKILL.md)

**Русская версия:** [request-executor.md (RU)](../ru/request-executor.md)
