## ADDED Requirements

### Requirement: Schema Model list is unique by output path and name
After parse, the Schema Model list MUST keep the first model for each pair of `path` and `name`. Dedup MUST NOT deep-equal the Model graph. Combined ExportedModel lists (models and schemas indexes) MUST use the same key.

#### Scenario: Two models with the same path and name
- **WHEN** `getModels` produces two Model values with equal `path` and `name`
- **THEN** the returned list contains the first only

#### Scenario: Import arrays still deep-equal
- **WHEN** two Import objects are distinct references with equal fields
- **THEN** `filter(unique)` still keeps the first (existing `unique()` behavior)
