# Migration Guide: 1.0.0 -> 2.0.0

This guide describes how to migrate from `1.0.0` to `2.0.0` based on the repository diff.

## Scope

This migration includes:
- CLI validation and config model changes.
- Runtime/core architecture updates (executor/interceptors).
- Schema generation option changes.
- Config versioning and migration behavior updates.

## Breaking Changes

### 1) Validation schemas option changed

`includeSchemasFiles` was removed and replaced by `validationLibrary`.

Before:
```json
{
  "includeSchemasFiles": true
}
```

After:
```json
{
  "validationLibrary": "zod"
}
```

Supported values:
- `none` (default)
- `zod`
- `joi`
- `yup`
- `jsonschema`

### 2) New empty schema behavior control

New option: `emptySchemaStrategy`

Allowed values:
- `keep` (default)
- `semantic`
- `skip`

Example:
```json
{
  "validationLibrary": "zod",
  "emptySchemaStrategy": "semantic"
}
```

### 3) Core/service runtime architecture changed

Service generation moved to `RequestExecutor`-based runtime.

Impact:
- If you had custom runtime integration around old request flow, update it to executor-based flow.
- New/updated generated core artifacts include executor/interceptor pieces (`core/executor`, interceptors-related files).

### 4) Config schema model unified

Legacy config families (`OPTIONS`, `MULTI_OPTIONS`) are migrated to unified schema (`UNIFIED_OPTIONS`).

Impact:
- Older config files should migrate automatically.
- If you had custom tooling reading raw config shape, align with unified model.

### 5) Removed/deprecated pieces

- `includeSchemasFiles` removed.
- Legacy CLI validation path replaced with Zod-based validation layer.
- Some internal legacy helpers and old request executor artifacts removed/refactored.

### 6) Direct `generate` validation behavior was tightened in `2.0.0`

For direct CLI mode (`--input` + `--output`):
- validation is now done via current Zod schema (`flatOptionsSchema`);
- generation runs only on successful validation.

If both direct options are invalid/empty and config file is missing, CLI now returns a clearer actionable error.

## New/Updated Options You Should Review

For CLI/config:
- `validationLibrary`
- `emptySchemaStrategy`
- `customExecutorPath`
- `previewChanges` command and its folders:
  - `.ts-openapi-codegen-preview-changes`
  - `.ts-openapi-codegen-diff-changes`

## Recommended Migration Steps

### Step 1: Update config keys

Replace in config files:
- `includeSchemasFiles` -> `validationLibrary`

Suggested mapping:
- `includeSchemasFiles: false` -> `validationLibrary: "none"`
- `includeSchemasFiles: true` -> choose explicit library (`"zod"`, `"joi"`, `"yup"`, or `"jsonschema"`)

### Step 2: Add strategy for empty schemas (optional but recommended)

Set `emptySchemaStrategy` explicitly to avoid ambiguity across environments.

### Step 3: Regenerate and review core runtime integration

Regenerate clients and check:
- executor integration,
- interceptor integration,
- custom request/executor adapters.

If you use custom adapter module, set `customExecutorPath`.

### Step 4: Validate and migrate config files

Run:
```bash
openapi-codegen-cli check-config --openapi-config ./openapi.config.json
openapi-codegen-cli update-config --openapi-config ./openapi.config.json
```

### Step 5: Verify generated diffs before applying

Use preview mode:
```bash
openapi-codegen-cli preview-changes --openapi-config ./openapi.config.json
```

### Step 6: Re-run tests/snapshots

Rebuild and update snapshots where runtime/core output changed.

## Before/After Example

Before (`1.0.0` style):
```json
{
  "input": "./spec.json",
  "output": "./generated",
  "httpClient": "fetch",
  "includeSchemasFiles": true
}
```

After (`2.x` style):
```json
{
  "input": "./spec.json",
  "output": "./generated",
  "httpClient": "fetch",
  "validationLibrary": "zod",
  "emptySchemaStrategy": "keep",
  "customExecutorPath": "./custom/createExecutorAdapter.ts"
}
```

## Compatibility Notes

- Config migration is built in, but explicit config cleanup is recommended.
- Direct `generate()` usage remains available, but internals changed significantly in `2.x`.
- If you depended on removed internal utilities, refactor to current public flow.

## Migration Checklist

- [ ] Replaced `includeSchemasFiles` in all configs.
- [ ] Selected and set `validationLibrary` explicitly.
- [ ] Selected and set `emptySchemaStrategy` explicitly.
- [ ] Reviewed custom request/executor integration.
- [ ] Ran `check-config` and `update-config`.
- [ ] Ran `preview-changes` and reviewed diffs.
- [ ] Updated snapshots/tests.

---

# Migration Notes: 2.x Additions (History & DTO Modes)

This section documents incremental changes introduced after `2.0.0`.

## New Features

### 1) History-aware generation (diff report)

New CLI/config options:
- `useHistory` (boolean)
- `diffReport` (path, default: `./openapi-diff-report.json`)

Also available in config sections:
- `analyze.useHistory`
- `analyze.reportPath`

The `analyze-diff` command generates the report:
```bash
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
```

Manual confirmation example (edit the report before generation):
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

### 2) Models mode: interfaces vs classes (DTO/Raw)

New option: `modelsMode` (`interfaces` | `classes`).

When `classes` is enabled:
- generates `*Raw` + `*Dto` in a single `models.ts`;
- emits `BaseDto` and `dtoUtils` in `core`;
- confirmed miracles produce deprecated getters in DTOs.

### 3) Coercion in validation schemas

When `useHistory` is enabled and a property changes type, validation schemas attempt coercion:
- Zod uses `z.coerce.*`
- Joi uses `Joi.alternatives().try(...)`
- Yup uses `.transform(...)`
- JSON Schema enables AJV `coerceTypes`

### 4) Project Prettier / ESLint for generated output

New CLI/config options (default `false`):
- `useProjectPrettier`: resolve the repo’s Prettier config (from the current working directory) and format generated files with it; if no config is found, built-in defaults are used.
- `useEslintFix`: after each file is written, run ESLint with fix enabled using the project’s installed `eslint` package and config. If `eslint` is not installed, the step is skipped and a warning is logged.

Config schema note: `update-config` migrates unified options to `UNIFIED_OPTIONS_v5`, adding these keys with `false` when missing.

## Recommended Actions

- [ ] Decide whether to enable `modelsMode: "classes"`.
- [ ] Add `analyze`/`miracles`/`models` sections to your config if you want history-aware generation.
- [ ] Generate and review a diff report before enabling `useHistory`.
- [ ] Optionally enable `useProjectPrettier` / `useEslintFix` if you want generated files to match repo formatting and lint rules.
