## Why

String→object OpenAPI parse (`parseSpecContent`: JSON / YAML via temp + `SwaggerParser.parse`) lives in analyze-diff CLI next to `git show`, while Spec-load already owns resolve/expand. Architecture grill: move only parse into Spec-load so content parsing is reusable; keep git I/O in CLI.

## What Changes

- Add `src/core/specLoad/parseOpenApiContent.ts` — `parseOpenApiContent(content, sourcePath): Promise<unknown>` (behavior-identical to current `parseSpecContent`)
- Thin `specParser.ts`: keep `readSpecFromGit` (`execSync` git show → core parse)
- Unit tests: JSON, YAML-temp, empty throw
- **Out of scope:** git/`execSync` in core; parse+expand combined helper; `core/index` export; resolve/expand / validate merge

## Capabilities

### New Capabilities

- `spec-load-parse-content`: Spec-load leaf that parses OpenAPI content strings (JSON/YAML) without git I/O

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- New `src/core/specLoad/parseOpenApiContent.ts` + tests
- Slim `src/cli/analyzeDiff/specParser.ts`
- No BREAKING public API
