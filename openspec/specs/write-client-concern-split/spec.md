## Purpose

WriteClient as a composing facade over OutputFileSession, LintTargetRegistry, and IndexCombineSession.

## Requirements

### Requirement: Output session concerns live in three modules behind WriteClient facade
The system MUST split former multi-concern `WriteClient` ownership into internal modules **OutputFileSession** (disk write + expected-file registry + write stats), **LintTargetRegistry** (lint targets + include globs), and **IndexCombineSession** (generator config accumulation + combine flush). `WriteClient` MUST remain a thin facade composing these modules and keeping the existing public method surface as delegates, including HEAD name `combineAndWrightSimple`.

#### Scenario: Facade still exposes write/register/combine/lint APIs
- **WHEN** Generation item session or Generation batch session calls `WriteClient` methods (`writeClient`, `writeOutputFile`, `registerOutputFile`, `getExpectedOutputFiles*`, `getWriteStats`, `registerLintTarget`, `getLintTargets`, `clearLintTargets`, `combineAndWrite`, `combineAndWrightSimple`, `logger`)
- **THEN** behavior MUST be preserved; implementation MUST delegate ownership to the matching module

#### Scenario: Modules are not public core exports
- **WHEN** a consumer imports `src/core/index.ts`
- **THEN** `OutputFileSession`, `LintTargetRegistry`, and `IndexCombineSession` MUST NOT be among exports

---

### Requirement: IndexCombineSession owns config Map
`IndexCombineSession` MUST own per-item generator config accumulation and batch combine. During per-item `writeClient()` finalize, the facade MUST register config in IndexCombineSession. `WriteClient.combineAndWrite` / `combineAndWrightSimple` MUST delegate to IndexCombineSession.

#### Scenario: Batch combine goes through facade to IndexCombineSession
- **WHEN** Generation batch session calls `writeClient.combineAndWrite` or `combineAndWrightSimple`
- **THEN** index flush MUST run through IndexCombineSession ownership, not an ad-hoc Map on the facade

---

### Requirement: OutputFileSession owns write and expected registry together
`writeOutputFile` MUST continue to write the file and register the expected path atomically. Expected-file registry and write stats MUST live in OutputFileSession together with the write path.

#### Scenario: Entity skip and cache delta still use facade expected APIs
- **WHEN** Generation item session registers cached paths or reads expected files for GenerationCache
- **THEN** it MUST use the same `WriteClient` expected APIs; state MUST belong to OutputFileSession

---

### Requirement: SharedFolderWriter drops unused WriteClient dependency
`SharedFolderWriter` MUST NOT take or store `WriteClient` if the field is unused. Call sites MUST pass only LCA (and other actually needed deps).

#### Scenario: Construct SharedFolderWriter without WriteClient
- **WHEN** batch creates SharedFolderWriter for auto-group
- **THEN** the constructor MUST NOT require `WriteClient`

---

### Requirement: First-cut leaves leaf bindings and session deps unchanged
The first cut MUST NOT move `writeClient*` utils off `this: WriteClient` onto adapters and MUST NOT change `GenerationItemSession` / `GenerationBatchSession` deps from `writeClient: WriteClient`. Runtime write/lint/combine/log behavior MUST be preserved.

#### Scenario: Existing suites remain the gate
- **WHEN** the change is considered done
- **THEN** existing relevant tests MUST pass without intentional behavior changes
