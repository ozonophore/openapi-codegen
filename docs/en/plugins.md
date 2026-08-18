# Plugins

Canonical guide for **openapi-codegen** generator and semantic-diff plugins.

> Full localized copy: this file (`docs/en/plugins.md`). Russian: [`docs/ru/plugins.md`](../ru/plugins.md).

## Overview

Plugins customize type generation and `analyze-diff` without forking the core. Register them via:

- Config: `"plugins": ["./plugins/my.plugin.cjs"]` (root and/or `items[]`)
- CLI: `generate --plugins ./plugins/my.plugin.cjs` and `analyze-diff --plugins …`

Merge order: **config first**, then CLI; duplicate paths keep the first occurrence. Built-in `x-typescript-type` is appended unless `disableBuiltinPlugins: true`.

## Plugin API v1

Export an object (CJS `module.exports` / ESM `default` / `plugin`):

```js
module.exports = {
  name: 'custom-type-override',
  apiVersion: '1',
  resolveSchemaTypeOverride: ({ schema }) => schema['x-custom-type'],
};
```

`resolveSchemaTypeOverride` runs while parsing models when the schema has a `type` field (see [limitations](#limitations)).

On **`generate`**, plugin load errors are always fatal. By default, a throw inside `resolveSchemaTypeOverride` is logged and generation continues with the next plugin. Pass `--strict-plugin-mode` (or `"strictPluginMode": true` in config) to fail instead.

Reference example: [`example/plugins/custom-type.plugin.cjs`](../../example/plugins/custom-type.plugin.cjs).

## Plugin API v2 (`analyze-diff`)

Set `apiVersion: '2'` and implement any of:

| Hook | When |
|------|------|
| `afterSemanticDiff` | After base semantic diff |
| `mapRecommendation` | After recommendation is computed |
| `beforeReportWrite` | Before writing the report file |

`--strict-plugin-mode` fails the command when a hook throws.

On **`generate`**, the same flag fails when `resolveSchemaTypeOverride` throws (default: warn and continue). Plugin **load** errors are always fatal on both commands.

## Loader formats

| Format | Support |
|--------|---------|
| `.cjs` / CommonJS | Recommended for CI |
| `.mjs` / ESM | Supported via dynamic `import()` fallback |
| `.ts` | Depends on runtime TS loader; not guaranteed in plain Node |

## Config entries and fingerprint

`plugins` may be strings **or** objects:

```json
{
  "plugins": [
    "./plugins/a.cjs",
    { "path": "./plugins/b.cjs", "name": "b", "config": { "mode": "strict" } }
  ]
}
```

`pluginsHash` in artifact fingerprints includes each entry’s `config` (keyed by `name ?? path`). Changing only `config` invalidates reuse/entity cache for affected options.

### Runtime `configure`

If a plugin exports optional `configure(config)`, the loader calls it **after** the module loads and **only when** the entry’s `config` object has at least one key (string path entries normalize to `{}` and do **not** call `configure`).

```js
module.exports = {
  name: 'with-config',
  apiVersion: '1',
  configure(config) {
    this._mode = config.mode;
  },
  resolveSchemaTypeOverride({ schema }) {
    /* use this._mode if needed */
    return schema['x-custom-type'];
  },
};
```

A throw inside `configure` fails plugin loading (same as a bad plugin file) on **generate**, **preAnalyze**, and **analyze-diff**.

## CLI

```bash
openapi-codegen-cli generate --plugins ./plugins/custom-type.plugin.cjs -ocn openapi.config.json
openapi-codegen-cli generate --plugins ./a.cjs ./b.cjs --strict-plugin-mode ...
openapi-codegen-cli analyze-diff -i current.yaml --compare-with old.yaml --plugins ./hooks.cjs --strict-plugin-mode
```

Config: `"strictPluginMode": true` at root or in `items[]` (same inheritance as `plugins`).

## Builtins

Default builtin: `x-typescript-type` (maps `x-typescript-type` extension). Disable with:

```json
{ "disableBuiltinPlugins": true }
```

## Programmatic API

```ts
import { loadGeneratorPlugins, applySemanticDiffPluginHooks, mergePluginPaths } from 'ts-openapi-codegen';
```

## Limitations

- `resolveSchemaTypeOverride` is invoked only on the `definition.type` branch in `getModel` (object/enum/$ref-only / typeless schemas may skip plugins).
- **Plugin API v3 factory is not shipped** (deferred; do not rely on `apiVersion: '3'`).

## See also

- Short anchors: [features.md#plugin-system](features.md#plugin-system), [features.md#plugin-api-v2-rfc](features.md#plugin-api-v2-rfc)
- [Configuration](configuration.md) · [Usage](usage.md)
