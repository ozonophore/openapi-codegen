## ADDED Requirements

### Requirement: Batch finalize owns post-loop phases
Система MUST предоставлять `finalizeGenerationBatch(ctx)`, который выполняет post-item-loop phases в прежнем порядке: index combine (если не allEntitySkipped), traffic/swarm, stale cleanup, cache save, specAnalysis finalize, reuse GC/save, generation report, workspace report, write-stats log, batch ESLint (или clear lint), finished logs. `GenerationBatchSession.run` MUST делегировать этот хвост и MUST NOT дублировать фазы inline. `shutdownLogger` MUST оставаться на session после try/catch.

#### Scenario: allEntitySkipped skips combine and eslint
- **WHEN** все items entity-skipped
- **THEN** finalize не вызывает combineAndWrite* и вызывает clearLintTargets вместо batch ESLint

#### Scenario: Session stays setup+loop
- **WHEN** generation batch runs
- **THEN** setup, preAnalyze, item loop и early reuse-conflict report остаются на session; finalize получает ctx после loop
