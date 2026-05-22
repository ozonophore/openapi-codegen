## Usage

The CLI tool supports six commands: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, and `analyze-diff`.

### Command: `generate`

Generates TypeScript client code based on OpenAPI specifications.

**Basic usage:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**All available options:**

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--input` | `-i` | string | - | OpenAPI specification (path, URL, or string content) - **required** |
| `--output` | `-o` | string | - | Output directory - **required** |
| `--openapi-config` | `-ocn` | string | `openapi.config.json` | Path to configuration file |
| `--outputCore` | `-oc` | string | `{output}` | Output directory for core files |
| `--outputServices` | `-os` | string | `{output}` | Output directory for services |
| `--outputModels` | `-om` | string | `{output}` | Output directory for models |
| `--outputSchemas` | `-osm` | string | `{output}` | Output directory for schemas |
| `--httpClient` | `-c` | string | `fetch` | HTTP client to generate: `fetch`, `xhr`, `node`, or `axios` |
| `--useOptions` | - | boolean | `false` | Use options instead of arguments |
| `--useUnionTypes` | - | boolean | `false` | Use union types instead of enums |
| `--excludeCoreServiceFiles` | - | boolean | `false` | Exclude generation of core and service files |
| `--request` | - | string | - | Path to custom request file |
| `--customExecutorPath` | - | string | - | Path to custom `createExecutorAdapter` module |
| `--interfacePrefix` | - | string | `I` | Prefix for interface models |
| `--enumPrefix` | - | string | `E` | Prefix for enum models |
| `--typePrefix` | - | string | `T` | Prefix for type models |
| `--useCancelableRequest` | - | boolean | `false` | Use cancelable promise as return type |
| `--sortByRequired` | `-s` | boolean | `false` | Use extended sorting strategy for function arguments |
| `--useSeparatedIndexes` | - | boolean | `false` | Use separate index files for core, models, schemas, and services |
| `--strict-openapi` | - | boolean | `false` | Enable strict OpenAPI diagnostics and fail generation when strict errors are found |
| `--report-file` | - | string | `./openapi-report.json` | Path to strict OpenAPI diagnostics report JSON file |
| `--logLevel` | `-l` | string | `error` | Logging level: `info`, `warn`, or `error` |
| `--logTarget` | `-t` | string | `console` | Logging target: `console` or `file` |
| `--validationLibrary` | - | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |
| `--emptySchemaStrategy` | - | string | `keep` | Strategy for empty schemas: `keep`, `semantic`, or `skip` |
| `--modelsMode` | - | string | `interfaces` | Models generation mode: `interfaces` or `classes` |
| `--useHistory` | - | boolean | `false` | Apply diff report annotations during generation |
| `--diffReport` | - | string | `./openapi-diff-report.json` | Path to diff report JSON |
| `--useProjectPrettier` | - | boolean | `false` | Use the project’s Prettier config to format generated code |
| `--useEslintFix` | - | boolean | `false` | Run ESLint `--fix` on generated files after write (requires `eslint` in the project) |
| `--cache` | - | boolean | `false` | Enable generation cache (disabled by default) |
| `--cachePath` | - | string | `.openapi-codegen-cache.json` | Path to generation cache file relative to output directory |
| `--cacheStrategy` | - | string | `entity` | Cache strategy: `entity` (skip full item generation on cache hit) or `content` (always generate, but only write changed files) |
| `--cacheDebug` | - | boolean | `false` | Show cache hit/miss debug logs |

**Examples:**
```bash
# Basic generation
openapi generate --input ./spec.json --output ./dist

# With custom HTTP client
openapi generate --input ./spec.json --output ./dist --httpClient axios

# With configuration file
openapi generate --openapi-config ./my-config.json

# With all options via CLI
openapi generate \
  --input ./spec.json \
  --output ./dist \
  --httpClient fetch \
  --useOptions \
  --useUnionTypes \
  --logLevel info
```

### Command: `check-config`

Validates the configuration file structure and values.

**Usage:**
```bash
openapi check-config
openapi check-config --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)

### Command: `update-config`

Updates the configuration file to the latest supported schema version.

**Usage:**
```bash
openapi update-config
openapi update-config --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)

### Command: `init`

Generates a configuration file template.

**Usage:**
```bash
# Generate config using default settings
openapi init

# Custom config file name
openapi init --openapi-config ./my-config.json

# Specify directory with OpenAPI specs
openapi init --specs-dir ./openapi
```

**Options:**
- `--openapi-config` / `-ocn` - Path to output configuration file (default: `openapi.config.json`)
- `--specs-dir` / `-sd` - Directory with OpenAPI specification files (default: `./openapi`)
- `--request` - Path to custom request file
- `--useCancelableRequest` - Generate cancelable request handling
- `--useInteractiveMode` - Enable interactive mode for guided setup

### Command: `preview-changes`

Previews differences between already generated code and newly generated output without overwriting your current generated directory.

**Usage:**
```bash
openapi preview-changes
openapi preview-changes --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)
- `--generated-dir` / `-gd` - Directory with current generated files (default: `./generated`)
- `--preview-dir` / `-pd` - Temporary preview generation directory (default: `./.ts-openapi-codegen-preview-changes`)
- `--diff-dir` / `-dd` - Directory for diff reports (default: `./.ts-openapi-codegen-diff-changes`)

### Command: `analyze-diff`

Analyzes differences between two OpenAPI specifications and produces a JSON report.

**Usage:**
```bash
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml --output-report ./openapi-diff-report.json
openapi analyze-diff --input ./openapi/spec.yaml --git HEAD~1
```

**Options:**
- `--input` / `-i` - Path to current OpenAPI specification file (required)
- `--compare-with` - Path to previous OpenAPI specification file (has priority over `--git` when both are set)
- `--git` - Git ref to read previous specification version from (e.g. `HEAD~1`)
- `--output-report` - Path to save JSON diff report (default: `./openapi-diff-report.json`)
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`); v2 plugin hooks load `plugins` from this file
- `--governance-config` - Path to governance rules JSON config file
- `--strict-plugin-mode` - Fail when a plugin hook throws (default: log and continue)
- `--ci` - Exit with code 1 when governance errors are found
- `--allow-breaking` - Allow breaking changes in governance checks

**Plugin hooks (v2):** register plugin module paths in `plugins` inside `openapi.config.json`. See [Plugin API v2 (RFC)](plugin-api-v2.md).

#### Miracles and confirmation

The diff report can contain a `miracles` section with detected renames/type-coercions. Only confirmed miracles are applied in generation.

**How to confirm miracles:**
1. Run `analyze-diff` and open the generated report (default: `./openapi-diff-report.json`).
2. Find the entry in `miracles` you want to accept.
3. Change `"status": "auto-generated"` to `"status": "confirmed"` and commit the report.

Example (excerpt):
```json
{
  "miracles": [
    {
      "oldPath": "$.components.schemas.User.properties.user_name",
      "newPath": "$.components.schemas.User.properties.userName",
      "type": "RENAME",
      "confidence": 0.85,
      "status": "confirmed"
    }
  ]
}
```
