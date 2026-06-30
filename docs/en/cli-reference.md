# CLI reference

The CLI binary is **`openapi-codegen-cli`** (package `ts-openapi-codegen`).

```bash
npx openapi-codegen-cli <command> [options]
```

Seven commands: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, `analyze-diff`, `analyze-usage`.

For a quick start see [getting-started.md](getting-started.md).

---

## generate

Generates TypeScript client code from OpenAPI specifications.

```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist
openapi-codegen-cli generate --openapi-config ./openapi.config.json
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--input` | `-i` | — | OpenAPI spec (path, URL, or content) — required without config |
| `--output` | `-o` | — | Output directory — required without config |
| `--openapi-config` | `-ocn` | `openapi.config.json` | Config file path |
| `--outputCore` | `-oc` | `{output}` | Core output directory |
| `--outputServices` | `-os` | `{output}` | Services output |
| `--outputModels` | `-om` | `{output}` | Models output |
| `--outputSchemas` | `-osm` | `{output}` | Schemas output |
| `--httpClient` | `-c` | `fetch` | `fetch`, `xhr`, `node`, `axios` |
| `--request` | — | — | Custom transport file path |
| `--customExecutorPath` | — | — | Custom `createExecutorAdapter` module |
| `--useOptions` | — | `false` | Object-style parameters |
| `--useUnionTypes` | — | `false` | Union types instead of enums |
| `--excludeCoreServiceFiles` | — | `false` | Skip core/service generation |
| `--useCancelableRequest` | — | `false` | CancelablePromise return type |
| `--sortByRequired` | `-s` | `false` | Sort required params first |
| `--useSeparatedIndexes` | — | `false` | Separate index files |
| `--validationLibrary` | — | `none` | `none`, `zod`, `joi`, `yup`, `jsonschema` |
| `--emptySchemaStrategy` | — | `keep` | `keep`, `semantic`, `skip` |
| `--modelsMode` | — | `interfaces` | `interfaces` or `classes` |
| `--useHistory` | — | `false` | Apply diff report annotations |
| `--diffReport` | — | `./.openapi-codegen-reports/openapi-diff-report.json` | Diff report path |
| `--strict-openapi` | — | `false` | Strict OpenAPI diagnostics |
| `--fail-on-governance-errors` | — | `false` | Fail on governance errors |
| `--report-file` | — | `./.openapi-codegen-reports/openapi-report.json` | Strict diagnostics report |
| `--prettierConfigPath` | — | — | Prettier config for output |
| `--tsconfigPath` | — | — | tsconfig for post-gen ESLint (needs eslintConfigPath) |
| `--eslintConfigPath` | — | — | ESLint config (needs tsconfigPath) |
| `--cache` | — | `false` | Enable generation cache |
| `--cachePath` | — | `.openapi-codegen-store` | Cache path |
| `--cacheStrategy` | — | `entity` | `entity`, `reuse`, `content` |
| `--reuseOnConflict` | — | `fail` | `fail` or `namespace` |
| `--cacheDebug` | — | `false` | Cache debug logs |
| `--auto-select` | — | `false` | Auto HTTP/validation selection (*preview*) |
| `--spec-analysis` | — | `false` | Spec quality analysis (*preview*) |
| `--logLevel` | `-l` | `error` | `info`, `warn`, `error` |
| `--logTarget` | `-t` | `console` | `console` or `file` |

Marauder dot-notation flags: `--auto-select.strict`, `--spec-analysis.fail-on-high`, etc. See [Marauder user guide](../MARAUDER_USER_GUIDE.md).

HTTP options explained: [request-executor.md](request-executor.md).

---

## check-config

Validates config schema and emits **executor setup warnings** (non-fatal since 2.1.0-beta.10).

```bash
openapi-codegen-cli check-config
openapi-codegen-cli check-config --openapi-config ./custom-config.json
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--openapi-config` | `-ocn` | `openapi.config.json` | Config file path |

### Executor warnings → action

| Warning | Action |
|---------|--------|
| `request file not found: …` | Fix path or create transport file |
| `customExecutorPath file not found: …` | Fix path or scaffold with `init --requestFormat adapter` |
| `customExecutorPath should export function createExecutorAdapter` | Export `createExecutorAdapter` with correct signature |
| `items[N]: …` | Fix per-item override in multi-spec config |

