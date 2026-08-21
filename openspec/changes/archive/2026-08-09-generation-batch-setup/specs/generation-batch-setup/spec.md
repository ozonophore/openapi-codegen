## ADDED Requirements

### Requirement: Generation batch setup leaf
Система MUST выполнять pre-loop bootstrap через `setupGenerationBatch` (validate/warn/path helpers, cache/reuse/sharedFolder load, accumulator, warm preAnalyze, result bag с `makeReportParams` и `start`). `GenerationBatchSession.run` MUST оставлять у себя empty-check, STARTED log, item loop + early conflict dump, вызов finalize и `shutdownLogger`.

#### Scenario: Warm preAnalyze still uses shouldEntitySkip
- **WHEN** `root.preAnalyze === true`
- **THEN** setup вызывает `shouldEntitySkip` для warm filter до item loop, а session всё равно вызывает `generateItem`

#### Scenario: Session remains orchestrator
- **WHEN** все items entity-skipped
- **THEN** behavioral suite по-прежнему видит skip combine/ESLint и `shutdownLogger` после finalize
