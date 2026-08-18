## Purpose

Workspace report после multi-spec generation run.

**Related:** `generation-cache-and-reuse` (reuse manifest для crossSpec).

## Requirements

### Requirement: Workspace report after all items
Workspace report MUST генерироваться после завершения всех spec items и finalizeSpecAnalysis (если включён), используя accumulated specStats.

#### Scenario: Multi-spec timing
- **WHEN** workspaceReport enabled с 3 items
- **THEN** report summary.totalSpecs=3 и totalDurationMs = sum item durations

#### Scenario: Disabled skips write
- **WHEN** workspaceReport отсутствует или enabled=false
- **THEN** workspace-report файлы не создаются

---

### Requirement: Cross-spec section from reuse store
When reuse store active, report MUST include crossSpec from analyzeCrossSpecManifest(reuseStore.getManifest()).

#### Scenario: Reuse enabled
- **WHEN** cacheStrategy reuse и workspaceReport true
- **THEN** report.crossSpec populated, summary.totalSharedModels reflects shared count

#### Scenario: No reuse store
- **WHEN** workspaceReport true без reuse cache
- **THEN** crossSpec null, totalSharedModels=0

---

### Requirement: Per-spec summary fields
Each spec entry MUST include name, input, durationMs, reuseHits, reuseMisses.

#### Scenario: Spec with no reuse
- **WHEN** item generated without reuse store
- **THEN** reuseHits=0, reuseMisses=0 for that spec entry

---

### Requirement: Report types contract
Workspace report MUST match the types contract: `WorkspaceReport` has ISO `generatedAt`, `specs`, `crossSpec` (`null` without reuse store — not an empty array), and `summary`. `WorkspaceSpecSummary` MUST include `name`, `input`, `durationMs`, `reuseHits`, `reuseMisses`. `WorkspaceReportSummary` MUST include `totalSpecs`, `totalDurationMs`, `totalReuseHits`, `totalReuseMisses`, `totalSharedModels`. `WorkspaceReportConfig` MUST accept optional `enabled`, `path`, and `format` (`json` | `markdown` | `both`).

#### Scenario: WorkspaceSpecSummary содержит все обязательные поля
- **WHEN** specStats passed into workspace report build
- **THEN** each `specs` entry has all five fields with correct types

#### Scenario: Summary counters present
- **WHEN** report is built for N items
- **THEN** `summary.totalSpecs` equals N and duration/reuse totals equal the sums of per-spec fields

---

### Requirement: Output format options
writeWorkspaceReport MUST support format json, markdown, or both. Default path `./workspace-report`.

#### Scenario: Format both
- **WHEN** format both
- **THEN** exist `{path}.json` and `{path}.md`

#### Scenario: Format json only
- **WHEN** format json
- **THEN** only `{path}.json` created

#### Scenario: Format markdown only
- **WHEN** format markdown
- **THEN** only `{path}.md` created

---

### Requirement: Generation failure is non-fatal
Workspace report write errors MUST log warning without failing main generation.

#### Scenario: Report write error
- **WHEN** configured report path invalid
- **THEN** warning "workspaceReport: failed to write report"

---

### Requirement: Independent from generation report
Workspace report MUST be separate artifact from `.openapi-codegen-store` generation report (spec quality / reuse stats JSON).

#### Scenario: Both enabled
- **WHEN** cache enabled and workspaceReport enabled
- **THEN** generation report at store root, workspace report at workspaceReport.path
