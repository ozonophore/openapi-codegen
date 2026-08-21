## Context

`parseSpecContent` in `src/cli/analyzeDiff/specParser.ts` parses string content (JSON / YAML via temp + `SwaggerParser.parse`). `readSpecFromGit` uses `execSync('git show …')` then parse. Spec-load already owns resolve/expand; parse was deferred in `spec-load-unify`.

## Goals / Non-Goals

**Goals:** Move string→object parse into Spec-load leaf; CLI keeps git show; bit-identical behavior.

**Non-Goals:** git/`execSync` in core; parse+expand combined helper; export from `core/index`; resolve/expand / `validateWithSwaggerParser` merge.

## Decisions

1. **Module:** `src/core/specLoad/parseOpenApiContent.ts` — `parseOpenApiContent(content, sourcePath): Promise<unknown>`
2. **YAML path:** Preserve temp-dir + write + `SwaggerParser.parse` + cleanup (not in-memory YAML lib)
3. **CLI:** Keep `specParser.ts` with only `readSpecFromGit`; call core parse
4. **Export:** Internal leaf only (facades import if needed later; analyze-diff imports leaf)
5. **Return type:** `unknown` (CLI `JsonValue` remains alias); no expand here — caller still uses `loadSemanticOpenApiObject`

## Risks / Trade-offs

- [YAML still needs disk] → Accept; identical to today; follow-up if needed
- [Duplicate SwaggerParser require style] → Match existing resolve/CLI pattern

## Open Questions

_(none)_
