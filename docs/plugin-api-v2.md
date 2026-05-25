# Plugin API v2 (RFC)

Статус: draft

Цель v2: эволюционно расширить плагинную систему без поломки текущего v1-хука `resolveSchemaTypeOverride`.

## Обратная совместимость

- v1-плагины продолжают работать без изменений.
- Если плагин экспортирует только `name` и `resolveSchemaTypeOverride`, он трактуется как v1.
- v2-хуки используются только в `analyze-diff` потоке.

## Контракт плагина

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

## Порядок выполнения хуков

`analyze-diff` выполняет хуки строго по порядку плагинов в конфиге/CLI:

1. `afterSemanticDiff`
2. `mapRecommendation`
3. `beforeReportWrite`

Каждый следующий плагин получает результат предыдущего.

## Isolation / Error Handling

- Каждый хук выполняется в `try/catch`.
- Есть два режима:
  - `strictPluginMode=false` (default): ошибка хука логируется, выполнение продолжается.
  - `strictPluginMode=true`: ошибка любого хука завершает команду с ошибкой.

## CLI-подключение в analyze-diff

- `--plugins <values...>` — пути к плагинам.
- `--strict-plugin-mode` — строгий режим обработки ошибок плагинов.

Пример:

```bash
openapi-codegen-cli analyze-diff old.yaml new.yaml \
  --plugins ./plugins/recommendation.plugin.cjs ./plugins/report.plugin.mjs \
  --strict-plugin-mode \
  --report-file ./openapi-diff-report.json \
  --ci
```

## Диагностика

Во время выполнения `analyze-diff` пишутся строки диагностики по каждому вызванному хуку:

- имя плагина;
- имя хука;
- статус (`applied`/`skipped`/`failed`);
- длительность (ms);
- сообщение ошибки (если есть).

## Минимальный пример v2-плагина

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

## Почему именно такой v2

- Узкие extension points: риск поломки ядра минимальный.
- Расширение сфокусировано на `semantic diff / recommendation / report`.
- Внедрение не требует миграции существующих v1-плагинов.
