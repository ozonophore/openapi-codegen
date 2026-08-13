## Purpose

Diff report lifecycle home: adapt, load, apply, write, types under `src/core/diffReport/` (produce stays in `semanticDiff`).

## Requirements

### Requirement: Diff report package owns lifecycle glue
Система MUST размещать Diff report adapt, multi-schema load→legacy consumer DTO, apply-to-Client, miracle build from semantic changes, Unified/legacy report types, and `writeDiffReport` в internal package `src/core/diffReport/` (barrel), а не в разрозненных `core/utils` / misnamed semantic write export.

#### Scenario: Consumers import from diffReport
- **WHEN** Generation item session, analyze-diff CLI, или analyze-usage загружает/применяет/пишет Diff report helpers
- **THEN** MUST использовать `src/core/diffReport` (или shim types path), не `utils/loadDiffReport` как owner home

#### Scenario: Package not public core export
- **WHEN** потребитель импортирует `src/core/index.ts`
- **THEN** Diff report barrel MUST NOT быть обязательным public export

---

### Requirement: writeDiffReport replaces writeSemanticDiffReport
Persist helper MUST называться `writeDiffReport` и жить в Diff report package. Call sites MUST NOT зависеть от `writeSemanticDiffReport` export на `analyzeOpenApiDiff`.

#### Scenario: analyze-diff writes via writeDiffReport
- **WHEN** analyze-diff сохраняет UnifiedDiffReport
- **THEN** MUST вызывать `writeDiffReport`

---

### Requirement: Dead semantic Diff Context helper removed
`createSemanticDiffContext` MUST быть удалён вместе с unused call site в analyze-diff.

#### Scenario: No discarded Context construction
- **WHEN** выполняется analyze-diff happy path
- **THEN** MUST NOT конструировать throwaway Context ради unused return

---

### Requirement: Item session call shape preserved
`GenerationItemSession` MUST сохранить thin private `loadDiffReportIfNeeded` / `applyDiffReportIfNeeded`. On-disk Unified 2.0 / Semantic 1.1 / legacy read compat MUST сохраниться.

#### Scenario: useHistory load still yields legacy DiffReport for apply
- **WHEN** generate с `useHistory` и доступным report file
- **THEN** load MUST по-прежнему отдавать consumer `DiffReport` для apply path
