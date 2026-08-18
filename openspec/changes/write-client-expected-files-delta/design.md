## Context

Item session owns set-diff over WriteClient expected registry. Grill: delta inside writeClientArtifacts; facade returns `string[]`.

## Goals / Non-Goals

**Goals:**
- Bit-identical delta from write seam
- Item session stops snapshot/filter
- Keep entity-skip register + finalize getExpected*

**Non-Goals:**
- Widen CoreOutputAdapter for all leaves with getExpected*
- Narrow item/batch deps
- Sort delta for fingerprint stability

## Decisions

1. **Return `Promise<string[]>`** on facade and artifacts
2. **Delta in artifacts** via duck `getExpectedOutputFilesArray` (4th arg) — CoreOutputAdapter stays write/lint/log only
3. **Leaves remain 5th arg** (optional override)
4. **Set-diff** snapshot before body, filter after — same as former item session

## Risks / Trade-offs

- [Signature arity change for test leaves override] → Mitigation: update WriteClient.test call sites
- [Callers ignore return] → only item session + tests; production caller one

## Migration Plan

1. Artifacts + facade return
2. Wire item session
3. Unit delta + verify exit codes
4. CONTEXT OpenSpec id
