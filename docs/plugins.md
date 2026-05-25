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

## Built-in plugin

Generator includes built-in `x-typescript-type` plugin.
This means schemas like:

```yaml
type: string
format: binary
x-typescript-type: File
```

will be generated as `File`.
