### Configuration File

> **Full reference:** [configuration-reference.md](configuration-reference.md)
> **Copy-paste recipes:** [config-recipes.md](config-recipes.md)
> **HTTP keys (`request`, `customExecutorPath`):** [request-executor.md](request-executor.md)

Instead of passing all options via CLI, you can use a configuration file. Create `openapi.config.json` in your project root:

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
    "validationLibrary": "none",
    "emptySchemaStrategy": "keep",
    "plugins": ["./plugins/custom-type.plugin.cjs"],
    "cache": false,
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

For the complete key table see [configuration-reference.md](configuration-reference.md).

**Note:** You can use `openapi-codegen-cli init` to generate a template configuration file.

### Plugins

Generator plugins can override schema type mapping (for example via `x-typescript-type`) and extend generation behavior.

- Configuration key: `plugins` (array of module paths)
- Full guide: [Plugins](plugins.md)
- Plugin API v2 (RFC, `analyze-diff` hooks): [Plugin API v2](plugin-api-v2.md)