Full decode table: [request-executor.md § check-config](request-executor.md#check-config-workflow).

Recommended before regen when using `"request"` or `customExecutorPath`:

```bash
openapi-codegen-cli check-config -ocn openapi.config.json
openapi-codegen-cli preview-changes -ocn openapi.config.json
openapi-codegen-cli generate -ocn openapi.config.json
```

---

## update-config

Migrates config file to latest schema version (V6).

```bash
openapi-codegen-cli update-config
openapi-codegen-cli update-config --openapi-config ./custom-config.json
```

---

## init

Scaffolds `openapi.config.json` and optionally custom HTTP files.

```bash
openapi-codegen-cli init
openapi-codegen-cli init --specs-dir ./openapi
openapi-codegen-cli init --request ./src/custom/request.ts --requestFormat transport
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--openapi-config` | `-ocn` | `openapi.config.json` | Output config path |
| `--specs-dir` | `-sd` | `./openapi` | Directory with spec files |
| `--request` | — | — | Path for custom HTTP scaffold |
| `--requestFormat` | — | `transport` | `transport` \| `adapter` \| `executor` |
| `--useCancelableRequest` | — | `false` | Scaffold cancelable transport |
| `--useInteractiveMode` | — | `false` | Interactive setup |

`requestFormat` explained: [request-executor.md § init](request-executor.md#init---requestformat).

---

## preview-changes

Generates to a temp directory and diffs against existing output without overwriting.

```bash
openapi-codegen-cli preview-changes
openapi-codegen-cli preview-changes --openapi-config ./custom-config.json
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--openapi-config` | `-ocn` | `openapi.config.json` | Config file |
| `--generated-dir` | `-gd` | `./generated` | Current generated output |
| `--preview-dir` | `-pd` | `./.ts-openapi-codegen-preview-changes` | Temp preview dir |
| `--diff-dir` | `-dd` | `./.ts-openapi-codegen-diff-changes` | Diff report dir |

---

## analyze-diff

Compares two OpenAPI specs; produces JSON diff report (schema 2.0.0).

```bash
openapi-codegen-cli analyze-diff \
  --input ./openapi/current.yaml \
  --compare-with ./openapi/previous.yaml \
  --output-report ./openapi-diff-report.json
```

| Option | Short | Description |
|--------|-------|-------------|
| `--input` | `-i` | Current spec (required) |
| `--compare-with` | — | Previous spec file |
| `--git` | — | Git ref for previous spec (e.g. `HEAD~1`) |
| `--output-report` | — | Report output path |
| `--openapi-config` | `-ocn` | Config (loads `plugins` for v2 hooks) |
| `--governance-config` | — | Governance rules JSON |
| `--strict-plugin-mode` | — | Fail on plugin hook errors |
| `--ci` | — | Exit 1 on governance errors |
| `--allow-breaking` | — | Allow breaking in governance |

**Miracles:** confirm renames in `report.structural.miracles` by setting `"status": "confirmed"` before `generate --useHistory`.

Plugin hooks: [plugin-api-v2.md](plugin-api-v2.md).

---

## analyze-usage

Analyzes how a consumer project uses generated API exports.

```bash
openapi-codegen-cli analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --tsconfigPath ./tsconfig.json \
  --check
```

| Option | Short | Description |
|--------|-------|-------------|
| `--sourcePath` | `-s` | Generated API entry (required) |
| `--projectPath` | `-p` | Consumer project root (required) |
| `--tsconfigPath` | `-t` | Optional tsconfig |
| `--output` | `-o` | Report path (default: `api-report.json`) |
| `--check` | `-c` | CI: exit 1 on ERROR mismatches |
| `--diff-report` | — | Cross-check RENAME miracles |

**CI chain:**

```bash
openapi-codegen-cli generate --input ./openapi/spec.yaml --output ./generated
openapi-codegen-cli analyze-usage --sourcePath ./generated/index.ts --projectPath . --check
tsc --noEmit
```

---

## Related

- [Getting started](getting-started.md)
- [Configuration reference](configuration-reference.md)
- [RequestExecutor hub](request-executor.md)
