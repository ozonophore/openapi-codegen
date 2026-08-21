## Context

Write depth (CoreOutputAdapter, artifacts orchestration) existed; files remained scattered under `utils/writeClient*` and `src/core/WriteClient.ts`.

## Goals / Non-Goals

**Goals:** One `src/core/write/` package for leaves + artifacts + facade; bit-identical behavior.

**Non-Goals:** Behavior change; barrel; CoreOutputAdapter / IndexCombine moves; modelsLayoutHelpers relocate.

## Decisions

1. Package includes WriteClient facade (Q4=B)
2. No shim at old WriteClient path
3. Tests in `write/__tests__/`; mock via `utils/__mocks__/templates`
4. Helpers stay in utils

## Risks / Trade-offs

- [Risk] Missed import → Mitigation: tsc + knip + write unit suites

## Migration Plan

git mv → fix imports → delete old → verify
