## 1. Implement

- [x] 1.1 Add `src/core/specLoad/parseOpenApiContent.ts` (behavior-identical to CLI `parseSpecContent`)
- [x] 1.2 Thin `specParser.ts`: `readSpecFromGit` → core `parseOpenApiContent`
- [x] 1.3 Unit tests: JSON / YAML-temp / empty throw

## 2. Verify

- [x] 2.1 tsc / knip / openspec validate; `graphify update .`
