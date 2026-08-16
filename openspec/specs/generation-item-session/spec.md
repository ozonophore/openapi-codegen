## Purpose

Per-item Generation lifecycle owned by an internal `GenerationItemSession` (facade wires it as batch `generateItem`).

## Requirements

### Requirement: Generation item session owns per-item lifecycle
The system MUST run the per-item Generation lifecycle through an internal **Generation item session** (`GenerationItemSession`), not through `generateSingle` on the facade. The session MUST own: EntitySkip (+ `registerOutputFile` on hit) → plugins / Resolved Context → Spec analysis / strict → templates → Diff load/apply → V2/V3 parse / postProcess / DTO → `ReuseWriterContext` assembly → `WriteClient.writeClient` → GenerationCache.set.

#### Scenario: Facade wires item session into batch callback
- **WHEN** public generation runs (`OpenApiClient.generate` / CLI generate)
- **THEN** the facade MUST construct `GenerationItemSession` and pass `generateItem` that calls `itemSession.run` into `GenerationBatchSession`

#### Scenario: generateSingle removed from facade
- **WHEN** `OpenApiClient` is read after this change
- **THEN** private `generateSingle` MUST NOT exist; per-item code lives in `GenerationItemSession`

---

### Requirement: Item session run contract
`GenerationItemSession.run` MUST take `(item: TStrictFlatOptions, generationCache: GenerationCache | null, itemRunContext: ItemRunContext)` with **required** `itemRunContext` and return `Promise<{ entitySkipped: boolean }>`, matching batch `generateItem`. Constructor deps MUST be `{ writeClient, eslintFixOptions }`.

#### Scenario: Batch callback shape matches run
- **WHEN** batch calls `generateItem(item, generationCache, itemRunContext)`
- **THEN** the call MUST delegate to `itemSession.run` with the same three arguments and no optional context

---

### Requirement: Diff helpers live on item session
Load/apply Diff report helpers that were private on `OpenApiClient` MUST live as private methods (or equivalent) on `GenerationItemSession`. The facade MUST NOT own `loadDiffReportIfNeeded` / `applyDiffReportIfNeeded`.

#### Scenario: useHistory path stays inside item session
- **WHEN** an item has `useHistory` and an available Diff report
- **THEN** load and apply MUST run inside Generation item session before write

---

### Requirement: Item session is not a public core export
`GenerationItemSession` MUST NOT be re-exported from `src/core/index.ts`.

#### Scenario: Public core index omits item session
- **WHEN** a consumer imports the public surface `src/core/index.ts`
- **THEN** `GenerationItemSession` is absent from exports

---

### Requirement: First-cut behavioral preserve
The first cut MUST preserve runtime behavior of the former `generateSingle` (including V2/V3 switch as-is). A dedicated unit suite on the item session is not required in this change.

#### Scenario: Existing suites remain the gate
- **WHEN** the change is considered done
- **THEN** existing relevant tests MUST pass without intentional log/error/CLI behavior changes
