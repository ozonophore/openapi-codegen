## ADDED Requirements

### Requirement: Git readSpecFromGit paths are POSIX
`readSpecFromGit` (CLI-адаптер) MUST передавать POSIX-пути в Git (`test/spec/v3.json`). Он MUST NOT передавать разделители Windows (`test\\spec\\v3.json`).

#### Scenario: git show получает путь со слешем
- **WHEN** analyze-diff загружает спеку из Git ref на Windows
- **THEN** путь после `ref:` MUST быть POSIX (`test/spec/v3.json`), не `test\\spec\\v3.json`
