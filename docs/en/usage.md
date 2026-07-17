## Usage

The CLI tool supports seven commands: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, `analyze-diff`, and `analyze-usage`.

### Quick decision table

| I want to… | Use command |
|------------|-------------|
| Create a configuration file | `init` |
| Generate a client | `generate` |
| Preview output before overwriting | `preview-changes` |
| Check for breaking changes in the spec | `analyze-diff` |
| Verify my app still calls existing endpoints | `analyze-usage` |
| Validate the configuration file | `check-config` |
| Upgrade config to the latest schema | `update-config` |

---

### Command: `generate`

> **When to use:** First step after `init`. Run after every OpenAPI spec change to regenerate the TypeScript client. Use `--httpClient`, `--useOptions`, and `--validationLibrary` to match your project's stack.

Generates TypeScript client code based on OpenAPI specifications.

**Basic usage:**
```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist
```

**All available options:**

> **How to read this table:**
> - **Required vs Optional:** Options without a default value are required. Others are optional and inherit defaults from `openapi.config.json` if not overridden.
> - **Global vs Command-specific:** Global options (like `--openapi-config`) apply to most commands. Command-specific options (like `--httpClient`, `--cache`) apply only to `generate`.
> - **Config file relationship:** Most CLI flags map directly to configuration file keys: `--httpClient fetch` on CLI equals `"httpClient": "fetch"` in config. When both are set, CLI flags take precedence.
> - **Preview flags:** Marauder preview flags (like `--auto-select`, `--spec-analysis`) use dot-notation for sub-options (e.g., `--auto-select.strict`) or inline JSON (e.g., `--auto-select='{"strict":true}'`).

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
| | | | | **When to use:** Choose based on your runtime and use case: `fetch` (default, browser/Node.js 18+), `xhr` (browser XHR), `node` (Node.js request agent), `axios` (mature ecosystem). Pair with `--validationLibrary` for full stack compatibility. |
| `--useOptions` | - | boolean | `false` | Use options instead of arguments |
| | | | | **When to use:** Enable when your spec uses multiple different request/response schemas across endpoints (multi-spec config). With single specs, this is rarely needed. When enabled, function signatures accept a single options object instead of positional arguments, reducing parameter count. |
| `--useUnionTypes` | - | boolean | `false` | Use union types instead of enums |
| `--excludeCoreServiceFiles` | - | boolean | `false` | Exclude generation of core and service files |
| `--request` | - | string | - | Path to custom request file |
| | | | | **Legacy HTTP customization:** Use `--request` only if you have a legacy custom transport (pre-2.0.0 RequestExecutor). For modern projects, use `--customExecutorPath` instead. See [RequestExecutor migration](features.md#request-executor-migration-guide) in features.md. |
| `--customExecutorPath` | - | string | - | Path to custom `createExecutorAdapter` module |
| | | | | **Modern HTTP customization:** Recommended approach for projects on 2.0.0+. Accepts a module exporting `createExecutorAdapter` or compatible executor factory. Enables request/response interceptors, retries, and middleware. See [RequestExecutor features](features.md#request-executor-features) in features.md. |
| `--interfacePrefix` | - | string | `I` | Prefix for interface models |
| `--enumPrefix` | - | string | `E` | Prefix for enum models |
| `--typePrefix` | - | string | `T` | Prefix for type models |
| `--useCancelableRequest` | - | boolean | `false` | Use cancelable promise as return type |
| `--sortByRequired` | `-s` | boolean | `false` | Use extended sorting strategy for function arguments |
| `--useSeparatedIndexes` | - | boolean | `false` | Use separate index files for core, models, schemas, and services |
| `--strict-openapi` | - | boolean | `false` | Enable strict OpenAPI diagnostics and fail generation when strict errors are found |
| | | | | **CI gate usage:** Enable in CI pipelines to block generation on spec quality issues (missing operationId, structural problems, governance violations). Pair with `--governance-config` and `--fail-on-governance-errors` for full validation. Use `--logLevel info` to see detailed diagnostics. |
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
| | | | | **When to use:** Enable on slow CI systems to skip regeneration of unchanged specs. Use `entity` strategy for multi-spec projects or `reuse` for shared model caching. Adds disk overhead; profile before enabling in frequent local dev. |
| `--cachePath` | - | string | `.openapi-codegen-store` | Cache store path (relative to output for `entity`; global store root for `reuse`) |
| `--cacheStrategy` | - | string | from config | Cache strategy: `entity`, `reuse`, or `content` (omit flag to keep config value) |
| | | | | **Strategy selection:** Use `entity` for per-spec caching (fast, isolated). Use `reuse` when sharing models across multiple specs (requires conflict resolution via `--reuseOnConflict`). Use `content` for minimal caching (content-hash based). |
| `--reuseOnConflict` | - | string | from config | Reuse store conflict policy: `fail` or `namespace` (when `cacheStrategy` is `reuse`) |
| `--cacheDebug` | - | boolean | `false` | Show cache hit/miss debug logs |
| `--auto-select` | - | boolean \| object | `false` | Project-aware HTTP client and validation library selection (*preview*) |
| | | | | **Marauder auto-select (preview):** Automatically detects your project's dependencies (package.json, imports) and selects compatible `--httpClient` and `--validationLibrary`. Use `--auto-select.strict` to fail if no match. See [Marauder preview features](features.md#marauder-preview-features). |
| `--spec-analysis` | - | boolean \| object | `false` | OpenAPI spec quality analysis during generation (*preview*) |
| | | | | **Marauder anomaly detection (preview):** Analyzes spec quality and detects structural anomalies (missing operationId, orphaned parameters, etc.). Use `--spec-analysis.fail-on-high` to block generation on high-severity issues. Requires explicit enabling; off by default. See [Marauder preview features](features.md#marauder-preview-features). |
| `--anomaly-detection` | - | boolean \| object | `false` | Deprecated alias for `--spec-analysis` |

**Marauder preview flags (dot-notation):** `--auto-select`, `--auto-select.strict`, `--spec-analysis.fail-on-high`, inline JSON (`--auto-select='{"strict":true}'`). Parsed before Commander; see [Marauder preview features](features.md#marauder-preview-features).

**Examples:**
```bash
# Basic generation
openapi-codegen-cli generate --input ./spec.json --output ./dist

# With custom HTTP client
openapi-codegen-cli generate --input ./spec.json --output ./dist --httpClient axios

# With configuration file
openapi-codegen-cli generate --openapi-config ./my-config.json

# With all options via CLI
openapi-codegen-cli generate \
  --input ./spec.json \
  --output ./dist \
  --httpClient fetch \
  --useOptions \
  --useUnionTypes \
  --logLevel info
```

### Command: `check-config`

> **When to use:** Run when you see configuration errors or after manually editing `openapi.config.json`. Also useful as a pre-generate step in CI to catch misconfigurations early.

Validates the configuration file structure and values.

**Usage:**
```bash
openapi-codegen-cli check-config
openapi-codegen-cli check-config --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)

### Command: `update-config`

> **When to use:** Run after upgrading `ts-openapi-codegen` to a new major or minor version. Migrates your `openapi.config.json` to current schema, adding the `autoSelect` and `specAnalysis` blocks.

Updates the configuration file to the latest supported schema version.

**Usage:**
```bash
openapi-codegen-cli update-config
openapi-codegen-cli update-config --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)

### Command: `init`

> **When to use:** The very first step when setting up the tool in a new project. Creates an `openapi.config.json` template you can customize before running `generate`.

Generates a configuration file template.

**Usage:**
```bash
# Generate config using default settings
openapi-codegen-cli init

# Custom config file name
openapi-codegen-cli init --openapi-config ./my-config.json

# Specify directory with OpenAPI specs
openapi-codegen-cli init --specs-dir ./openapi
```

**Options:**
- `--openapi-config` / `-ocn` - Path to output configuration file (default: `openapi.config.json`)
- `--specs-dir` / `-sd` - Directory with OpenAPI specification files (default: `./openapi`)
- `--request` - Path to custom request file
- `--requestFormat` - Scaffold format when `--request` is set: `transport` | `adapter` | `executor` (default: `transport`)
- `--useCancelableRequest` - Generate cancelable request handling
- `--useInteractiveMode` - Enable interactive mode for guided setup

### Command: `preview-changes`

> **When to use:** Before applying a spec update to a production codebase. Shows exactly which generated files will change so you can review the diff and plan any required consumer-side updates.

Previews differences between already generated code and newly generated output without overwriting your current generated directory.

**Usage:**
```bash
openapi-codegen-cli preview-changes
openapi-codegen-cli preview-changes --openapi-config ./custom-config.json
```

**Options:**
- `--openapi-config` / `-ocn` - Path to configuration file (default: `openapi.config.json`)
- `--generated-dir` / `-gd` - Directory with current generated files (default: `./generated`)
- `--preview-dir` / `-pd` - Temporary preview generation directory (default: `./.ts-openapi-codegen-preview-changes`)
- `--diff-dir` / `-dd` - Directory for diff reports (default: `./.ts-openapi-codegen-diff-changes`)

### Command: `analyze-diff`

> **When to use:** On every PR that changes the OpenAPI spec. Detects breaking changes and governance violations before they reach consumers. Use `--ci` to fail CI on errors, and `--allow-breaking` to permit intentional breaking changes.

Analyzes differences between two OpenAPI specifications and produces a JSON report.

**Usage:**
```bash
openapi-codegen-cli analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
openapi-codegen-cli analyze-diff --input ./openapi/spec.yaml --git HEAD~1
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

**Plugin hooks (v2):** register plugin module paths in `plugins` inside `openapi.config.json`. See [Plugin API v2 (RFC)](features.md#plugin-api-v2-rfc).

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

> **When to use:** After `generate` in CI to verify that your application still imports and calls every endpoint in the generated client. Use `--check` to fail CI when ERROR-level mismatches are found. Pair with `--diff-report` to cross-validate RENAME miracles.

Analyzes how a TypeScript consumer project uses generated API exports and writes a JSON report. Imports are resolved **path-based** from `--sourcePath`: any import that resolves (via TypeScript module resolution) to the generated entry file or a file under its directory is treated as an API import. Module aliases such as `@my-org/api` are supported when they resolve to that path.

**Usage:**
```bash
openapi-codegen-cli analyze-usage --sourcePath ./generated/index.ts --projectPath . --tsconfigPath ./tsconfig.json
openapi-codegen-cli analyze-usage --sourcePath ./src/api/index.ts --projectPath . --output ./api-report.json --check
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
openapi-codegen-cli analyze-diff \
  --input ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci

# 2. Generate with strict diagnostics + governance gate
openapi-codegen-cli generate \
  --openapi-config ./openapi.config.json \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

# 3. Consumer contract check (optional RENAME miracle cross-check)
openapi-codegen-cli analyze-usage \
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
openapi-codegen-cli generate --input ./openapi/spec.yaml --output ./generated
openapi-codegen-cli analyze-usage --sourcePath ./generated/index.ts --projectPath . --check
tsc --noEmit
```
