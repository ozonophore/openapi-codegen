# Plugins

`ts-openapi-codegen` supports generator plugins via `openapi.config.json`:

```json
{
  "input": "./spec/openapi.yaml",
  "output": "./generated",
  "httpClient": "fetch",
  "plugins": ["./plugins/custom-type.plugin.cjs"]
}
```

## What plugins can do now

Current plugin hook:

- `resolveSchemaTypeOverride`: override generated TypeScript type for a schema.

Plugin contract:

```ts
export interface OpenApiGeneratorPlugin {
    name: string;
    resolveSchemaTypeOverride?: (input: {
        schema: Record<string, any>;
        context: {
            openApiVersion: 'v2' | 'v3';
            parentRef: string;
        };
    }) => string | undefined;
}
```

If multiple plugins return type overrides, the first non-empty value wins.

## Common Plugin Contract (v3 Factory API)

Alongside legacy plugin objects (`v1`/`v2`), generator supports a v3 factory contract.

### Goals

- Keep full backward compatibility with existing plugin objects.
- Provide one shared plugin API for both `generate` and `analyze-diff` flows.

### v3 contract

Factory plugins register handlers through a shared `PluginApi`:

```ts
export type OpenApiPluginFactory = (api: PluginApi) => void | Promise<void>;

export interface OpenApiPluginMeta {
  name: string;
  version?: string;
  apiVersion: '3';
}

export interface PluginApi {
  readonly meta: OpenApiPluginMeta;
  onSchemaTypeOverride(handler: (input, runtime) => string | undefined): void;
  onAfterSemanticDiff(handler: (ctx, runtime) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>): void;
  onMapRecommendation(handler: (ctx, runtime) => Recommendation | void | Promise<Recommendation | void>): void;
  onBeforeReportWrite(handler: (ctx, runtime) => BeforeReportWriteResult | void | Promise<BeforeReportWriteResult | void>): void;
}
```

Runtime context is shared across handlers:

```ts
export interface PluginRuntimeContext {
  cwd: string;
  executionMode: 'generate' | 'analyze-diff';
  emitDiagnostic?: (diagnostic: {
    hook: 'resolveSchemaTypeOverride' | 'afterSemanticDiff' | 'mapRecommendation' | 'beforeReportWrite';
    status: 'applied' | 'skipped' | 'failed';
    message?: string;
  }) => void;
}
```

### Export styles for v3

1) Module object export (`meta` + `createPlugin`)
2) Function export with attached `meta`

## Module formats

Loader supports:

- CommonJS (`.cjs`, `.js`)
- ESM (`.mjs`, `type: module`)
- TypeScript plugin files (`.ts`) when runtime supports TS imports (for example with `tsx`/`ts-node` loaders)

For production usage, precompiled JS/CJS plugins are recommended.

## Examples

### 1) CommonJS plugin

```js
module.exports = {
  name: 'custom-type',
  resolveSchemaTypeOverride: ({ schema }) => {
    if (schema['x-my-type']) return schema['x-my-type'];
    return undefined;
  },
};
```

### 2) ESM plugin

```js
export default {
  name: 'custom-type-esm',
  resolveSchemaTypeOverride: ({ schema }) => {
    if (schema['x-my-type']) return String(schema['x-my-type']);
    return undefined;
  },
};
```

### 3) TypeScript plugin

```ts
import type { OpenApiGeneratorPlugin } from 'ts-openapi-codegen';

const plugin: OpenApiGeneratorPlugin = {
    name: 'custom-type-ts',
    resolveSchemaTypeOverride: ({ schema }) => {
        const value = schema['x-my-type'];
        return typeof value === 'string' ? value : undefined;
    },
};

export default plugin;
```

### 4) v3 Factory plugin (module export, CommonJS)

```js
module.exports = {
  meta: {
    name: 'factory-plugin',
    version: '1.0.0',
    apiVersion: '3',
  },
  createPlugin: (api) => {
    api.onSchemaTypeOverride(({ schema }) => {
      return typeof schema['x-my-type'] === 'string' ? schema['x-my-type'] : undefined;
    });
    api.onMapRecommendation(({ recommendation }, runtime) => {
      if (runtime.executionMode === 'analyze-diff') {
        return { ...recommendation, confidence: 'high' };
      }
      return undefined;
    });
  },
};
```

### 5) v3 Factory plugin (function export, ESM)

```js
const pluginFactory = (api) => {
  api.onSchemaTypeOverride(({ schema }) => {
    if (typeof schema['x-my-type'] === 'string') return schema['x-my-type'];
    return undefined;
  });
};

pluginFactory.meta = {
  name: 'factory-plugin-fn',
  apiVersion: '3',
};

export default pluginFactory;
```

## Built-in plugin

Generator includes built-in `x-typescript-type` plugin.
This means schemas like:

```yaml
type: string
format: binary
x-typescript-type: File
```

will be generated as `File`.

For `analyze-diff` extension hooks (API v2), see [Plugin API v2 (RFC)](plugin-api-v2.md).
