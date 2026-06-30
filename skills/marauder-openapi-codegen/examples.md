# Marauder Examples

> Full guide: `node_modules/ts-openapi-codegen/docs/MARAUDER_USER_GUIDE.md`

## A — New frontend project

```bash
openapi-codegen-cli update-config -ocn openapi.config.json
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --auto-select
```

## B — Brownfield with fixed stack

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": true
  },
  "items": [{ "input": "./openapi/spec.yaml", "output": "./src/api" }]
}
```

## C — Spec quality gate in CI

```json
{
  "items": [{
    "input": "./openapi/spec.yaml",
    "output": "./src/api",
    "specAnalysis": {
      "enabled": true,
      "severity": "high",
      "failOnHigh": true,
      "reportPath": "./.openapi-codegen-reports/spec-analysis-report.json"
    }
  }]
}
```

```bash
openapi-codegen-cli generate -ocn openapi.config.json --spec-analysis
# dot-notation:
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api \
  --spec-analysis \
  --spec-analysis.fail-on-high=true \
  --spec-analysis.severity=high
```

With strict OpenAPI:

```bash
openapi-codegen-cli generate -ocn openapi.config.json \
  --spec-analysis \
  --strict-openapi \
  --fail-on-governance-errors
```

## D — Multi-spec reuse store

```json
{
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "namespace",
  "items": [
    { "input": "./specs/a.yaml", "output": "./generated/a" },
    { "input": "./specs/b.yaml", "output": "./generated/b" }
  ]
}
```

```bash
openapi-codegen-cli generate -ocn openapi.config.json
```

## E — Spec → client → consumer chain

```bash
openapi-codegen-cli analyze-diff \
  -i ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --ci

openapi-codegen-cli generate -ocn openapi.config.json --auto-select --spec-analysis

openapi-codegen-cli analyze-usage \
  -s ./src/api/index.ts \
  -p . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

## Combined config recipe

```json
{
  "autoSelect": { "enabled": true, "strict": false },
  "cache": true,
  "cacheStrategy": "reuse",
  "items": [{
    "input": "./openapi/spec.yaml",
    "output": "./src/api",
    "specAnalysis": { "enabled": true, "failOnHigh": false }
  }]
}
```
