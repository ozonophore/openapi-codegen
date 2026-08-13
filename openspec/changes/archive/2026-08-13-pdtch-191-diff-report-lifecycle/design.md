## Context

Produce depth lives in `semanticDiff`. Lifecycle glue (adapt/load/apply/write/types) and a discarded `createSemanticDiffContext` lack a home. Grilling locked Diff report package under `src/core/diffReport/`. Reimplement against current HEAD (item session already extracted); do not copy TRANS blobs.

## Goals / Non-Goals

**Goals:**
- One package owns Diff report lifecycle (except produce analyze)
- Rename write API honestly (`writeDiffReport`)
- Delete dead Context helper
- Keep GenerationItemSession thin wrappers and on-disk schema compat

**Non-Goals:**
- High-level produce facade, schema collapse, Unified-direct apply
- Dual Spec-load / plugin entry deepen
- Session/options/WriteClient changes
- Phases 2–4

## Decisions

1. **Package `src/core/diffReport/`** with barrel; not exported from `core/index.ts`.
2. **Types** move into package; shim at `types/DiffReport.model.ts`. No `utils/adapters` shim — call sites import `diffReport`. Barrel exports only used surface (internals stay module-local).
3. **`writeDiffReport`** in package; update call sites; no permanent `writeSemanticDiffReport` alias.
4. **Apply** moves into package; Session imports from barrel.
5. **CLI** keeps inline Unified assembly (import updates only).
6. **Delete** `semanticDiffContext.ts` + unused call.

## Risks / Trade-offs

- **[Risk] Missed import after move** → Mitigation: tsc + existing unit suites.
- **[Trade-off] CLI still assembles Unified inline** → Explicit follow-up (`produceUnifiedDiffReport`).

## Migration Plan

- Internal import updates only; on-disk reports unchanged.
- Rollback: revert commit(s).

## Open Questions

_(none)_
