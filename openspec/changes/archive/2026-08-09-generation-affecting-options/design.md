## Context

Residual derive closed list drift; fold was deferred. Reuse OptionsSlice must stay narrow.

## Goals / Non-Goals

**Goals:** One allowlist; entity v4 single affecting hash; reuse OptionsSlice unchanged.

**Non-Goals:** Expand affecting set; invalidate reuse; migrate-in-core.

## Decisions

1. Module `generationAffectingOptions.ts`
2. Entity envelope `{ v4, generatorVersion, specHash, optionsAffectingHash }`
3. Plugins via same `pluginsHash` normalization as `buildOptionsSlice`
4. Delete residual API from EntitySkip; re-export `GENERATION_AFFECTING_KEYS` if needed

## Open Questions

_(none)_
