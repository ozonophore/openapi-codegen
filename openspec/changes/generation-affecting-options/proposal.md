## Why

Entity fingerprint still carries a separate `residual` next to reuse `OptionsSlice` hash — two option-affecting localities. Architecture grill: one allowlist with two projections (reuse narrow / entity full); entity envelope v4 single `optionsAffectingHash`.

## What Changes

- Add `src/core/generationAffectingOptions.ts` (allowlist, reuse projection keys, `buildGenerationAffectingHash`)
- Entity fingerprint v4: drop `residual` + entity `optionsSliceHash`
- Delete residual helpers/constants from EntitySkip
- Reuse `OptionsSlice` unchanged; ⊆ drift test
- **Out of scope:** expanding affecting set; migrate; reuse path layout

## Capabilities

### New Capabilities

- `generation-affecting-options`: Shared generation-affecting allowlist with reuse/entity projections

### Modified Capabilities

_(none — reuse bit-identical; entity fingerprint version bump)_

## Impact

- Entity warm cache one-time miss (v4); reuse artifacts unchanged
- `EntitySkip.ts`, new module, tests
