## Purpose

Write seam returns the per-item expected-files delta (`string[]` set-diff) so Generation item session does not snapshot the registry around `writeClient`.

## Requirements

### Requirement: WriteClient artifacts returns expected-files delta
`writeClientArtifacts` MUST return `Promise<string[]>` containing paths present in the expected-files registry after the write that were not present before the write (set-diff), bit-identical to the former Generation item session filter.

#### Scenario: Empty write leaves empty delta
- **WHEN** artifacts runs and no new paths are registered
- **THEN** the returned array is empty

#### Scenario: New registered paths appear in delta
- **WHEN** artifacts runs and leaves register new expected paths via the adapter
- **THEN** those paths are included in the returned array and pre-existing registry paths are excluded

### Requirement: WriteClient.writeClient propagates delta
`WriteClient.writeClient` MUST return `Promise<string[]>` from `writeClientArtifacts` and MUST NOT require the caller to snapshot `getExpectedOutputFilesArray` around the call for cache file lists.

#### Scenario: Item session uses return value
- **WHEN** Generation item session finishes a non-skip item write
- **THEN** it assigns `generatedFiles` from `await writeClient.writeClient(writeProps)` without a pre-write expected-files snapshot

### Requirement: Entity-skip register stays on item session
On entity-skip cache hit, Generation item session MUST still call `registerOutputFile` for cached files and MUST NOT rely on `writeClient` return for that path.

#### Scenario: Entity skip
- **WHEN** entity skip hits
- **THEN** cached files are registered via `registerOutputFile` and `writeClient` is not invoked for that item
