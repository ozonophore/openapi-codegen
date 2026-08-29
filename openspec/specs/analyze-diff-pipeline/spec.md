## Purpose

Diff report owns the Analyze Diff success-path pipeline (`analyze → enrich → produce → write` plus CI governance gate) so the CLI stays a thin adapter for validation, Spec/policy loading, logging, and exit mapping.

## Requirements

### Requirement: Analyze Diff pipeline owns success-path order
The system SHALL provide `runAnalyzeDiffPipeline` in Diff report that executes, in order: `analyzeOpenApiDiff` → `enrichSemanticDiffReport` → `produceUnifiedDiffReport` → `writeDiffReport`, then evaluates the CI governance gate.

#### Scenario: Happy path without CI
- **WHEN** caller invokes the pipeline with valid specs/policy and `ci` is false
- **THEN** the module returns `ciFailed: false` with populated `reportPath`, `ignored`, `semanticReport`, and Unified `report`

#### Scenario: CI gate fails after write
- **WHEN** `ci` is true and enriched `semanticReport.governance.summary.errors` is greater than zero
- **THEN** the report is already written and the module returns `ciFailed: true` with `reportPath` (does not throw for this case)

#### Scenario: Unexpected failure throws
- **WHEN** analyze, enrich, produce, or write throws
- **THEN** the module propagates the error (does not convert it to `ciFailed`)

### Requirement: Pipeline input excludes Spec and policy loading
The pipeline MUST accept already-loaded `oldSpec`, `newSpec`, `plugins`, `ignoreRules`, and `governanceConfig` (plus labels, `reportPath`, `allowBreaking`, `ci`, optional `strictPluginMode` / `onDiagnostic`). It MUST NOT load Specs from disk/git or resolve plugin/config paths.

#### Scenario: Caller supplies loaded dependencies
- **WHEN** CLI has loaded Specs and policy artifacts
- **THEN** the pipeline runs without reading openapi config / governance files / plugin paths itself

### Requirement: CLI remains the Analyze Diff adapter
The analyze-diff CLI MUST keep Zod validation, Spec load (including git), policy loads, INFO logging (including CI markdown), skip-when-no-base, and mapping pipeline outcomes to `AnalyzeDiffResult` / exit codes. The pipeline MUST NOT depend on Commander `OptionValues` or `LOGGER_MESSAGES`.

#### Scenario: CLI maps ciFailed to unsuccessful result
- **WHEN** pipeline returns `ciFailed: true`
- **THEN** CLI returns `AnalyzeDiffResult` with `success: false` and `reportPath` set (exit code 1 via existing mapper)

### Requirement: Internal export only
`runAnalyzeDiffPipeline` SHALL be exported from `src/core/diffReport/index.ts` and MUST NOT be re-exported from `src/core/index.ts`.

#### Scenario: Diff report barrel exports pipeline
- **WHEN** a module imports from `core/diffReport`
- **THEN** `runAnalyzeDiffPipeline` is available without importing the public core barrel
