## ADDED Requirements

### Requirement: Entity fingerprint residual is derived
Система MUST строить entity fingerprint `residual` как subset `ENTITY_FINGERPRINT_AFFECTING_KEYS` минус OptionsSlice coverage (`OptionsSlice` Pick keys plus `plugins` и `disableBuiltinPlugins`). MUST NOT держать отдельный hand-duplicated field list для residual contents. Пока derive bit-identical с прежним residual, `ENTITY_CACHE_FINGERPRINT_VERSION` MUST оставаться 3.

#### Scenario: Residual omits slice-covered keys
- **WHEN** item имеет `plugins`, `interfacePrefix`, `request`
- **THEN** residual содержит `request` и не содержит `plugins` / `interfacePrefix`

#### Scenario: Affecting key XOR coverage
- **WHEN** drift test runs
- **THEN** каждый affecting key принадлежит либо coverage, либо residual key set, не обоим и не ни одному
