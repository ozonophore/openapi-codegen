# Plugin API v2 (RFC)

Status: draft

Goal of v2: evolve the plugin system without breaking the existing v1 hook `resolveSchemaTypeOverride`.

## Backward compatibility

- v1 plugins continue to work unchanged.
- If a plugin exports only `name` and `resolveSchemaTypeOverride`, it is treated as v1.
- v2 hooks are used only in the `analyze-diff` flow.

## v3 runtime unification

v2 object plugins remain valid exports, but the loader now normalizes both v1 and v2 plugins to the shared v3 runtime contract (`apiVersion: '3'`). New plugins should prefer the v3 factory API documented in [Plugins](plugins.md#common-plugin-contract-v3-factory-api).

## Plugin contract

```ts
export type OpenApiCodegenPluginApiVersion = '1' | '2';

export interface OpenApiGeneratorPlugin {
  name: string;
  version?: string;
  apiVersion?: OpenApiCodegenPluginApiVersion;

  // v1
  resolveSchemaTypeOverride?: (input: SchemaTypeOverrideInput) => string | undefined;

  // v2
  afterSemanticDiff?: (ctx: {
    report: SemanticDiffReport;
    options: { allowBreaking: boolean };
  }) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;

  mapRecommendation?: (ctx: {
    recommendation: SemanticDiffReport['recommendation'];
    summary: SemanticDiffReport['summary'];
    governance: SemanticDiffReport['governance'];
  }) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;

  beforeReportWrite?: (ctx: {
    report: SemanticDiffReport;
    reportPath: string;
  }) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;
}
```

## Hook execution order

`analyze-diff` runs hooks in plugin order from the `plugins` array in `openapi.config.json`:

1. `afterSemanticDiff`
2. `mapRecommendation`
3. `beforeReportWrite`

Each subsequent plugin receives the result of the previous one.

## Isolation and error handling

- Each hook runs inside `try/catch`.
- Two modes:
  - `strictPluginMode=false` (default): hook errors are logged and execution continues.
  - `strictPluginMode=true` (CLI flag `--strict-plugin-mode`): any hook error fails the command.

## Wiring in analyze-diff

Register plugin module paths in `openapi.config.json`:

```json
{
  "plugins": [
    "./plugins/recommendation.plugin.cjs",
    "./plugins/report.plugin.mjs"
  ]
}
```

The command loads them via `--openapi-config` (default: `openapi.config.json`).

Additional CLI flags:

- `--strict-plugin-mode` — strict plugin error handling
- `--governance-config` — path to governance rules JSON
- `--ci` — exit with code 1 when governance errors are found
- `--allow-breaking` — allow breaking changes in governance checks

Example:

```bash
openapi analyze-diff \
  --input ./openapi/current.yaml \
  --compare-with ./openapi/previous.yaml \
  --openapi-config ./openapi.config.json \
  --strict-plugin-mode \
  --output-report ./openapi-diff-report.json \
  --ci
```

## Diagnostics

During `analyze-diff`, diagnostics are logged for each hook invocation:

- plugin name;
- hook name;
- status (`applied`/`skipped`/`failed`);
- duration (ms);
- error message (if any).

## Minimal v2 plugin example

```js
module.exports = {
  name: 'recommendation-tuner',
  apiVersion: '2',
  mapRecommendation: ({ recommendation, governance }) => {
    if (governance.summary.errors > 0) {
      return {
        ...recommendation,
        confidence: 'high',
      };
    }
    return undefined;
  },
};
```

## Why v2 is designed this way

- Narrow extension points keep core breakage risk low.
- Extensions focus on `semantic diff / recommendation / report`.
- No migration required for existing v1 plugins.
