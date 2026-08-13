## Purpose

Opaque `ReuseWriterContext` on the Write seam, adapter-isolated reuse helpers, and content-based `writeOutputFile` (no `expectedByteSize` short-circuit).

## Requirements

### Requirement: Write seam accepts opaque ReuseWriterContext
`WriteClient.writeClient`, `writeClientModels`, and `writeClientSchemas` MUST accept optional `reuse?: ReuseWriterContext` and MUST NOT expose the former flat nine-field reuse bag as sibling props. When `reuse` is provided, required context fields (including `inputPath`) MUST be present. `writeClient` MUST use a single models-finalize path so `reuse` (and `inputPath`) cannot be dropped when `validationLibrary !== NONE`.

#### Scenario: generateSingle builds one reuse context
- **WHEN** cacheStrategy=reuse and item uses ReuseStore
- **THEN** `OpenApiClient.generateSingle` MUST assemble a single `ReuseWriterContext` and pass it as `reuse` into `writeClient` for both OpenAPI v2 and v3 paths

#### Scenario: Validation library path keeps inputPath
- **WHEN** `writeClient` runs with `validationLibrary` not NONE and `reuse` is set
- **THEN** `writeClientSchemas` and `writeClientModels` MUST receive the same `reuse.inputPath`

#### Scenario: No half-built reuse handle
- **WHEN** `reuse` is passed to writeClientModels/schemas
- **THEN** helpers MUST receive that object directly without reassembling from optional sibling fields or `inputPath ?? specInput` fallback

---

### Requirement: Reuse helpers use ReuseOutputAdapter
`writeModelWithReuse` / `writeSchemaWithReuse` (and internal writeReusedArtifact) MUST depend on `ReuseOutputAdapter` (`writeOutputFile`, optional `registerLintTarget`) and MUST NOT import the `WriteClient` class.

#### Scenario: Unit test with fake adapter
- **WHEN** a unit test supplies a fake adapter recording writes
- **THEN** a reuse miss path MAY be exercised without constructing WriteClient

---

### Requirement: V2 and V3 share write props
OpenAPI v2 and v3 write calls in `generateSingle` MUST share one constructed write-props object (including `reuse`).

#### Scenario: Single writeProps object
- **WHEN** both version branches write client output
- **THEN** they MUST use the same props construction site, not two independently maintained reuse field lists

---

### Requirement: writeOutputFile compares content not size
`WriteClient.writeOutputFile` MUST NOT skip writing based on on-disk `byteSize` / `expectedByteSize`. Reuse hit MUST write through the same content-comparison path as a miss.

#### Scenario: Same size different content is written
- **WHEN** reuse hit content differs from on-disk file but byte sizes match
- **THEN** the file MUST be updated (not left unchanged due to size equality)
