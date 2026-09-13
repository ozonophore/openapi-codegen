## Context

Grill for 2.1.0 left `createLegacyRequestAdapter` unwired (Upgrade page path 3: wire `executorFactory` yourself) and parked compile-without-`requestRaw`. Default `createExecutorAdapter` always imports `requestRaw`. `exportClient.hbs` ignores `useCustomRequest`. Users with config `request` and no `customExecutorPath` get a client that does not compile or that calls the legacy transport with the wrong adapter.

## Goals / Non-Goals

**Goals:**

- Auto-wire `createLegacyRequestAdapter` as `createDefaultExecutor` when `request` is set and `customExecutorPath` is not.
- Default generated `createExecutorAdapter` compiles if the copied `request` file has no `requestRaw` (synthetic `ApiResult` like the legacy adapter).
- `customExecutorPath` still wins for both the copied file and `createClient`.
- Upgrade page path 3 matches HEAD.

**Non-Goals:**

- Detecting a `request(RequestConfig, options)` transport and calling it with that signature. That remains `customExecutorPath`.
- Auto-importing `createLegacyRequestAdapter` when `customExecutorPath` is set.
- Removing `executorFactory`.
- Changing slim `ApiError.request`.

## Decisions

1. **Legacy adapter is the default only for `request` without `customExecutorPath`.** `customExecutorPath` is the new-contract path. Mixing both: copy the executor file and keep `createExecutorAdapter` on `createClient`.

2. **`createExecutorAdapter` still exists** when using a custom `request`. It must compile: omit the `requestRaw` import when the transport has none; synthesize `requestRaw` like `legacyRequestAdapter.hbs`. Default generated `request.ts` always exports `requestRaw` — omit only when `hasCustomRequest && !useCustomRequestRaw`.

3. **`useCustomRequest` on the client template becomes `useLegacyRequestAdapter`.** Same boolean as decision 1. Dead `useCustomRequest` that `exportClient.hbs` ignored is dropped.

## Risks / Trade-offs

- [Someone already wraps `createDefaultExecutor` expecting `createExecutorAdapter`] → `createDefaultExecutor` now returns the legacy adapter for custom `request`. That is the intended default; `executorFactory` can still return `createExecutorAdapter(...)`.
- [RequestConfig-shaped custom `request`] → still wrong at runtime if they only set `request`. Upgrade page keeps path 2 (`customExecutorPath`).

## Migration Plan

Contract change on the 2.1.0 Upgrade page. Regen. Users with only `request` (legacy signature) should compile without adding `executorFactory`. Users who already pass `executorFactory` keep that override.
