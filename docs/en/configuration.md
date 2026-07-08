### Configuration File

Instead of passing all options via CLI, you can use a configuration file. Create `openapi.config.json` in your project root:

---

## Quick Decision Table

Use this table to find the keys you need for your use case:

| I want to… | Set these keys |
|-----------|----------------|
| Single OpenAPI spec | `input`, `output`, `httpClient` |
| Multiple specs | `items[]`, `output`, `httpClient` |
| Enable CI gates | `analyze`, `strictOpenapi`, `failOnGovernanceErrors` |
| Custom HTTP client | `customExecutorPath` (modern) or `request` (legacy) |
| Cache generated code | `cache: true`, `cacheStrategy: "entity"` or `"reuse"` |
| Preview: Auto-select | `autoSelect: true`, `specAnalysis` |

---

**Single options format:**
```json
{
    "input": "./spec.json",
    "output": "./dist",
    "httpClient": "fetch",
    "useOptions": false,
    "useUnionTypes": false,
    "excludeCoreServiceFiles": false,
    "interfacePrefix": "I",
    "enumPrefix": "E",
    "typePrefix": "T",
    "useCancelableRequest": false,
    "sortByRequired": false,
    "useSeparatedIndexes": false,
    "request": "./custom-request.ts",
    "customExecutorPath": "./custom/createExecutorAdapter.ts",
    "modelsMode": "interfaces",
    "useHistory": false,
    "diffReport": "./.openapi-codegen-reports/openapi-diff-report.json",
    "models": {
        "mode": "interfaces"
    },
    "analyze": {
        "useHistory": false,
        "reportPath": "./.openapi-codegen-reports/openapi-diff-report.json"
    },
    "miracles": {
        "enabled": true,
        "confidence": 1,
        "types": ["RENAME", "TYPE_COERCION"]
    },
    "plugins": ["./plugins/custom-type.plugin.cjs"],
    "cache": false,
    "cachePath": ".openapi-codegen-store",
    "cacheStrategy": "entity",
    "reuseOnConflict": "fail",
    "cacheDebug": false,
    "failOnGovernanceErrors": false,
    "autoSelect": {
        "enabled": false,
        "strict": false,
        "preferSmallBundles": false,
        "preferStandards": false
    },
    "specAnalysis": {
        "enabled": false,
        "severity": "medium",
        "reportFormat": "json",
        "reportPath": "./.openapi-codegen-reports/anomaly-report.json",
        "failOnHigh": false,
        "crossSpec": true,
        "maxNestingDepth": 5
    },
    "prettierConfigPath": "./.prettierrc",
    "tsconfigPath": "./tsconfig.json",
    "eslintConfigPath": "./eslint.config.mjs"
}
```

**Multi-options format (with common block):**
```json
{
    "output": "./dist",
    "httpClient": "fetch",
    "excludeCoreServiceFiles": true,
    "items": [
        {
            "input": "./first.yml"
        },
        {
            "input": "./second.yml",
            "output": "./dist-v2"
        }
    ]
}
```

---

### Tier 1 — Essential

**When to use:** Minimal config to get started.

These options are needed for every project. Set them in `openapi.config.json` before the first `generate`.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `input` | string | — | OpenAPI specification path/URL (required for items) |
| `output` | string | — | Output directory (required) |
| `httpClient` | string | `fetch` | HTTP client: `fetch`, `xhr`, `node`, or `axios` |
| `useOptions` | boolean | `false` | Use options instead of arguments |
| `useUnionTypes` | boolean | `false` | Use union types instead of enums |

---

### Tier 2 — Output structure

**When to use:** Shape the generated file tree.

Control where generated files are written and which ones are emitted.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `outputCore` | string | `{output}` | Output directory for core files |
| `outputServices` | string | `{output}` | Output directory for services |
| `outputModels` | string | `{output}` | Output directory for models |
| `outputSchemas` | string | `{output}` | Output directory for schemas |
| `excludeCoreServiceFiles` | boolean | `false` | Exclude core and service files generation |
| `useSeparatedIndexes` | boolean | `false` | Use separate index files for core, models, schemas, and services |
| `items` | array | — | Array of configurations (for multi-options format) |

---

### Tier 3 — Code style

**When to use:** Enforce code formatting and naming conventions.

