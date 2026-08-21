## Context

`generationCache/EntitySkip.ts` already owns skip policy; store class remained in `utils/GenerationCache.ts`.

## Goals / Non-Goals

**Goals:** Colocate GenerationCache with EntitySkip; update imports; delete old paths.

**Non-Goals:** Behavior/format change; barrel; public export; EntitySkip API change.

## Decisions

1. Move-only, no shim
2. Test under `generationCache/__tests__/`
3. OpenSpec `generation-cache-home`

## Risks / Trade-offs

- [Risk] Missed import → Mitigation: tsc + knip

## Migration Plan

Move files → fix imports → delete old → verify
