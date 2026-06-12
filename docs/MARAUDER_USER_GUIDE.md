# Marauder — руководство пользователя

> Версия: **2.1.0-beta.11** (preview) · Схема конфигурации **V6**.

**Marauder** — preview-набор возможностей `openapi-codegen-cli` в **`2.1.0-beta.11`**. Все фичи **opt-in** и обратно совместимы: существующие конфиги продолжают работать; новые блоки добавляются через `update-config`.

Это руководство отвечает на три вопроса:

1. **Зачем** включать Marauder — какую проблему решает каждая фича.
2. **Когда** её использовать — кому и в каком этапе жизненного цикла API-клиента.
3. **Как** выжать максимум — типовые сценарии, настройки и ограничения preview.

---

## Зачем Marauder

OpenAPI-codegen по умолчанию генерирует клиент «в вакууме»: вы сами выбираете HTTP-клиент, валидатор, следите за качеством спеки и синхронизацией с backend. Marauder добавляет **контекст проекта**, **проверки спеки** и **инкрементальный кэш артефактов** — без ломки существующих workflow.

| Боль | Что даёт Marauder | CLI / конфиг |
|------|-------------------|--------------|
| Неясно, какой `httpClient` / `validationLibrary` подходит под ваш стек | Анализ `package.json` и рекомендация под React, Node, RN, edge | `--auto-select` / `autoSelect` |
| Спека «формально валидна», но неудобна для клиентов (циклы, дубли, deprecated) | Per-spec и cross-spec отчёт качества + опциональный CI gate | `--spec-analysis` / `specAnalysis` |
| Multi-spec monorepo: одни и те же модели генерируются повторно | Глобальный ReuseStore с shared артефактами | `cacheStrategy: "reuse"` |

**Чего Marauder не делает** (важно для ожиданий):

- не auto-fix спеки — только отчёты (`specAnalysis`);
- не заменяет semantic diff (`analyze-diff`) и проверку consumer-кода (`analyze-usage`);
- не переключает прод-трафик и не синхронизирует remote spec по URL.

**Удалено в refocus `2.1.0-beta.11`:** CLI-команды `heal`, `migrate`, `swarm`, флаг `--exploit-anomalies`, config `anomalyExploitation`. Они **не зарегистрированы** в текущем CLI.

---

## Карта возможностей: что выбрать

```
Ваша задача
│
├─ «Не знаю, что генерировать под наш monorepo / RN / Vercel»
│     → generate --auto-select
│
├─ «Хочу ловить проблемы спеки до merge / в CI»
│     → generate --spec-analysis (+ fail-on-high для gate)
│
├─ «Несколько спек — хочу переиспользовать model/schema артефакты»
│     → cache: true, cacheStrategy: "reuse"
│
└─ «Полная цепочка quality gate»
      → analyze-diff → generate (strict + spec-analysis) → analyze-usage --diff-report
```

### Режим выполнения

| Режим | Команды | Что происходит |
|-------|---------|----------------|
| **Генерация / отчёты** | `generate` | Пишет клиент, spec-analysis report, unified generation report — **без** side effects в runtime приложения |

---

## Практические сценарии

### Сценарий A — новый frontend-проект

```bash
openapi-codegen-cli update-config -ocn openapi.config.json
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --auto-select
```

**Что получите:** для React/Next — `fetch` + `none` (без Zod, если его нет в deps).

---

### Сценарий B — brownfield с зафиксированным стеком

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": true
  }
}
```

AutoSelector выберет **только** из того, что уже есть в `package.json`.

---

### Сценарий C — quality gate спеки в CI

```json
{
  "items": [{
    "input": "./openapi/spec.yaml",
    "output": "./src/api",
    "specAnalysis": {
      "enabled": true,
      "severity": "high",
      "failOnHigh": true,
      "reportPath": "./.openapi-codegen-reports/anomaly-report.json"
    }
  }]
}
```

```bash
openapi-codegen-cli generate -ocn openapi.config.json --spec-analysis
# dot-notation:
openapi-codegen-cli generate -i spec.yaml -o ./src/api \
  --spec-analysis \
  --spec-analysis.fail-on-high=true \
  --spec-analysis.severity=high
