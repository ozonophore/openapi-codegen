# Marauder Reference

> Human docs: `node_modules/ts-openapi-codegen/docs/MARAUDER_USER_GUIDE.md`

Schema **V6**. Run `openapi-codegen-cli update-config` to migrate older configs.

## autoSelect

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Run project analysis before generate |
| `strict` | boolean | `false` | Only pick from deps found in `package.json` |
| `preferSmallBundles` | boolean | `false` | Prefer smaller HTTP client bundles |
| `preferStandards` | boolean | `false` | Prefer fetch + standards-based stack |

**CLI dot-notation:** `--auto-select.strict=true`, `--auto-select.prefer-small-bundles=true`

**Scope:** root-level only (copied to all items). Defaults without signals: `fetch` + `validationLibrary: none`.

**Programmatic API:** `import { AutoSelector, ProjectProbe } from 'ts-openapi-codegen'`

## specAnalysis

Canonical name (replaces deprecated `anomalyDetection` alias).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Run during generate |
| `severity` | `low` \| `medium` \| `high` | `medium` | Minimum severity floor |
| `failOnHigh` | boolean | `false` | Fail generate if any **high** severity finding |
| `reportFormat` | `json` \| `markdown` \| `html` | `json` | Report file format |
| `reportPath` | string | `./anomaly-report.{ext}` | Output path (cwd-relative) |
| `crossSpec` | boolean | `true` | Cross-spec detectors for multi-spec configs |

**CLI:** `--spec-analysis`, `--spec-analysis.fail-on-high=true`, `--spec-analysis.severity=high`

**Deprecated CLI alias:** `--anomaly-detection` (prefer `--spec-analysis`)

### Per-spec detectors (examples)

- `circular-schema-refs`, `deeply-nested-schema`, `inconsistent-response-types`
- `ambiguous-model-name`, `deprecated-in-active-paths`, `missing-operation-id`

### Cross-spec detectors

- `cross-spec-name-hash-conflict`, `cross-spec-reuse-opportunity`, `cross-spec-drift`

## Reuse cache

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `cache` | boolean | `false` | Enable generation cache |
| `cacheStrategy` | `entity` \| `reuse` \| `content` | `entity` | `reuse` = global ReuseStore across specs |
| `cachePath` | string | `.openapi-codegen-store` | Store directory |
| `reuseOnConflict` | `fail` \| `namespace` | `fail` | Conflict policy for shared artifacts |

**CLI:** `--cache --cacheStrategy reuse --cachePath .openapi-codegen-store`

## Strict OpenAPI + governance (related, not Marauder-only)

| Flag / field | Purpose |
|--------------|---------|
| `--strict-openapi` / `strictOpenapi` | Strict OpenAPI diagnostics |
| `--fail-on-governance-errors` / `failOnGovernanceErrors` | Fail on governance errors in CI |

## Related

- [SKILL.md](SKILL.md) — decision tree and workflow
- [examples.md](examples.md) — scenarios A–F
