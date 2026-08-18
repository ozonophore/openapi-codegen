## Context

Item-session prepare path (templates → postProcess → DTO/classes) was owned conceptually by Generation item session but files remained scattered in `src/core/utils/`.

## Goals / Non-Goals

**Goals:** One `src/core/clientPrep/` package for Handlebars registration, Client post-process cluster, and DTO/classes prepare; bit-identical behavior.

**Non-Goals:** Behavior/template change; barrel/shim; move `precompileTemplates` or CLI init Handlebars; change `templatesCompiled/` layout.

## Decisions

1. Package name `clientPrep` (prep of Client for Write)
2. Includes helpers + templates + prepareDto + resolveClasses + full postProcess* cluster
3. No shim at old utils paths
4. Tests colocated in `clientPrep/__tests__/`
5. Shared utils (`unique`/`sort`/`flatMap`/`escapeName`) stay in `utils/`; clientPrep imports them via `../utils/`

## Risks / Trade-offs

- [Risk] Missed relative import after depth change → Mitigation: tsc + knip + clientPrep unit suites

## Migration Plan

git mv → fix utils helper imports → rewire GenerationItemSession → CONTEXT → verify
