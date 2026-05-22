# Плагины

`ts-openapi-codegen` поддерживает плагины генератора через `openapi.config.json`:

```json
{
  "input": "./spec/openapi.yaml",
  "output": "./generated",
  "httpClient": "fetch",
  "plugins": ["./plugins/custom-type.plugin.cjs"]
}
```

## Что плагины умеют сейчас

Текущий хук плагина:

- `resolveSchemaTypeOverride` — переопределение генерируемого TypeScript-типа для схемы.

Контракт плагина:

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

Если несколько плагинов возвращают переопределение типа, используется первое непустое значение.

## Форматы модулей

Загрузчик поддерживает:

- CommonJS (`.cjs`, `.js`)
- ESM (`.mjs`, `type: module`)
- TypeScript-файлы плагинов (`.ts`), если рантайм поддерживает импорт TS (например, через `tsx`/`ts-node`)

Для production рекомендуется использовать предкомпилированные JS/CJS-плагины.

## Примеры

### 1) CommonJS-плагин

```js
module.exports = {
  name: 'custom-type',
  resolveSchemaTypeOverride: ({ schema }) => {
    if (schema['x-my-type']) return schema['x-my-type'];
    return undefined;
  },
};
```

### 2) ESM-плагин

```js
export default {
  name: 'custom-type-esm',
  resolveSchemaTypeOverride: ({ schema }) => {
    if (schema['x-my-type']) return String(schema['x-my-type']);
    return undefined;
  },
};
```

### 3) TypeScript-плагин

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

## Встроенный плагин

Генератор включает встроенный плагин `x-typescript-type`.
Это означает, что схемы вида:

```yaml
type: string
format: binary
x-typescript-type: File
```

будут сгенерированы как `File`.

Расширения для `analyze-diff` (API v2) описаны в [Plugin API v2 (RFC)](plugin-api-v2.md).
