## Context

Grilling: produce = Unified assemble only; hash in diffReport; optional timestamp; unit tests; internal barrel.

## Goals / Non-Goals

**Goals:** One produce home; CLI thin after enrich.  
**Non-Goals:** Governance/miracles/hooks in produce; write merge; Unified-direct apply.

## Decisions

1. `produceUnifiedDiffReport({ semantic, base, target, baseSpec, targetSpec, ignored?, timestamp? })`
2. `createSpecHash` circular-safe MD5 (same algorithm as CLI)
3. Default timestamp `toISOString()`

## Open Questions

_(none)_
