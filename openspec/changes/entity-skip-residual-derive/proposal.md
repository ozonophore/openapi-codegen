## Why

Entity fingerprint residual is a second hand-maintained field list next to `OptionsSlice`. Forgetting a generation-affecting option in residual causes false warm skips. Architecture #6: derive residual from allowlist minus OptionsSlice coverage.

## What Changes

- `ENTITY_FINGERPRINT_AFFECTING_KEYS` + OptionsSlice coverage set in `EntitySkip.ts`
- `buildEntityFingerprintResidual` derives via set difference (bit-identical to current 11 fields)
- Keep fingerprint **v3** while identical; tests: XOR, residual snapshot, residual-only flip
- No OptionsSlice fold / reuse churn

## Capabilities

### New Capabilities

- `entity-skip-residual-derive`: Derived residual for entity fingerprint locality

### Modified Capabilities

_(none)_

## Impact

- `src/core/generationCache/EntitySkip.ts` + tests; warm cache unchanged if bit-identical
