## ADDED Requirements

### Requirement: CoreOutputAdapter owns leaf write seam
Система MUST предоставлять internal тип `CoreOutputAdapter` с `writeOutputFile`, `registerLintTarget(file, outputRoot)` (outputRoot required) и `logger: { info; warn }`. Leaves `writeClient*` и `writeSharedOrLocalCoreFile` MUST принимать adapter первым аргументом и MUST NOT зависеть от класса `WriteClient`. `WriteClient` MUST NOT expose pass-through leaf methods; callers (including tests) MUST invoke free `writeClient*` with an adapter (e.g. via `toCoreOutputAdapter()`).

#### Scenario: Leaf write without WriteClient import
- **WHEN** `writeClientModels` / `writeClientCore` / shared-core write выполняется
- **THEN** модуль импортирует `CoreOutputAdapter`, не `WriteClient`, и пишет через adapter

#### Scenario: Tests call free leaf with adapter
- **WHEN** leaf unit test writes models/core/schemas/services
- **THEN** тест вызывает free `writeClient*(adapter, opts)` where `adapter` comes from `new WriteClient().toCoreOutputAdapter()` (or equivalent), not `writeClient.writeClientModels(opts)`

---

### Requirement: Reuse projection stays narrow
`ReuseOutputAdapter` MUST остаться write + optional lint. Projection `toReuseOutputAdapter(core, defaultLintRoot?)` MUST жить в `CoreOutputAdapter.ts`. `CoreOutputAdapter` MUST NOT реэкспортироваться из `src/core/index.ts`.

#### Scenario: Models reuse path uses projection
- **WHEN** leaf пишет model/schema через reuse helpers
- **THEN** передаётся `toReuseOutputAdapter(adapter, …)`, не ad-hoc объект с `this`
