## ADDED Requirements

### Requirement: Generation-affecting options have one allowlist and two projections
Система MUST хранить `GENERATION_AFFECTING_KEYS` и `REUSE_OPTIONS_SLICE_KEYS ⊆ GENERATION_AFFECTING_KEYS` в `generationAffectingOptions`. Reuse `OptionsSlice` MUST сохранить текущий shape. Entity fingerprint MUST использовать version **4** и поле `optionsAffectingHash` из `buildGenerationAffectingHash` и MUST NOT включать `residual` или отдельный `optionsSliceHash` в envelope.

#### Scenario: Reuse keys subset of affecting
- **WHEN** drift test runs
- **THEN** каждый `REUSE_OPTIONS_SLICE_KEYS` принадлежит `GENERATION_AFFECTING_KEYS`, и `plugins` входит в affecting

#### Scenario: Entity v4 envelope
- **WHEN** `buildEntityFingerprint` строится
- **THEN** `cacheFingerprintVersion` равен 4 и fingerprint меняется при изменении residual-only поля (`request`) при неизменном reuse OptionsSlice hash

#### Scenario: Reuse OptionsSlice unchanged
- **WHEN** только `request` меняется
- **THEN** `buildOptionsSliceHash` идентичен (reuse warm path не ломается этим fold)
