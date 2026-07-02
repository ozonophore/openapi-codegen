## Usage

The CLI tool supports seven commands: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, `analyze-diff`, and `analyze-usage`.

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
| `--fail-on-governance-errors` | - | boolean | `false` | Fail generation when governance violations include errors (requires `--strict-openapi`; config key: `failOnGovernanceErrors`) |
| `--report-file` | - | string | `./.openapi-codegen-reports/openapi-report.json` | Path to strict OpenAPI diagnostics report JSON file |
| `--governance-config` | - | string | - | Path to governance rules JSON config file |
| `--logLevel` | `-l` | string | `error` | Logging level: `info`, `warn`, or `error` |
| `--logTarget` | `-t` | string | `console` | Logging target: `console` or `file` |
| `--validationLibrary` | - | string | `none` | Validation library for schema generation: `none`, `zod`, `joi`, `yup`, or `jsonschema` |
| `--emptySchemaStrategy` | - | string | `keep` | Strategy for empty schemas: `keep`, `semantic`, or `skip` |
| `--modelsMode` | - | string | `interfaces` | Models generation mode: `interfaces` or `classes` |
| `--useHistory` | - | boolean | `false` | Apply diff report annotations during generation |
| `--diffReport` | - | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Path to diff report JSON |
| `--prettierConfigPath` | - | string | - | Path to a Prettier config file; when the file exists, generated code is formatted with it, otherwise built-in defaults are used |
| `--tsconfigPath` | - | string | - | Path to project `tsconfig.json` for batch ESLint `--fix` after generation (requires `--eslintConfigPath`) |
| `--eslintConfigPath` | - | string | - | Path to project ESLint config for batch ESLint `--fix` after generation (requires `--tsconfigPath`) |
| `--cache` | - | boolean | `false` | Enable generation cache (disabled by default) |
| `--cachePath` | - | string | `.openapi-codegen-store` | Cache store path (relative to output for `entity`; global store root for `reuse`) |
| `--cacheStrategy` | - | string | from config | Cache strategy: `entity`, `reuse`, or `content` (omit flag to keep config value) |
| `--reuseOnConflict` | - | string | from config | Reuse store conflict policy: `fail` or `namespace` (when `cacheStrategy` is `reuse`) |
| `--cacheDebug` | - | boolean | `false` | Show cache hit/miss debug logs |
| `--auto-select` | - | boolean \| object | `false` | Project-aware HTTP client and validation library selection (*preview*) |
| `--spec-analysis` | - | boolean \| object | `false` | OpenAPI spec quality analysis during generation (*preview*) |
| `--anomaly-detection` | - | boolean \| object | `false` | Deprecated alias for `--spec-analysis` |

**Marauder preview flags (dot-notation):** `--auto-select`, `--auto-select.strict`, `--spec-analysis.fail-on-high`, inline JSON (`--auto-select='{"strict":true}'`). Parsed before Commander; see [Marauder user guide](../MARAUDER_USER_GUIDE.md).

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
- `--requestFormat` - Scaffold format when `--request` is set: `transport` | `adapter` | `executor` (default: `transport`)
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
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
openapi analyze-diff --input ./openapi/spec.yaml --git HEAD~1
```

**Options:**
- `--input` / `-i` - Path to current OpenAPI specification file (required)
- `--compare-with` - Path to previous OpenAPI specification file (has priority over `--git` when both are set)
- `--git` - Git ref to read previous specification version from (e.g. `HEAD~1`)
- `--output-report` - Path to save JSON diff report (default: `./.openapi-codegen-reports/openapi-diff-report.json`)
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`); v2 plugin hooks load `plugins` from this file
- `--governance-config` - Path to governance rules JSON config file
- `--strict-plugin-mode` - Fail when a plugin hook throws (default: log and continue)
- `--ci` - Exit with code 1 when governance errors are found
- `--allow-breaking` - Allow breaking changes in governance checks

**Plugin hooks (v2):** register plugin module paths in `plugins` inside `openapi.config.json`. See [Plugin API v2 (RFC)](plugin-api-v2.md).

#### Miracles and confirmation

The diff report can contain `structural.miracles` (unified report v2.0.0) with detected renames/type-coercions. Only confirmed miracles are applied in generation.

**How to confirm miracles:**
1. Run `analyze-diff` and open the generated report (default: `./.openapi-codegen-reports/openapi-diff-report.json`).
2. Find the entry in `structural.miracles` you want to accept.
3. Change `"status": "auto-generated"` to `"status": "confirmed"` and commit the report.

Example (excerpt):
```json
{
  "structural": {
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
}
```

### Command: `analyze-usage`

Analyzes how a TypeScript consumer project uses generated API exports and writes a JSON report. Imports are resolved **path-based** from `--sourcePath`: any import that resolves (via TypeScript module resolution) to the generated entry file or a file under its directory is treated as an API import. Module aliases such as `@my-org/api` are supported when they resolve to that path.

**Usage:**
```bash
openapi analyze-usage --sourcePath ./generated/index.ts --projectPath . --tsconfigPath ./tsconfig.json
openapi analyze-usage --sourcePath ./src/api/index.ts --projectPath . --output ./api-report.json --check
```

**Options:**
- `--sourcePath` / `-s` - Path to generated API entry file (required)
- `--projectPath` / `-p` - Root path of consumer TypeScript project (required)
- `--tsconfigPath` / `-t` - Optional path to `tsconfig.json`
- `--output` / `-o` - Output JSON report file path (default: `./.openapi-codegen-reports/openapi-usage-report.json`)
- `--check` / `-c` - CI mode: exits with code `1` when ERROR-level mismatches are found
- `--diff-report` - Path to `analyze-diff` JSON report for RENAME miracle validation against consumer code

The command prints a usage summary to console and writes a JSON report with findings and coverage details.

Only files under `{projectPath}/src/**/*.{ts,tsx}` are scanned; code outside `src/` is ignored.

### Unified CI pipeline

End-to-end quality gate combining spec diff, codegen, and consumer validation:

```bash
# 1. Spec delta + governance (writes unified diff report v2.0.0)
openapi analyze-diff \
  --input ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci

# 2. Generate with strict diagnostics + governance gate
openapi generate \
  --openapi-config ./openapi.config.json \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

# 3. Consumer contract check (optional RENAME miracle cross-check)
openapi analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json

# 4. Typecheck
tsc --noEmit
```

**Severity mapping (shared diagnostics):** missing `operationId` appears as **info** in strict `issues[]` and **warning** in `governance.violations` (override to `error` via governance config). Use `--fail-on-governance-errors` on generate to block on governance errors when `--strict-openapi` is enabled.

Recommended minimal post-generate chain:
```bash
openapi generate --input ./openapi/spec.yaml --output ./generated
openapi analyze-usage --sourcePath ./generated/index.ts --projectPath . --check
tsc --noEmit
```
