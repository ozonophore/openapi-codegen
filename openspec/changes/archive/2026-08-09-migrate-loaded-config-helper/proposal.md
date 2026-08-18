## Why

Generate, preview, and check/update-config each hand-wire `migrateDataToLatestSchemaVersion` with the same `allMigrationPlans` + `allVersionedSchemas` triad. Architecture #7 (migrate-in-core Speculative): DRY wiring without folding migrate into `resolveGenerationOptions` or changing programmatic `generate(raw)`.

## What Changes

- Add `migrateLoadedConfigToLatest(rawInput, migrationMode)` in `common/VersionedSchema/Utils/`
- Rewire generate adapter, preview, and `validateAndMigrateConfigData` to the helper
- Prep (`convertArrayToObject`, `omitUndefined`, stripDefaults) stays at callers
- **Out of scope:** programmatic migrate; fold into resolve; public API export; EntitySkip/fingerprint

## Capabilities

### New Capabilities

- `migrate-loaded-config-helper`: Default-plans migrate wiring for loaded config records

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `generateCliOptionsAdapter`, `previewChanges`, `validateAndMigrateConfigData`, new helper + thin unit test
