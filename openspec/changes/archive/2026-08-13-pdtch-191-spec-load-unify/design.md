## Context

Dual Spec-load after `pdtch-191-resolved-context` and deletion of `createSemanticDiffContext`. Grilling locked `specLoad/` with thin facades; git parse stays in CLI. Reimplement against current HEAD (`attachResolvedOpenApi`, plugin props on Context); do not copy TRANS blobs.

## Goals / Non-Goals

**Goals:** One Spec-load home; shared resolve prologue; two modes; keep facade paths.

**Non-Goals:** Absorb git/YAML parse; change Context lazy refs; Diff/validate merge; Session/Write/options; Phases 2–4.

## Decisions

1. Package `src/core/specLoad/` with `resolveOpenApiRefs`, `forContext`, `forSemantic`, expand, refs seam, barrel (internal, used surface only — no knip-dead re-exports).
2. Facades remain at `createResolvedContext.ts` and `loadSemanticOpenApiSpec.ts`; they import the barrel.
3. Shared minimal refs interface for expand adapter; Context `attachResolvedOpenApi` API unchanged.
4. CLI keeps `readSpecFromGit` / `parseSpecContent`.
5. No shim at old expand path — tests move with the module.

## Risks / Trade-offs

- **[Risk] Import miss after expand move** → tsc + existing suites.
- **[Trade-off] Third Swagger `parse` entry remains in CLI** → Explicit follow-up.

## Migration Plan

Internal only. Rollback: revert.

## Open Questions

_(none)_