```

**Strict OpenAPI + governance:** при `"strictOpenapi": true` включите `"failOnGovernanceErrors": true` или `--fail-on-governance-errors`, чтобы governance errors тоже блокировали codegen.

---

### Сценарий D — multi-spec reuse store

```json
{
  "cache": true,
  "cacheStrategy": "reuse",
  "cachePath": ".openapi-codegen-store",
  "reuseOnConflict": "namespace",
  "items": [
    { "input": "./specs/a.yaml", "output": "./generated/a" },
    { "input": "./specs/b.yaml", "output": "./generated/b" }
  ]
}
```

См. также `example/openapi.reuse.config.json`.

---

### Сценарий E — цепочка «спека → клиент → consumer»

```bash
openapi-codegen-cli analyze-diff -i spec.yaml --compare-with spec.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json --auto-select --spec-analysis
openapi-codegen-cli analyze-usage -s ./src/api/index.ts -p . --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

`analyze-usage` resolves API imports **by path** от `--sourcePath` (aliases поддерживаются через TS module resolution).

---

### Сценарий F — end-to-end CI pipeline

```bash
openapi-codegen-cli analyze-diff \
  -i ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci

openapi-codegen-cli generate \
  -ocn openapi.config.json \
  --auto-select \
  --spec-analysis \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

openapi-codegen-cli analyze-usage \
  -s ./src/api/index.ts \
  -p . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json

tsc --noEmit
```

**Semantic diff coverage:** unified engine (`analyzeOpenApiDiff`) используется в `analyze-diff` и `--diff-report` на `analyze-usage`. Отчёт v2.0.0: `report.semantic.*` и `report.structural.*` (miracles в `structural.miracles`).

---

## Быстрый старт

```bash
openapi-codegen-cli update-config -ocn openapi.config.json

openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select
openapi-codegen-cli generate -i spec.yaml -o ./src/api --spec-analysis
openapi-codegen-cli generate -ocn openapi.config.json --cache --cacheStrategy reuse
```

---

## 1. `generate` — auto-select

### Какую проблему решает

Ручной выбор `httpClient` и `validationLibrary` часто приводит к лишним deps, несовместимости (axios в RN/edge) и дублированию валидаторов.

**Auto-select** читает `package.json` целевого проекта и подставляет рекомендации **перед** генерацией.

### CLI и конфиг

