## ADDED Requirements

### Requirement: Diff report enriches semantic reports before produce
Система MUST предоставлять Diff report leaf `enrichSemanticDiffReport`, который применяет plugin hooks, ignore filter, governance evaluate и miracles attach в этом порядке и возвращает `{ report, ignored, reportPath }`. MUST NOT выполнять Spec load, `analyzeOpenApiDiff`, Unified produce, disk write или CI logging внутри enrich. MUST NOT встраивать enrich внутрь `produceUnifiedDiffReport`.

#### Scenario: Enrich order
- **WHEN** enrich получает base report, plugins, ignore rules и governance config
- **THEN** hooks применяются до ignore filter, а governance и miracles выставляются на отфильтрованном report

#### Scenario: Ignored count and reportPath
- **WHEN** ignore rules отфильтровывают changes и hooks меняют `reportPath`
- **THEN** результат содержит обновлённый `ignored` и `reportPath` из hooks

### Requirement: Ignore filter lives in Diff report
Система MUST хранить `filterSemanticChangesByIgnoreRules` и `matchesIgnoreRule` (плюс `IgnoreRule` / minimal path-match `DiffEntry`) в Diff report package. CLI MUST сохранять только загрузку правил (`loadIgnoreRules`).

#### Scenario: CLI does not own filter implementation
- **WHEN** analyze-diff applies ignore rules
- **THEN** filtering выполняется через Diff report / enrich, а не через CLI `ignoreSemanticChanges` module
