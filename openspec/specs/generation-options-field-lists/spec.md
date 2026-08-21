## ADDED Requirements

### Requirement: Field lists are table-driven inside resolve
`resolveGenerationOptions` MUST encode root-only inherit keys, per-item override keys, and defaults as explicit tables in `src/core/resolveGenerationOptions.ts`. Marauder merges, nested aliases, and `resolveSpecAnalysisConfig` MUST remain explicit (not generic pick).

#### Scenario: Root-only and per-item tables drive items path
- **WHEN** raw options use `items[]`
- **THEN** each item MUST receive root-only fields from root (with `autoSelect` via `normalizeMarauderBoolean`), per-item overrides as `item.x ?? root.x` (aliases for `modelsMode`/`modelsLayout`/`useHistory`/`diffReport`), and marauder merges for `specAnalysis`/`anomalyDetection`

#### Scenario: Flat path uses aliases and marauder normalize
- **WHEN** raw options are flat (no `items`)
- **THEN** resolve MUST build one flat item from raw + root aliases + `normalizeMarauderBoolean` for `autoSelect`/`specAnalysis`/`anomalyDetection`

---

### Requirement: Defaults preserve or/nullish/custom semantics
Defaults MUST apply via a per-key rule `'or' | 'nullish' | 'custom'`, with custom handlers for `modelsLayout` and `specAnalysis` matching prior `addDefaultValues` behavior.

#### Scenario: Empty string uses or-default
- **WHEN** a string field under `'or'` is `""`
- **THEN** the resolved value MUST be the common default (not `""`)

#### Scenario: Falsy boolean uses nullish
- **WHEN** a boolean field under `'nullish'` is `false`
- **THEN** the resolved value MUST remain `false` (not replaced by default)

---

### Requirement: Bit-identical resolve output
Refactor MUST NOT change post-resolve `TStrictFlatOptions[]` values or JSON key order relative to the pre-collapse module. Entity-skip fingerprint MUST NOT bump solely due to this change. Tables MUST NOT be re-exported from `src/core/index.ts`.

#### Scenario: Golden fixtures match
- **WHEN** golden fixtures (flat minimal, flat falsy strings, items inherit, nested aliases) are resolved
- **THEN** `JSON.stringify` output MUST equal `resolveGenerationOptions.golden.json`
