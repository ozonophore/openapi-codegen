### Configuration File

Instead of passing all options via CLI, you can use a configuration file. Create `openapi.config.json` in your project root:

**Single options format:**
```json
{
    "input": "./spec.json",
    "output": "./dist",
    "client": "fetch",
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
    "customExecutorPath": "./custom/createExecutorAdapter.ts",
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
    "client": "fetch",
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

**Array format (multiple configs):**
```json
[
    {
        "input": "./first.yml",
        "output": "./dist",
        "client": "xhr"
    },
    {
        "input": "./second.yml",
        "output": "./dist",
        "client": "fetch"
    }
]
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `input` | string | - | OpenAPI specification path/URL (required for items) |
| `output` | string | - | Output directory (required) |
| `outputCore` | string | `{output}` | Output directory for core files |
| `outputServices` | string | `{output}` | Output directory for services |
| `outputModels` | string | `{output}` | Output directory for models |
| `outputSchemas` | string | `{output}` | Output directory for schemas |
| `client` | string | `fetch` | HTTP client: `fetch`, `xhr`, `node`, or `axios` |
| `useOptions` | boolean | `false` | Use options instead of arguments |
| `useUnionTypes` | boolean | `false` | Use union types instead of enums |
| `excludeCoreServiceFiles` | boolean | `false` | Exclude core and service files generation |
| `request` | string | - | Path to custom request file |
| `plugins` | string[] | `[]` | Paths to generator plugins |
| `customExecutorPath` | string | - | Path to custom `createExecutorAdapter` module |
| `interfacePrefix` | string | `I` | Prefix for interface models |
| `enumPrefix` | string | `E` | Prefix for enum models |
| `typePrefix` | string | `T` | Prefix for type models |
| `useCancelableRequest` | boolean | `false` | Use cancelable promise as return type |
| `sortByRequired` | boolean | `false` | Extended sorting strategy for arguments |
| `useSeparatedIndexes` | boolean | `false` | Use separate index files |
| `strictOpenapi` | boolean | `false` | Enable strict OpenAPI diagnostics and fail generation on strict errors |
| `reportFile` | string | `./.openapi-codegen-reports/openapi-report.json` | Path to strict OpenAPI diagnostics report JSON file |
| `failOnGovernanceErrors` | boolean | `false` | Fail generation when governance reports errors (requires `strictOpenapi`) |
| `governanceConfig` | string | - | Path to governance rules JSON config file |
| `items` | array | - | Array of configurations (for multi-options format) |
| `validationLibrary` | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Strategy for empty schemas: `keep`, `semantic`, or `skip` |
| `modelsMode` | string | `interfaces` | Models generation mode: `interfaces` or `classes` |
| `useHistory` | boolean | `false` | Apply diff report annotations during generation |
| `diffReport` | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Path to diff report JSON |
| `models` | object | - | Models config section (e.g. `mode`) |
| `analyze` | object | - | Analyze config section (e.g. reportPath, useHistory, ignore) |
| `miracles` | object | - | Miracles config section (enabled, confidence, types) |
| `cache` | boolean | `false` | Enable generation cache |
| `cachePath` | string | `.openapi-codegen-store` | Cache store path (`entity`: per-output file; `reuse`: global store root) |
| `cacheStrategy` | string | `reuse` (V6 schema); `entity` after v5→v6 migration | Cache strategy: `entity`, `reuse`, or `content` |
| `reuseOnConflict` | string | `fail` | Reuse store conflict policy: `fail` or `namespace` |
| `cacheDebug` | boolean | `false` | Show cache hit/miss debug logs |
| `autoSelect` | object \| boolean | disabled | Project-aware HTTP client and validation library selection (*preview*, root only) |
| `specAnalysis` | object \| boolean | disabled | OpenAPI spec quality analysis during generate (*preview*; root and per-item) |
| `anomalyDetection` | object \| boolean | - | Deprecated alias for `specAnalysis` |
| `prettierConfigPath` | string | - | Path to a Prettier config file for formatting generated output |
| `tsconfigPath` | string | - | Path to `tsconfig.json` for batch ESLint fix (used together with `eslintConfigPath`) |
| `eslintConfigPath` | string | - | Path to ESLint config for batch ESLint fix (used together with `tsconfigPath`) |

**Note:** You can use the `init` command to generate a template configuration file. Run `update-config` to migrate to schema **V6** (adds `autoSelect` and `specAnalysis` blocks). See [Marauder user guide](../MARAUDER_USER_GUIDE.md) for preview features.

### Plugins

Generator plugins can override schema type mapping (for example via `x-typescript-type`) and extend generation behavior.

- Configuration key: `plugins` (array of module paths)
- Supported module formats: CJS, ESM, and TS (when runtime supports TS imports)
- Full guide: [Plugins](plugins.md)
- Plugin API v2 (RFC, `analyze-diff` hooks): [Plugin API v2](plugin-api-v2.md)
