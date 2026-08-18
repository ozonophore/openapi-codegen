# Плагины

Каноническое руководство по плагинам генератора и semantic-diff в **openapi-codegen**.

> EN: [`docs/en/plugins.md`](../en/plugins.md).

## Обзор

Плагины кастомизируют генерацию типов и `analyze-diff` без форка ядра. Подключение:

- Config: `"plugins": ["./plugins/my.plugin.cjs"]` (root и/или `items[]`)
- CLI: `generate --plugins ./plugins/my.plugin.cjs` и `analyze-diff --plugins …`

Порядок merge: **сначала config**, затем CLI; дубликаты path сохраняют первое вхождение. Builtin `x-typescript-type` добавляется в конец, пока не задано `disableBuiltinPlugins: true`.

## Plugin API v1

```js
module.exports = {
  name: 'custom-type-override',
  apiVersion: '1',
  resolveSchemaTypeOverride: ({ schema }) => schema['x-custom-type'],
};
```

`resolveSchemaTypeOverride` вызывается при разборе моделей, когда у схемы есть поле `type` (см. [ограничения](#ограничения)).

На **`generate`** ошибки load всегда fatal. По умолчанию throw в `resolveSchemaTypeOverride` логируется, генерация продолжается со следующим плагином. `--strict-plugin-mode` (или `"strictPluginMode": true` в config) завершает команду ошибкой.

Пример: [`example/plugins/custom-type.plugin.cjs`](../../example/plugins/custom-type.plugin.cjs).

## Plugin API v2 (`analyze-diff`)

`apiVersion: '2'` и хуки:

| Hook | Когда |
|------|------|
| `afterSemanticDiff` | После базового semantic diff |
| `mapRecommendation` | После recommendation |
| `beforeReportWrite` | Перед записью report |

`--strict-plugin-mode` завершает команду ошибкой при throw в hook.

На **`generate`** тот же флаг завершает команду при throw в `resolveSchemaTypeOverride` (по умолчанию: warn и продолжение). Ошибки **load** плагина всегда fatal на обеих командах.

## Форматы загрузки

| Формат | Поддержка |
|--------|-----------|
| `.cjs` / CommonJS | Рекомендуется для CI |
| `.mjs` / ESM | Через fallback `import()` |
| `.ts` | Зависит от runtime TS loader; в plain Node не гарантируется |

## Config entries и fingerprint

```json
{
  "plugins": [
    "./plugins/a.cjs",
    { "path": "./plugins/b.cjs", "name": "b", "config": { "mode": "strict" } }
  ]
}
```

`pluginsHash` включает `config` каждой записи (ключ = `name ?? path`). Смена только `config` инвалидирует cache/reuse для options slice.

### Runtime `configure`

Если плагин экспортирует optional `configure(config)`, loader вызывает его **после** загрузки модуля и **только когда** у entry в `config` есть хотя бы один ключ (строковый path нормализуется в `{}` и **не** вызывает `configure`).

```js
module.exports = {
  name: 'with-config',
  apiVersion: '1',
  configure(config) {
    this._mode = config.mode;
  },
  resolveSchemaTypeOverride({ schema }) {
    return schema['x-custom-type'];
  },
};
```

Throw внутри `configure` валит загрузку плагина (как битый файл) на **generate**, **preAnalyze** и **analyze-diff**.

## CLI

```bash
openapi-codegen-cli generate --plugins ./plugins/custom-type.plugin.cjs -ocn openapi.config.json
openapi-codegen-cli analyze-diff -i current.yaml --compare-with old.yaml --plugins ./hooks.cjs --strict-plugin-mode
```

Config: `"strictPluginMode": true` на root или в `items[]` (наследование как у `plugins`).

## Builtins

По умолчанию: `x-typescript-type`. Отключение:

```json
{ "disableBuiltinPlugins": true }
```

## Programmatic API

```ts
import { loadGeneratorPlugins, applySemanticDiffPluginHooks, mergePluginPaths } from 'ts-openapi-codegen';
```

## Ограничения

- `resolveSchemaTypeOverride` вызывается только на ветке `definition.type` в `getModel`.
- **Plugin API v3 factory не shipped** (отложено; не полагайтесь на `apiVersion: '3'`).

## См. также

- [features.md#plugin-system](features.md#plugin-system), [features.md#plugin-api-v2-rfc](features.md#plugin-api-v2-rfc)
- [Конфигурация](configuration.md) · [Использование](usage.md)
