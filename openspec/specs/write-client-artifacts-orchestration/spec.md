## ADDED Requirements

### Requirement: Per-item client write order lives in writeClientArtifacts
Система MUST предоставлять free function `writeClientArtifacts(adapter, indexCombine, options)`, которая владеет per-item mkdir/write order (core/services/executor/schemas/models) и вызывает `indexCombine.register` после models. `WriteClient.writeClient` MUST делегировать в эту функцию через `toCoreOutputAdapter()` и IndexCombine session. MUST NOT менять write order или IndexCombine combine host в этом change.

#### Scenario: Facade delegates
- **WHEN** Generation item session вызывает `writeClient.writeClient(opts)`
- **THEN** артефакты пишутся тем же order, что до extract, через `writeClientArtifacts`

#### Scenario: Leaves use CoreOutputAdapter
- **WHEN** orchestration пишет models/schemas/core/services
- **THEN** вызываются free `writeClient*` с `CoreOutputAdapter`, без WriteClient class leak внутрь orchestration
