## ADDED Requirements

### Requirement: Generation history Diff owns load warn apply
The system SHALL provide `applyHistoryDiffToClient` in Diff report that, in order: loads via `loadDiffReport`, warns with `USE_HISTORY_NO_REPORT` when `useHistory` is true and no report was loaded, then applies via `applyDiffReportToClient`.

#### Scenario: useHistory false
- **WHEN** `useHistory` is false or omitted
- **THEN** the module returns the client unchanged without warning

#### Scenario: useHistory with missing report
- **WHEN** `useHistory` is true and load returns null
- **THEN** the module logs the missing-report warning and returns the client unchanged

#### Scenario: useHistory with report
- **WHEN** `useHistory` is true and a report loads
- **THEN** the module returns the client after `applyDiffReportToClient`

### Requirement: Warn is not inside loadDiffReport
`loadDiffReport` MUST NOT emit `USE_HISTORY_NO_REPORT`. Callers other than generation history (e.g. analyzeUsage) MUST keep current load-only behavior.

#### Scenario: loadDiffReport alone
- **WHEN** `loadDiffReport` is called with `useHistory: true` and a missing file
- **THEN** it returns null without requiring a generation warn side effect from that function

### Requirement: Generation item session uses history module in prepare
`GenerationItemSession.prepareClientFromOpenApi` MUST call `applyHistoryDiffToClient` after parse. Private `loadDiffReportIfNeeded` / `applyDiffReportIfNeeded` MUST be removed. Pre-switch load/warn in `run` MUST be removed.

#### Scenario: prepare path
- **WHEN** item session prepares a Client for V2 or V3
- **THEN** history Diff runs once inside prepare after parse

### Requirement: Internal export only
`applyHistoryDiffToClient` SHALL be exported from `src/core/diffReport/index.ts` and MUST NOT be re-exported from `src/core/index.ts`.

#### Scenario: Diff report barrel
- **WHEN** a module imports from `core/diffReport`
- **THEN** `applyHistoryDiffToClient` is available
