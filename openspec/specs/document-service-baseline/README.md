# document-service-baseline

Main domain specs (reverse-spec baseline) для `ts-openapi-codegen`.

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

## Delta specs (sibling folders in `openspec/specs/`)

Implementation-detail specs referenced from baseline Purpose sections:

- `generate-cli-validation`, `generate-cli-marauder-flags`, `example-marauder-config`
- `artifact-fingerprint-correctness`, `reuse-auto-group-core`, `reuse-shared-core`, `reuse-namespace-paths`
- `models-classes-layout`, `yup-boolean-coercion`, `miracles-config-runtime`
- `logger-messages-english`

Source change (not archived): `openspec/changes/document-service-baseline/`
