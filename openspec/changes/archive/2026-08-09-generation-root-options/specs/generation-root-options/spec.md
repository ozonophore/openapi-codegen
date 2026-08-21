## ADDED Requirements

### Requirement: Generation root options bag
Система MUST возвращать из `resolveGenerationOptions` объект `{ items, root }`, где `root` имеет тип `GenerationRootOptions` — Pick полей `reuseMode`, `preAnalyze`, `trafficSplitter`, `swarm`, `workspaceReport` из validated raw (без принудительных defaults). `GenerationBatchSession` и `finalizeGenerationBatch` MUST принимать `root` и MUST NOT принимать полный `TRawOptions`. Items MUST оставаться bit-identical (эти пять полей MUST NOT добавляться в root-only inherit).

#### Scenario: Resolve projects root fields
- **WHEN** raw содержит `reuseMode: 'auto-group'` и `preAnalyze: true`
- **THEN** `result.root.reuseMode` равен `'auto-group'`, `result.root.preAnalyze` равен `true`, а `items` не меняют прежний golden shape

#### Scenario: Batch uses root not raw
- **WHEN** batch setup читает reuse mode / preAnalyze и finalize запускает traffic/swarm/workspace
- **THEN** значения берутся из `root`, не из `TRawOptions`
