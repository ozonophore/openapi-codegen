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
    "diffReport": "./openapi-diff-report.json",
    "models": {
        "mode": "interfaces"
    },
    "analyze": {
        "useHistory": false,
        "reportPath": "./openapi-diff-report.json"
    },
    "miracles": {
        "enabled": true,
        "confidence": 1,
        "types": ["RENAME", "TYPE_COERCION"]
    },
    "plugins": ["./plugins/custom-type.plugin.cjs"],
    "customExecutorPath": "./custom/createExecutorAdapter.ts"
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
| `reportFile` | string | `./openapi-report.json` | Path to strict OpenAPI diagnostics report JSON file |
| `items` | array | - | Array of configurations (for multi-options format) |
| `validationLibrary` | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |
| `emptySchemaStrategy` | string | `keep` | Strategy for empty schemas: `keep`, `semantic`, or `skip` |
| `modelsMode` | string | `interfaces` | Models generation mode: `interfaces` or `classes` |
| `useHistory` | boolean | `false` | Apply diff report annotations during generation |
| `diffReport` | string | `./openapi-diff-report.json` | Path to diff report JSON |
| `models` | object | - | Models config section (e.g. `mode`) |
| `analyze` | object | - | Analyze config section (e.g. reportPath, useHistory, ignore) |
| `miracles` | object | - | Miracles config section (enabled, confidence, types) |

**Note:** You can use the `init` command to generate a template configuration file.

### Plugins

Generator plugins can override schema type mapping (for example via `x-typescript-type`) and extend generation behavior.

- Configuration key: `plugins` (array of module paths)
- Supported module formats: CJS, ESM, and TS (when runtime supports TS imports)
- Full guide: [docs/plugins.md](./docs/plugins.md)

