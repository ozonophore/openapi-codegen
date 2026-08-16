## Why

Generation item session snapshot’ит expected-files registry до/после `writeClient.writeClient`, чтобы получить delta для GenerationCache. Registry mechanics leak across the write seam. Architecture grill: вернуть delta из write.

## What Changes

- `writeClientArtifacts` → `Promise<string[]>` (set-diff bit-identical)
- `WriteClient.writeClient` → `Promise<string[]>` (thin propagate)
- Item session: `generatedFiles = await writeClient.writeClient(…)`; delete knownFilesBefore filter
- Entity-skip `registerOutputFile` unchanged
- **Out of scope:** narrow item/batch deps; change register semantics; sort for fingerprint

## Capabilities

### New Capabilities

- `write-client-expected-files-delta`: write seam returns per-item expected-files delta

### Modified Capabilities

_(none — internal WriteClient return type; not a prior OpenSpec requirement on void)_

## Impact

- `writeClientArtifacts.ts`, `WriteClient.ts`, `GenerationItemSession.ts`, write tests
- Без BREAKING public API
