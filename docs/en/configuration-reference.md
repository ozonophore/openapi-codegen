# Configuration reference

All keys for `openapi.config.json` (schema V6). For copy-paste patterns see [config recipes](config-recipes.md).

Run `openapi-codegen-cli init` to scaffold a template, or `openapi-codegen-cli update-config` to migrate an older file.

## Single vs multi format

**Single:**

```json
{
  "input": "./spec.json",
  "output": "./dist",
  "httpClient": "fetch"
}
```

**Multi (shared root + items):**

```json
{
  "httpClient": "fetch",
  "output": "./dist",
  "items": [
    { "input": "./first.yml" },
    { "input": "./second.yml", "output": "./dist-v2" }
  ]
}
```

Root-level keys apply to all items unless overridden per item.

## Core keys

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `input` | string | — | OpenAPI spec path/URL (required for items) |
| `output` | string | — | Output directory (required) |
| `outputCore` | string | `{output}` | Core files output |
| `outputServices` | string | `{output}` | Services output |
| `outputModels` | string | `{output}` | Models output |
| `outputSchemas` | string | `{output}` | Schemas output |
| `httpClient` | string | `fetch` | HTTP client template: `fetch`, `xhr`, `node`, `axios` |
| `items` | array | — | Multi-spec configurations |

## HTTP execution

> **Detailed guide:** [request-executor.md](request-executor.md) — glossary, M0–M12, codegen A–F, runtime R1–R5.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `request` | string | — | Path to custom **transport** module; copied to `core/request.ts` at codegen |
| `customExecutorPath` | string | — | Path to module exporting `createExecutorAdapter`; copied to `core/executor/createExecutorAdapter.ts` |
| `useCancelableRequest` | boolean | `false` | Return `CancelablePromise` from service methods |

Validate with `openapi-codegen-cli check-config`. See [hub § check-config](request-executor.md#check-config-workflow) for warning messages.

## Generation style

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `useOptions` | boolean | `false` | Object-style function parameters |
| `useUnionTypes` | boolean | `false` | Union types instead of enums |
| `excludeCoreServiceFiles` | boolean | `false` | Skip core and service generation |
| `interfacePrefix` | string | `I` | Interface model prefix |
| `enumPrefix` | string | `E` | Enum prefix |
| `typePrefix` | string | `T` | Type alias prefix |
| `sortByRequired` | boolean | `false` | Sort params with required first |
| `useSeparatedIndexes` | boolean | `false` | Separate index files per layer |
| `modelsMode` | string | `interfaces` | `interfaces` or `classes` |

## Validation & schemas

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `validationLibrary` | string | `none` | `none`, `zod`, `joi`, `yup`, `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | `keep`, `semantic`, `skip` |

## Diff report & history

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `useHistory` | boolean | `false` | Apply diff report during generation |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Diff report path |
| `analyze` | object | — | Nested: `useHistory`, `reportPath`, `ignore` |
| `miracles` | object | — | `enabled`, `confidence`, `types` |

## Strict OpenAPI & governance

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `strictOpenapi` | boolean | `false` | Strict diagnostics; fail on strict errors |
| `failOnGovernanceErrors` | boolean | `false` | Fail when governance has errors (needs strict) |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Strict diagnostics report path |

## Cache

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `cache` | boolean | `false` | Enable generation cache |
| `cachePath` | string | `.openapi-codegen-store` | Cache store path |
| `cacheStrategy` | string | `entity` | `entity`, `reuse`, or `content` |
| `reuseOnConflict` | string | `fail` | `fail` or `namespace` (reuse strategy) |
| `cacheDebug` | boolean | `false` | Cache hit/miss debug logs |

## Formatting & lint

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `prettierConfigPath` | string | — | Prettier config for generated output |
| `tsconfigPath` | string | — | Project tsconfig (with eslintConfigPath) |
| `eslintConfigPath` | string | — | ESLint config (with tsconfigPath) |

## Plugins

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `plugins` | string[] | `[]` | Generator plugin module paths |

See [plugins.md](plugins.md) and [plugin-api-v2.md](plugin-api-v2.md).

## Marauder preview (V6)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoSelect` | boolean \| object | `false` | Auto HTTP client / validation library selection |
| `specAnalysis` | boolean \| object | `false` | OpenAPI quality analysis during generate |
| `anomalyDetection` | boolean \| object | — | **Deprecated alias** for `specAnalysis` |
| `anomalyExploitation` | boolean \| object | `false` | Apply spec analysis fixes during generate |

See [Marauder user guide](../MARAUDER_USER_GUIDE.md).

## CLI equivalents

Most keys have CLI flags on `generate`. Common mappings:

| Config key | CLI flag |
|------------|----------|
| `httpClient` | `--httpClient` / `-c` |
| `request` | `--request` |
| `customExecutorPath` | `--customExecutorPath` |
| `validationLibrary` | `--validationLibrary` |
| `useHistory` | `--useHistory` |

Full flag list: [cli-reference.md](cli-reference.md).

## Related

- [Config recipes](config-recipes.md)
- [RequestExecutor hub](request-executor.md)
- [Getting started](getting-started.md)
