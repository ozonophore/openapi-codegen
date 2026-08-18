## Context

Migrate engine already lives in `common/VersionedSchema`. Three CLI call sites duplicate the plans/schemas triad. Grill locked DRY helper only — no programmatic `generate` migrate, no fold into resolve.

## Goals / Non-Goals

**Goals:**
- Single default-plans binding for loaded config migrate
- Bit-identical behavior at generate / preview / validateAndMigrate call sites

**Non-Goals:**
- Fold migrate into `resolveGenerationOptions`
- Widen public `generate(raw)` / export helper from `core/index`
- Move stripDefaults / convertArray / omitUndefined into the helper
- EntitySkip / fingerprint changes

## Decisions

1. **Home:** `src/common/VersionedSchema/Utils/migrateLoadedConfigToLatest.ts` (locality with engine + plans)
2. **API:** `migrateLoadedConfigToLatest(rawInput: Record<string, any>, migrationMode: EMigrationMode)` → same result as engine (`… | null`)
3. **Prep stays at callers:** generate/preview `convertArrayToObject`; validate `omitUndefined(convertArray)` + stripDefaults after
4. **Call sites:** generate adapter, previewChanges, validateAndMigrateConfigData
5. **Surface:** internal path imports only

## Risks / Trade-offs

- [Risk] Callers forget to convert array configs → Mitigation: keep convert at each caller as today; helper docs say Record after prep
- [Risk] Name “migrate-in-core” vs common/ home → Mitigation: OpenSpec id `migrate-loaded-config-helper`; CONTEXT clarifies semantic ownership

## Migration Plan

- Add helper → rewire 3 sites → thin unit + existing CLI tests → knip/tsc
- Rollback: revert helper + restore triad at call sites
