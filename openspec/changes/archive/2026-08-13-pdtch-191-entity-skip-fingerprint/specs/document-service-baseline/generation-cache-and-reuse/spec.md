## ADDED Requirements

### Requirement: Entity fingerprint uses options slice hash
При `cacheStrategy` entity или reuse (hybrid entity skip) GenerationCache fingerprint MUST включать hash options slice (`optionsSliceHash`), согласованный с ReuseStore artifact options hashing (`buildOptionsSlice` / `buildOptionsSliceHash`), плюс residual non-slice generation options и versioned envelope. Fingerprint version MUST быть 3 после этого change.

#### Scenario: Shared options influence entity and reuse
- **WHEN** меняется options field, входящий в `OptionsSlice`
- **THEN** и entity fingerprint (через `optionsSliceHash`), и reuse `optionsSliceHash` MUST отразить изменение

#### Scenario: Residual-only field still affects entity skip
- **WHEN** меняется residual field вне slice (например `request` или `strictOpenapi`)
- **THEN** entity fingerprint MUST измениться даже если `optionsSliceHash` прежний

## MODIFIED Requirements

### Requirement: Три cache strategies
Поддерживаемые strategies: `content` (write-if-changed only), `entity` (per-output fingerprint cache), `reuse` (cross-spec artifact store). Strategy MUST быть consistent across all items в одном run. `reuse` MUST также участвовать в hybrid entity skip (GenerationCache fingerprint + files + manifest presence), не только в ReuseStore artifact hits.

#### Scenario: Content strategy
- **WHEN** cache=true и cacheStrategy=content
- **THEN** entity cache не загружается, только writeFileIfChanged оптимизация

#### Scenario: Entity cache hit
- **WHEN** cacheStrategy=entity, fingerprint (v3 envelope) совпадает и все cached files exist on disk
- **THEN** generateSingle skip write, register cached paths as outputs

#### Scenario: Hybrid reuse entity-skip hit
- **WHEN** cacheStrategy=reuse, fingerprint (v3) совпадает, cached files exist, и Reuse manifest содержит spec item
- **THEN** generateSingle MUST skip parse/write этого item (`entitySkipped`)

#### Scenario: Hybrid reuse skip denied without manifest entry
- **WHEN** cacheStrategy=reuse, fingerprint и files совпадают, но spec item отсутствует в Reuse manifest
- **THEN** entity skip MUST NOT применяться; item идёт в полную генерацию

#### Scenario: Entity cache miss on missing file
- **WHEN** cache entry exists но файл на диске удалён
- **THEN** cache miss, полная регенерация item

#### Scenario: Entity cache miss on fingerprint version change
- **WHEN** cache entry был записан с fingerprint version 2, а генератор считает version 3
- **THEN** fingerprint mismatch, entity skip не применяется
