## ADDED Requirements

### Requirement: Final Generation report after Reuse GC and save
Когда `ReuseStore` активен в batch run, финальная запись Generation report MUST происходить **после** `reuseStore.gc` и (если dirty) `reuseStore.save`. При `cacheDebug` поле `phases` MUST отражать измеренные `manifestLoadMs`, `manifestSaveMs` и `gcMs` финального прохода (не нули из-за записи report до GC).

#### Scenario: cacheDebug phases include gc and save
- **WHEN** cacheStrategy=reuse, cacheDebug=true, run завершается успешно с активным ReuseStore
- **THEN** generation report на диске содержит `phases.gcMs` и `phases.manifestSaveMs`, соответствующие выполненным GC/save (save может быть 0 только если store не dirty)

#### Scenario: Early conflict dump still allowed before GC
- **WHEN** mid-batch возникает `ReuseConflictError` и политика требует записать report с conflict record
- **THEN** early generation report MAY быть записан до GC/save; такой dump MUST NOT требовать финальных phase timings

## MODIFIED Requirements

### Requirement: reuseOnConflict policies
При conflict MUST поддерживаться `fail` (throw ReuseConflictError) и `namespace` (disambiguate by spec namespace — см. `reuse-namespace-paths`).

#### Scenario: fail policy
- **WHEN** reuseOnConflict=fail и conflict detected
- **THEN** generation прерывается; early generation report записывается с conflict record (до Reuse GC/save, без требования полных phase timings)
