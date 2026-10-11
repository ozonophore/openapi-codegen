## Why

A custom `request` transport after regen still compiles against default `createExecutorAdapter`, which imports `requestRaw` and is wired by `createClient`. `createLegacyRequestAdapter` already exists and already synthesizes `requestRaw`, but nothing attaches it. Users who kept the legacy `request(ApiRequestOptions, OpenAPI)` signature get a TypeScript failure or a wrong call. This was parked past the 2.1.0 grill; it is now a Contract change of default generate.

## What Changes

- **BREAKING** for `createClient` default executor: when config `request` is set and `customExecutorPath` is not, `createDefaultExecutor` uses `createLegacyRequestAdapter`, not `createExecutorAdapter`.
- Generated `createExecutorAdapter` MUST compile when the copied `request` file has no `requestRaw` (same synthetic fallback as the legacy adapter).
- `customExecutorPath` still copies into `createExecutorAdapter` and remains the `createClient` default.
- Upgrade page path 3: auto-attached, not “wire it yourself”. CHANGELOG Contract change.
- `executorFactory` still overrides the default.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `generated-client-output`: default `createClient` executor when `request` is set; generated adapter MUST NOT require `requestRaw` on a custom transport.

## Impact

- `exportClient.hbs`, `createExecutorAdapter.hbs`, `legacyRequestAdapter.hbs` comment
- `writeClientExecutor`, `writeClientArtifacts`, `writeClientCore`
- `npm run build:hbs`
- Upgrade page (`MIGRATION.md` / `MIGRATION.RU.md`), CHANGELOG
- Tests: custom `request` without `requestRaw`; auto-wire; `customExecutorPath` unchanged
