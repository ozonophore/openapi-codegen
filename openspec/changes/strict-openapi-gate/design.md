## Context

Item session `if (strictOpenapi)` inlines parser → loadGovernance → validateOpenApiStrict → write → log → throws. Leaves already exist under `strict/`.

## Goals / Non-Goals

**Goals:** One async gate interface; session one-liner; bit-identical throws/log.

**Non-Goals:** Spec-load validate merge; semantics change; public API.

## Decisions

1. Module `runStrictOpenApiGate.ts`; leaves stay separate
2. Input includes path `governanceConfig?` — gate loads policy
3. Logger duck `{ forceInfo }` logs `STRICT_REPORT_CREATED` inside gate
4. Leaf export only

## Open Questions

_(none)_
