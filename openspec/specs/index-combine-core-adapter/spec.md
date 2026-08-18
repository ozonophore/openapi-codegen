## ADDED Requirements

### Requirement: IndexCombine flushes via CoreOutputAdapter
Система MUST принимать `CoreOutputAdapter` в `IndexCombineSession.combineAndWrite` / `combineAndWriteSimple` и записывать indexes через free `writeClientFullIndex` / `writeClientSimpleIndex`. MUST NOT требовать WriteClient-shaped `IndexCombineWriteHost`. `WriteClient.combineAndWrite*` MUST делегировать с `toCoreOutputAdapter()`.

#### Scenario: Facade combine unchanged for callers
- **WHEN** batch finalize вызывает `writeClient.combineAndWrite()`
- **THEN** indexes пишутся тем же leaf path через adapter

#### Scenario: No Full/Simple bindings required
- **WHEN** IndexCombine flushes
- **THEN** не использует `WriteClient.writeClientFullIndex` / `writeClientSimpleIndex` method bindings
