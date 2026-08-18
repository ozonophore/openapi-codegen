## Why

`resolveGenerationOptions` still maintains three parallel hand field lists (items inherit, flat map, defaults). Adding a key requires touching all three and risks `||` vs `??` drift. Grilling locked an explicit table collapse with bit-identical output.

## What Changes

- Collapse inherit/defaults field lists inside `src/core/resolveGenerationOptions.ts` into tables: root-only · per-item override · defaults (`or` / `nullish` / `custom`).
- Keep marauder merges, nested aliases, and `resolveSpecAnalysisConfig` explicit (not generic pick).
- Preserve bit-identical `TStrictFlatOptions[]` (golden fixtures); no entity-skip fingerprint bump.
- Public export `resolveGenerationOptions` and validation entry unchanged; tables stay module-private.

## Capabilities

### New Capabilities

- `generation-options-field-lists`: Explicit field tables for Generation options resolve (bit-identical collapse).

### Modified Capabilities

- _(none)_ — ownership already in `generation-options-resolve`; this is an internal structure deepen.

## Impact

- `src/core/resolveGenerationOptions.ts` — table-driven normalize/defaults
- Golden fixtures under `src/core/__tests__/fixtures/`
- No CLI Zod / EntitySkip / `COMMON_DEFAULT_OPTIONS_VALUES` / `core/index` export changes
