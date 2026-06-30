# Config recipes

Copy-paste patterns for common `openapi.config.json` setups. HTTP recipes (5–9) link to the [RequestExecutor hub](request-executor.md) for runtime code and troubleshooting.

## HTTP execution (start here if upgrading)

| # | Recipe | Hub scenario |
|---|--------|--------------|
| 5 | [Default HTTP](#5-default-http-fetchaxios) | M0 |
| 6 | [Keep custom transport](#6-keep-custom-transport) | M2 |
| 6b | [Legacy transport, no requestRaw](#6b-legacy-transport-no-requestraw) | M2b |
| 7 | [Custom adapter (ky, mapOptions)](#7-custom-adapter) | M7 |
| 7b | [Incompatible transport signature](#7b-incompatible-transport-signature) | M3/M4 |
| 8 | [Auth/logging without regen](#8-authlogging-without-regen) | M6 |
| 9 | [Mock in tests](#9-mock-in-tests) | M9 |

---

## 5. Default HTTP (fetch/axios)

**When:** new project, no custom HTTP layer.

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch"
}
```

Runtime: see [M0 in request-executor.md](request-executor.md#m0--default-client).

---

## 6. Keep custom transport

**When:** existing `request.ts` with `(ApiRequestOptions, TOpenAPIConfig)` signature.

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch",
  "request": "./src/api/custom/request.ts"
}
```

Add `requestRaw` returning `ApiResult<T>` for production `methodRaw()` support. See [M2](request-executor.md#m2--keep-custom-transport).

---

## 6b. Legacy transport, no requestRaw

**When:** temporary dev migration; transport has only `request()`, no `requestRaw`.

Config same as recipe 6. Runtime uses `createLegacyRequestAdapter` — see [M2b](request-executor.md#m2b--legacy-transport-without-requestraw). **Not for production** (synthetic status 200).

---

## 7. Custom adapter

**When:** ky, custom error handling, or `mapOptions` for per-request options.

```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./src/api/custom/createExecutorAdapter.ts",
  "items": [
    {
      "input": "./openapi/spec.yaml",
      "output": "./src/api"
    }
  ]
}
```

Module must export `function createExecutorAdapter`. Example: [example/executor.ts](../../example/executor.ts). See [M7](request-executor.md#m7--custom-adapter-ky--mapoptions).

---

## 7b. Incompatible transport signature

**When:** old transport uses `(url, options)` or axios-style config instead of `ApiRequestOptions`.

**Option A — shim in transport file** (keep `"request"` in config):

```json
{
  "request": "./src/api/custom/request.ts",
  "httpClient": "fetch",
  "input": "./openapi/spec.yaml",
  "output": "./src/api"
}
```

Rewrite exports to canonical `(ApiRequestOptions, TOpenAPIConfig)`.

**Option B — custom adapter** (recipe 7): map `RequestConfig` → your old format inside `createExecutorAdapter`. See [M3/M4](request-executor.md#scenario-picker-m0m12).

---

## 8. Auth/logging without regen

**When:** add headers, tokens, or logging at runtime — no config change.

No special config keys. Use `createClient({ interceptors })` — see [M6](request-executor.md#m6--auth-without-regen).

---

## 9. Mock in tests

**When:** unit tests for a single service.

No config change. Inject mock `RequestExecutor` — see [M9](request-executor.md#m9--mock-executor-in-tests).

---

## Other recipes

### 1. Single spec, validation schemas (Zod)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "httpClient": "fetch",
  "validationLibrary": "zod",
  "emptySchemaStrategy": "keep"
}
```

### 2. Multi-spec monorepo

```json
{
  "httpClient": "fetch",
  "output": "./packages/shared-api",
  "items": [
    { "input": "./openapi/users.yaml", "output": "./packages/users-api" },
    { "input": "./openapi/orders.yaml", "output": "./packages/orders-api" }
  ]
}
```

Shared transport (M12): add root `"request": "./shared/request.ts"`.

### 3. History-aware generation (diff report)

```json
{
  "input": "./openapi/current.yaml",
  "output": "./src/api",
  "useHistory": true,
  "diffReport": "./.openapi-codegen-reports/openapi-diff-report.json"
}
```

Generate report first: `openapi-codegen-cli analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml`.

### 4. Models as classes (DTO/Raw)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "modelsMode": "classes"
}
```

### 10. Generation cache (entity strategy)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "cache": true,
  "cacheStrategy": "entity",
  "cachePath": ".openapi-codegen-cache.json"
}
```

### 11. Prettier + ESLint after generate

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "prettierConfigPath": "./.prettierrc",
  "tsconfigPath": "./tsconfig.json",
  "eslintConfigPath": "./eslint.config.mjs"
}
```

Both `tsconfigPath` and `eslintConfigPath` are required for batch ESLint fix.

### 12. Plugins

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "plugins": ["./plugins/custom-type.plugin.cjs"]
}
```

See [plugins.md](plugins.md).

### 13. Marauder preview (auto-select + spec analysis)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "autoSelect": { "enabled": true, "strict": false },
  "specAnalysis": { "enabled": true, "severity": "medium" }
}
```

See [Marauder user guide](../MARAUDER_USER_GUIDE.md).

### 14. Reuse store (global cache)

```json
{
  "input": "./openapi/spec.yaml",
  "output": "./src/api",
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "fail"
}
```

---

## Related

- [Configuration reference](configuration-reference.md) — full key list
- [RequestExecutor hub](request-executor.md) — HTTP decision tree and FAQ
- [Getting started](getting-started.md) — first client
