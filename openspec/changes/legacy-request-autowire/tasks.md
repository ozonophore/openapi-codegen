## 1. Templates

- [x] 1.1 `exportClient.hbs`: import and `createDefaultExecutor` use `createLegacyRequestAdapter` when `useLegacyRequestAdapter`
- [x] 1.2 `createExecutorAdapter.hbs`: omit `requestRaw` import and synthesize `ApiResult` when `omitRequestRaw`
- [x] 1.3 Update legacy adapter comment: default when `request` is set without `customExecutorPath`
- [x] 1.4 `npm run build:hbs`

## 2. Write path

- [x] 2.1 `writeClientExecutor` takes `customExecutorPath`; `useLegacyRequestAdapter = !!request && !customExecutorPath`
- [x] 2.2 `writeClientArtifacts` passes `customExecutorPath`
- [x] 2.3 `writeClientCore` passes `omitRequestRaw: hasCustomRequest && !useCustomRequestRaw` into `createExecutorAdapter`

## 3. Docs and tests

- [x] 3.1 Upgrade page path 3: auto-attached; path 2 still `customExecutorPath` for RequestConfig transports
- [x] 3.2 CHANGELOG Unreleased Changed
- [x] 3.3 Test: `request` without `requestRaw` → `createClient` uses legacy adapter; `createExecutorAdapter` has no `requestRaw` import
- [x] 3.4 Existing `customRequestRaw` / `customExecutorPath` tests updated
