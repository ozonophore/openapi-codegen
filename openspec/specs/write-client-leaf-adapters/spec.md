## ADDED Requirements

### Requirement: CoreOutputAdapter owns leaf write seam
Система MUST предоставлять internal тип `CoreOutputAdapter` с `writeOutputFile`, `registerLintTarget(file, outputRoot)` (outputRoot required) и `logger: { info; warn }`. Leaves `writeClient*` и `writeSharedOrLocalCoreFile` MUST принимать adapter первым аргументом и MUST NOT зависеть от класса `WriteClient`.

#### Scenario: Leaf write without WriteClient import
- **WHEN** `writeClientModels` / `writeClientCore` / shared-core write выполняется
- **THEN** модуль импортирует `CoreOutputAdapter`, не `WriteClient`, и пишет через adapter

#### Scenario: Facade preserves public leaf methods
- **WHEN** тест или orchestration вызывает `writeClient.writeClientModels(opts)`
- **THEN** facade передаёт `this.toCoreOutputAdapter()` в free function

---

### Requirement: Reuse projection stays narrow
`ReuseOutputAdapter` MUST остаться write + optional lint. Projection `toReuseOutputAdapter(core, defaultLintRoot?)` MUST жить в `CoreOutputAdapter.ts`. `CoreOutputAdapter` MUST NOT реэкспортироваться из `src/core/index.ts`.

#### Scenario: Models reuse path uses projection
- **WHEN** leaf пишет model/schema через reuse helpers
- **THEN** передаётся `toReuseOutputAdapter(adapter, …)`, не ad-hoc объект с `this`
