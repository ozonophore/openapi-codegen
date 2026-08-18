## Context

`AutoSelector` + ProjectProbe are core; CLI `autoSelectHelpers` stranded domain adapter above the seam.

## Goals / Non-Goals

**Goals:** One `executeAutoSelection` home in `core/autoSelect/`; CLI thin; public export for programmatic use.

**Non-Goals:** Change detect rules; merge into OpenApiClient.generate; export probe helpers from `core/index`.

## Decisions

1. File `executeAutoSelection.ts` with all former helpers
2. Duck logger
3. Public export only `executeAutoSelection` (+ AutoSelector as today)
4. Tests move with module; delete CLI helpers

## Risks / Trade-offs

- [Risk] Logger type break → Mitigation: APP_LOGGER satisfies duck; tests use plain object

## Migration Plan

Add core module → rewire CLI → move tests → delete CLI helpers → verify