```bash
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select.strict=true
openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select.prefer-small-bundles=true
```

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": false,
    "preferSmallBundles": false,
    "preferStandards": false
  }
}
```

| Поле | По умолчанию | Эффект |
|------|--------------|--------|
| `enabled` | `false` | Запуск анализа перед generate |
| `strict` | `false` | Только deps из `package.json` |
| `preferSmallBundles` | `false` | При bundle constraints → `validationLibrary: none` |
| `preferStandards` | `false` | fetch + Zod как web-standard stack |

**Scope:** `autoSelect` — **только root** конфига (копируется на все items). Per-item overrides для `httpClient`/`validationLibrary` применяются, когда probe recommendations различаются между output.

**Defaults без сигналов:** `fetch` + `none` (fallback валидатора — `NONE`, не `ZOD`).

**Programmatic API:**

```typescript
import { AutoSelector, ProjectProbe } from 'ts-openapi-codegen';
```

---

## 2. `generate` — spec analysis

### Какую проблему решает

OpenAPI validator ловит синтаксис, но не **качество контракта**: циклические `$ref`, deeply nested schemas, inconsistent responses, ambiguous model names.

`specAnalysis` (каноническое имя) заменяет deprecated alias `anomalyDetection`. CLI: `--spec-analysis`; deprecated CLI alias: `--anomaly-detection`.

### Per-spec детекторы

- `circular-schema-refs`
- `deeply-nested-schema`
- `inconsistent-response-types`
- `ambiguous-model-name`
- `deprecated-in-active-paths`
- `missing-operation-id`
- `empty-or-untyped-schema`

### Cross-spec детекторы (`crossSpec: true` по умолчанию)

- `cross-spec-name-hash-conflict`
- `cross-spec-reuse-opportunity`
- `cross-spec-drift`
- `shared-output-collision-risk`

### Конфиг

```json
{
  "specAnalysis": {
    "enabled": true,
    "severity": "medium",
    "reportFormat": "json",
    "reportPath": "./.openapi-codegen-reports/anomaly-report.json",
    "failOnHigh": false,
    "crossSpec": true,
    "maxNestingDepth": 5
  }
}
```

| Поле | По умолчанию | Описание |
|------|--------------|----------|
| `enabled` | `false` | Запуск при generate |
| `severity` | `medium` | Порог: `low` \| `medium` \| `high` |
| `reportFormat` | `json` | `json` \| `markdown` \| `html` |
| `reportPath` | `./.openapi-codegen-reports/anomaly-report.json` | Путь отчёта |
| `failOnHigh` | `false` | Fail generate при **high** severity (legacy alias: `failOnAnomalies`) |
| `crossSpec` | `true` | Cross-spec анализ в multi-item конфигах |
| `maxNestingDepth` | `5` | Порог deeply-nested-schema |

`failOnHigh` / `failOnAnomalies` проверяется **только после** завершения cross-spec анализа.

### Config vs CLI naming

| CLI flag | Config JSON key |
|----------|-----------------|
| `--auto-select` | `autoSelect` |
| `--spec-analysis` | `specAnalysis` |
| `--anomaly-detection` | `anomalyDetection` (deprecated alias → `specAnalysis`) |

Boolean shorthand (`true` / `false`) нормализуется в `{ "enabled": true }`. Per-item overrides в `items[]` сливаются через `mergeMarauderBlockDeep` (shallow spread, не recursive deep merge).

Dot-notation примеры:

```bash
--spec-analysis.fail-on-high=true
--spec-analysis.report-path=./reports/spec.json
--auto-select='{"strict":true,"preferStandards":true}'
```

---

## 3. Generation cache и ReuseStore

### Стратегии (`cacheStrategy`)

| Стратегия | Поведение |
|-----------|-----------|
| `entity` | Per-output `.openapi-codegen-cache.json`; skip full regen на cache hit (дефолт после v5→v6 migration) |
| `reuse` | Глобальный `.openapi-codegen-store`; shared model/schema артефакты (дефолт схемы V6) |
| `content` | Только `writeFileIfChanged`; без entity/reuse store |

```json
{
  "cache": true,
  "cachePath": ".openapi-codegen-store",
  "cacheStrategy": "reuse",
  "reuseOnConflict": "fail"
}
```

| `reuseOnConflict` | Эффект |
|-------------------|--------|
| `fail` (default) | `ReuseConflictError` при schema drift |
| `namespace` | Конфликтующие схемы в spec-scoped путях |

**Ограничения reuse:** требует `modelsMode: "interfaces"` (default). Class mode отключает artifact reuse.

**Unified generation report:** при `cache: true` или `specAnalysis.enabled` — `{output}/reports/latest.json` или `<cachePath>/reports/latest.json`.

CLI: `--cache`, `--cachePath`, `--cacheStrategy`, `--reuseOnConflict`, `--cacheDebug`. Omit `--cacheStrategy` чтобы сохранить значение из конфига.

---

## 4. Программный API

Экспортируется из `core`:

| Export | Назначение |
|--------|------------|
| `AutoSelector` | Project-aware selection |
| `ProjectProbe` | Shared project context probe |
| `runSpecAnalysis` | Spec quality analysis entry point |
| `CodegenSpecAnalyzer`, `CrossSpecAnalyzer` | Per-spec / cross-spec detectors |
| `ReuseStore`, `GenerationReport` | Cache store и unified report |
| `runAnomalyDetection` | Deprecated alias → `runSpecAnalysis` |

---

## 5. Ограничения preview

- `--auto-select` — при generate из `openapi.config.json` или merged multi-item configs
- `specAnalysis` — отчёты only; не auto-fix
- Reuse store — `modelsMode: "interfaces"` only
- Marauder config merge — shallow spread, не recursive deep merge
- CLI dot-notation парсится **до** Commander (`parseNestedCliOptions`)

---

## 6. Справочная карточка

```bash
# Config V6
openapi-codegen-cli update-config -ocn openapi.config.json

# Marauder preview (generate only)
openapi-codegen-cli generate -i spec.yaml -o ./api --auto-select
openapi-codegen-cli generate -i spec.yaml -o ./api --spec-analysis
openapi-codegen-cli generate -ocn openapi.config.json --cache --cacheStrategy reuse

# Quality gate chain
openapi-codegen-cli analyze-diff -i spec.yaml --compare-with spec.base.yaml --ci
openapi-codegen-cli generate -ocn openapi.config.json --strict-openapi --fail-on-governance-errors
openapi-codegen-cli analyze-usage -s ./api/index.ts -p . --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

---

## Связанные документы

- [Usage (EN)](en/usage.md) / [Использование (RU)](ru/usage.md)
- [Configuration (EN)](en/configuration.md) / [Конфигурация (RU)](ru/configuration.md)
- [Migration guide](../MIGRATION.md) / [Миграция](../MIGRATION.RU.md)
- `CHANGELOG.md` / `CHANGELOG.RU.md` — секция `2.1.0-beta.11`
