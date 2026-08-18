# Domain specs

First-class OpenSpec capabilities (`openspec/specs/<domain>/spec.md`). Reverse-spec of product/CLI behavior.

## Domains

| Spec | CLI / entry |
|------|-------------|
| [code-generation](code-generation/spec.md) | `generate` |
| [config-management](config-management/spec.md) | `init`, `check-config`, `update-config` |
| [openapi-spec-parsing](openapi-spec-parsing/spec.md) | core parse pipeline |
| [generated-client-output](generated-client-output/spec.md) | WriteClient output |
| [semantic-diff-analysis](semantic-diff-analysis/spec.md) | `analyze-diff` |
| [preview-changes](preview-changes/spec.md) | `preview-changes` |
| [consumer-usage-analysis](consumer-usage-analysis/spec.md) | `analyze-usage` |
| [spec-quality-analysis](spec-quality-analysis/spec.md) | `specAnalysis`, `preAnalyze` |
| [governance-and-strict-validation](governance-and-strict-validation/spec.md) | `--strict-openapi`, governance |
| [generation-cache-and-reuse](generation-cache-and-reuse/spec.md) | cache / ReuseStore |
| [auto-select-and-project-probe](auto-select-and-project-probe/spec.md) | `--auto-select` |
| [generator-plugins](generator-plugins/spec.md) | plugins |
| [canary-traffic-splitter](canary-traffic-splitter/spec.md) | `--traffic-splitter` |
| [avatar-swarm](avatar-swarm/spec.md) | `--swarm` |
| [workspace-reporting](workspace-reporting/spec.md) | `--workspace-report` |

## Delta specs

Implementation-detail specs. They complement domains via `**Baseline:**` in Purpose — do not merge into domain files.

- CLI / config: `generate-cli-validation`, `generate-cli-marauder-flags`, `generate-cli-plugins`, `analyze-diff-cli-plugins`, `example-marauder-config`
- Generation lifecycle: `generation-options-resolve`, `generation-batch-session`, `generation-item-session`
- Parse / context: `spec-load-unify`, `context-resolved-factory`
- Write: `write-client-concern-split`, `reuse-write-session`, `models-classes-layout`, `yup-boolean-coercion`
- Cache / reuse: `artifact-fingerprint-correctness`, `entity-skip-fingerprint`, `reuse-auto-group-core`, `reuse-shared-core`, `reuse-namespace-paths`
- Plugins: `plugin-config-entries`, `plugin-docs-restore`
- Diff / quality: `diff-report-lifecycle`, `miracles-config-runtime`
- Cross-cutting: `logger-messages-english`
