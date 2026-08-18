## Context

Follow-up to `generation-options-resolve`. Module already owns validate → flatten → defaults; field lists remain triple-handwritten.

## Goals / Non-Goals

**Goals:** Explicit tables in the same file; bit-identical resolved options; clear `||`/`??`/custom encoding.

**Non-Goals:** CLI Zod/override collapse; EntitySkip fingerprint; migrate-in-core; typed root bag; public API / `core/index` re-export; changing `COMMON_DEFAULT_OPTIONS_VALUES`.

## Decisions

1. **Tables in `resolveGenerationOptions.ts`:** `ROOT_ONLY_KEYS` (optional `get` for `autoSelect`), `PER_ITEM_OVERRIDE_KEYS` + `resolveRootAliases`, `DEFAULT_RULES` + `CUSTOM_DEFAULTS`.
2. **Explicit specials:** `mergeItemMarauderBlock` for items `specAnalysis`/`anomalyDetection`; flat uses `normalizeMarauderBoolean`; aliases for `modelsMode`/`modelsLayout`/`useHistory`/`diffReport`; `resolveSpecAnalysisConfig` via custom default.
3. **Default rules:** `'or' | 'nullish' | 'custom'` per key — preserves empty-string → default via `||` without unifying to `??`.
4. **Visibility:** tables and helpers private; only `resolveGenerationOptions` exported from the module (still not from `core/index`).

## Risks / Trade-offs

- Table key-order must match prior `addDefaultValues` object for JSON bit-identity — encoded by object literal insertion order + golden gate.

## Open Questions

_(none)_
