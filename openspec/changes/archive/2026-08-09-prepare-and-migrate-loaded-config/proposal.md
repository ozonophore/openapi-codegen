## Why

Migrate triad wiring is DRY'd, but callers still hand-roll `convertArrayToObject` (+ optional omitUndefined). Residual prep drift at the load seam.

## What Changes

- Add `prepareAndMigrateLoadedConfig(configData, mode, { omitUndefined? })`
- Extract `omitUndefinedValues` to `common/utils/`
- Rewire generate adapter, preview, validateAndMigrate
- Keep `migrateLoadedConfigToLatest` for already-prepared records
- **Out of scope:** stripDefaults; analyze-diff pluginPaths; fold into resolve; public core export

## Capabilities

### New Capabilities

- `prepare-and-migrate-loaded-config`: Prep + migrate loaded config in one helper

### Modified Capabilities

_(none — behavioral preserve)_

## Impact

- CLI generate/preview/check-config; VersionedSchema Utils; common utils
