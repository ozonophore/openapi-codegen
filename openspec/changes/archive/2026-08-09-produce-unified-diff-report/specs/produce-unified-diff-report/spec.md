## ADDED Requirements

### Requirement: produceUnifiedDiffReport assembles UnifiedDiffReport
Система MUST предоставлять `produceUnifiedDiffReport` в `src/core/diffReport/`, который собирает `UnifiedDiffReport`: `schemaVersion`, timestamp (optional override), metadata с `createSpecHash(baseSpec/targetSpec)`, semantic slice из enriched `SemanticDiffReport`, и `adaptSemanticToStructural(semantic, ignored)`. MUST NOT выполнять governance, miracles build, plugin hooks или disk write.

#### Scenario: CLI uses produce then write
- **WHEN** analyze-diff завершил enrich semantic report
- **THEN** CLI вызывает `produceUnifiedDiffReport` и передаёт результат в `writeDiffReport`

#### Scenario: Circular specs hash stably
- **WHEN** spec object содержит circular reference
- **THEN** `createSpecHash` завершается без throw и возвращает стабильный hex digest
