## ADDED Requirements

### Requirement: README domain baseline
Репозиторий MUST поддерживать `openspec/specs/document-service-baseline/README.md`, сопоставляющий domain spec folders с CLI entry points и перечисляющий связанные delta specs.

#### Scenario: Индекс baseline присутствует
- **WHEN** читатель открывает README document-service-baseline
- **THEN** таблица содержит ссылки на code-generation, generator-plugins, semantic-diff-analysis и другие домены с путями к spec

---

### Requirement: Core domain specs под baseline
Следующие capability areas MUST иметь spec-файлы под `openspec/specs/document-service-baseline/`:

- `code-generation`, `config-management`, `openapi-spec-parsing`, `generated-client-output`
- `semantic-diff-analysis`, `preview-changes`, `consumer-usage-analysis`, `spec-quality-analysis`
- `governance-and-strict-validation`, `generation-cache-and-reuse`, `auto-select-and-project-probe`
- `generator-plugins`, `canary-traffic-splitter`, `avatar-swarm`, `workspace-reporting`

#### Scenario: Domain spec generator-plugins
- **WHEN** читатель открывает `document-service-baseline/generator-plugins/spec.md`
- **THEN** требования покрывают загрузку плагинов, builtins и semantic diff hooks

---

### Requirement: Delta specs ссылаются на baseline
Sibling specs в `openspec/specs/` (например, `artifact-fingerprint-correctness`, `generate-cli-validation`) MUST включать ссылку `**Baseline:**` в Purpose на соответствующий spec `document-service-baseline/<domain>`.

#### Scenario: Fingerprint spec ссылается на baseline
- **WHEN** читатель открывает `artifact-fingerprint-correctness/spec.md`
- **THEN** секция Purpose ссылается на `document-service-baseline/generation-cache-and-reuse`

---

### Requirement: Консолидация orphaned core specs
Standalone specs, заменённые baseline-доменами (например, `avatar-swarm-core`, `traffic-splitter-core`, `workspace-report-core`, `pre-analyze-core`, `generation-cache-resilience`, `reuse-store-integrity`, `analyze-usage-diff-report`), MUST удаляться из `openspec/specs/`, когда baseline-эквиваленты существуют, после delta sync из этого change.

#### Scenario: Traffic splitter консолидирован
- **WHEN** baseline spec `canary-traffic-splitter` существует
- **THEN** standalone spec `traffic-splitter-core` отсутствует в main specs tree
