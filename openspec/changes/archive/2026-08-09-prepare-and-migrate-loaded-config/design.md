## Context

`migrateLoadedConfigToLatest` binds plans/schemas; prep still duplicated at three CLI sites.

## Goals / Non-Goals

**Goals:** One prep+migrate entry; shared omitUndefined; bit-identical callers.

**Non-Goals:** stripDefaults into helper; array-deprecated warn ownership; analyze-diff; resolve fold.

## Decisions

1. New `prepareAndMigrateLoadedConfig.ts` calling convert → optional omit → migrateLoadedConfigToLatest
2. `omitUndefinedValues` in `common/utils/`
3. Keep bind-only migrate helper
4. Array warn stays at callers

## Risks / Trade-offs

- [Risk] omitUndefined default wrong → Mitigation: default false; validate passes `{ omitUndefined: true }`

## Migration Plan

Add helpers → rewire 3 sites → tests → verify
