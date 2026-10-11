## ADDED Requirements

### Requirement: Legacy request is the default executor when `request` is set
When generate copies a custom `request` file and `customExecutorPath` is absent, generated `createClient` MUST use `createLegacyRequestAdapter` as `createDefaultExecutor`. `executorFactory` MUST still replace that default. When `customExecutorPath` is set, `createDefaultExecutor` MUST remain `createExecutorAdapter`.

#### Scenario: Config `request` without custom executor
- **WHEN** generate runs with `request` set and `customExecutorPath` unset
- **THEN** `createClient.ts` imports `createLegacyRequestAdapter` and `createDefaultExecutor` calls it

#### Scenario: customExecutorPath wins
- **WHEN** generate runs with `customExecutorPath` set
- **THEN** `createClient.ts` imports `createExecutorAdapter` and `createDefaultExecutor` calls it

---

### Requirement: Generated default adapter compiles without `requestRaw`
When generate copies a custom `request` file that does not export `requestRaw`, generated `createExecutorAdapter.ts` MUST NOT import `requestRaw`. Its `requestRaw` method MUST synthesize `ApiResult` from `request()` the same way `createLegacyRequestAdapter` does when `requestRaw` is absent. Generated default `request.ts` still exports `requestRaw`; that file MUST keep importing it.

#### Scenario: Custom request without requestRaw
- **WHEN** the copied `request` file has no `export function requestRaw`
- **THEN** `createExecutorAdapter.ts` compiles without a `requestRaw` import and `createLegacyRequestAdapter` is the `createClient` default
