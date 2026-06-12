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

## Общий контракт плагина (v3 Factory API)

Параллельно с legacy-объектами плагинов (`v1`/`v2`) генератор поддерживает factory-контракт v3.

Legacy-объекты `v1`/`v2` остаются допустимым форматом экспорта, но загрузчик нормализует их в общий runtime-контракт v3 (`apiVersion: '3'`) при загрузке. Встроенные плагины используют тот же v3 runtime-контракт.

### Цели

- Полная обратная совместимость с существующими plugin-объектами.
- Единый API плагина для потоков `generate` и `analyze-diff`.
- Нормализация всех загруженных плагинов к одному runtime-контракту (v3).

### Контракт v3

Factory-плагины регистрируют обработчики через общий `PluginApi`:

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

Runtime-контекст общий для всех обработчиков:

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

### Стили экспорта для v3

1) Экспорт объектом модуля (`meta` + `createPlugin`)
2) Экспорт функцией с прикреплённым `meta`

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

### 4) v3 Factory-плагин (экспорт объектом, CommonJS)

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

### 5) v3 Factory-плагин (экспорт функцией, ESM)

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