Naming and formatting conventions for the generated output.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `interfacePrefix` | string | `I` | Prefix for interface models |
| `enumPrefix` | string | `E` | Prefix for enum models |
| `typePrefix` | string | `T` | Prefix for type models |
| `modelsMode` | string | `interfaces` | Models generation mode: `interfaces` or `classes` |
| `validationLibrary` | string | `none` | Validation library: `none`, `zod`, `joi`, `yup`, or `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Strategy for empty schemas: `keep`, `semantic`, or `skip` |
| `useCancelableRequest` | boolean | `false` | Use cancelable promise as return type |
| `sortByRequired` | boolean | `false` | Extended sorting strategy for arguments |
| `prettierConfigPath` | string | — | Path to a Prettier config file for formatting generated output |
| `tsconfigPath` | string | — | Path to `tsconfig.json` for batch ESLint fix (used together with `eslintConfigPath`) |
| `eslintConfigPath` | string | — | Path to ESLint config for batch ESLint fix (used together with `tsconfigPath`) |

---

### Tier 4 — Diff & governance

**When to use:** Enable breaking-change detection and governance gates.

Options for CI quality gates, spec validation, and breaking-change tracking.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `strictOpenapi` | boolean | `false` | Enable strict OpenAPI diagnostics and fail generation on strict errors |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Path to strict OpenAPI diagnostics report JSON file |
| `failOnGovernanceErrors` | boolean | `false` | Fail generation when governance reports errors (requires `strictOpenapi`) |
| `governanceConfig` | string | — | Path to governance rules JSON config file |
| `useHistory` | boolean | `false` | Apply diff report annotations during generation |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Path to diff report JSON |
| `analyze` | object | — | Analyze config section (reportPath, useHistory, ignore) |
| `miracles` | object | — | Miracles config section (enabled, confidence, types) |
| `plugins` | string[] | `[]` | Paths to generator plugins |

---

### Tier 5 — Cache / Reuse

**When to use:** Optimize repeated generations across specs.

Incremental generation strategies. Start with `entity` for a single spec, use `reuse` for multi-spec monorepos.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `cache` | boolean | `false` | Enable generation cache |
| `cachePath` | string | `.openapi-codegen-store` | Cache store path (`entity`: per-output file; `reuse`: global store root) |
| `cacheStrategy` | string | `reuse` (current schema) | Cache strategy: `entity`, `reuse`, or `content` |
| `reuseOnConflict` | string | `fail` | Reuse store conflict policy: `fail` or `namespace` |
| `cacheDebug` | boolean | `false` | Show cache hit/miss debug logs |

---

### Tier 6 — Preview (Marauder)

**When to use:** Enable Marauder preview features (2.1.0-beta.11).

Opt-in features added in current config schema. Run `update-config` to add these blocks. See [Marauder preview features](features.md#marauder-preview-features) for full details.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoSelect` | object \| boolean | disabled | Project-aware HTTP client and validation library selection (*preview*, root only) |
| `specAnalysis` | object \| boolean | disabled | OpenAPI spec quality analysis during generate (*preview*; root and per-item) |
| `anomalyDetection` | object \| boolean | — | Deprecated alias for `specAnalysis` |

---

### HTTP transport options

#### Modern: Custom request executor (RequestExecutor 2.0.0+)

Use `customExecutorPath` to provide a path to your custom `createExecutorAdapter` module:

```json
{
    "input": "./spec.json",
    "output": "./dist",
    "httpClient": "fetch",
    "customExecutorPath": "./src/custom/createExecutorAdapter.ts"
}
```

See [RequestExecutor Migration Guide](./request-executor-migration.md) for details.

#### Legacy: Custom request function

The `request` option is the legacy approach and is automatically migrated to `customExecutorPath` when you run `update-config`:

```json
{
    "input": "./spec.json",
    "output": "./dist",
    "httpClient": "fetch",
    "request": "./src/custom-request.ts"
}
```

**Note:** `request` is deprecated. New projects should use `customExecutorPath`.

#### Models sub-config

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `models` | object | — | Models config section (e.g. `mode`) |

---

## Overlapping Configuration Keys

Some keys can be set at both the root level and within nested config sections. Here's the precedence:

| Key | Root Level | Nested Location | Precedence | Notes |
|-----|-----------|-----------------|-----------|-------|
| `modelsMode` | `"modelsMode": "interfaces"` | `"models": { "mode": "interfaces" }` | Nested `models.mode` takes precedence | Use `models.mode` in modern configs; `modelsMode` is kept for backward compatibility |
| `useHistory` | `"useHistory": true` | `"analyze": { "useHistory": true }` | Nested `analyze.useHistory` takes precedence | Specific to diff analysis; set within `analyze` block |
| `diffReport` | `"diffReport": "./path"` | `"analyze": { "reportPath": "./path" }` | Nested `analyze.reportPath` takes precedence | Note the key name differs: `diffReport` vs. `reportPath` |

**Recommendation:** Prefer nested config (e.g., `models.mode`, `analyze.useHistory`) for new projects. Root-level variants are maintained for backward compatibility but may be deprecated in future versions.

**Note:** Use the `init` command to generate a template configuration file. Run `update-config` to migrate to current schema (adds `autoSelect` and `specAnalysis` blocks).

### Plugins

Generator plugins can override schema type mapping (for example via `x-typescript-type`) and extend generation behavior.

- Configuration key: `plugins` (array of module paths)
- Supported module formats: CJS, ESM, and TS (when runtime supports TS imports)
- Full guide: [Plugins](features.md#plugin-system)
- Plugin API v2 (RFC, `analyze-diff` hooks): [Plugin API v2](features.md#plugin-api-v2-rfc)
