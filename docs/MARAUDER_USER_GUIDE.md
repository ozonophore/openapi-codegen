# Marauder — руководство пользователя

> Версия: **2.2.0-beta.1** (preview) · Актуально для HEAD репозитория.

**Marauder** — preview-набор возможностей `openapi-codegen-cli`. Все фичи **opt-in** и обратно совместимы: существующие конфиги продолжают работать; новые блоки добавляются через схему **V6**.

Это руководство отвечает на три вопроса:

1. **Зачем** включать Marauder — какую проблему решает каждая фича.
2. **Когда** её использовать — кому и в каком этапе жизненного цикла API-клиента.
3. **Как** выжать максимум — типовые сценарии, настройки и ограничения preview.

---

## Зачем Marauder

OpenAPI-codegen по умолчанию генерирует клиент «в вакууме»: вы сами выбираете HTTP-клиент, валидатор, следите за качеством спеки и синхронизацией с backend. Marauder добавляет **контекст проекта**, **проверки спеки** и **инструменты планирования** — без ломки существующих workflow.

| Боль | Что даёт Marauder | Команда |
|------|-------------------|---------|
| Неясно, какой `httpClient` / `validationLibrary` подходит под ваш стек | Анализ `package.json` и рекомендация под React, Node, RN, edge | `--auto-select` |
| Спека «формально валидна», но неудобна для клиентов (циклы, дубли, deprecated) | Отчёт по эвристикам качества + опциональный CI gate | `--anomaly-detection` |
| Хочется заготовок middleware (batch, cache, circuit breaker) | Генерация TS-модулей-заготовок по найденным аномалиям | `--exploit-anomalies` |
| Несколько микросервисов — нужны согласованные клиенты | Оркестрация multi-spec + coordinator scaffolding | `swarm` |
| Переход с axios на fetch без big bang | План фаз + runtime-хелперы (TrafficSplitter) | `migrate` |
| Удалённая спека уехала, локальная устарела | Авто-sync non-breaking изменений с URL | `heal` |

**Чего Marauder не делает** (важно для ожиданий):

- не переключает прод-трафик (`migrate` — только план и код-хелперы);
- не подключает optimization-модули в клиент автоматически;
- не заменяет semantic diff (`analyze-diff`) и проверку consumer-кода (`analyze-usage`);
- swarm-координатор — **scaffolding**, health-check и routing нужно довести вручную.

---

## Карта возможностей: что выбрать

```
Ваша задача
│
├─ «Не знаю, что генерировать под наш monorepo / RN / Vercel»
│     → generate --auto-select
│
├─ «Хочу ловить проблемы спеки до merge / в CI»
│     → generate --anomaly-detection (+ failOnAnomalies для gate)
│
├─ «Нужны стартовые модули оптимизаций, доработаю сам»
│     → generate --exploit-anomalies
│
├─ «5+ OpenAPI-спек, нужен единый каркас клиентов»
│     → swarm
│
├─ «Меняем transport (axios → fetch), нужен план cutover»
│     → migrate
│
└─ «Спека живёт на URL, локальная копия должна быть актуальной»
      → heal (--once для CI, без --once для watch)
```

### Режимы выполнения

| Режим | Команды | Что реально происходит |
|-------|---------|------------------------|
| **Генерация / планирование** | `generate`, `swarm`, `migrate` | Пишет файлы, отчёты, планы — **без** переключения прод-трафика |
| **Живой мониторинг** | `heal` (без `--once`) | Опрашивает URL спеки, обновляет локальный файл, пишет журнал |

---

## Практические сценарии

### Сценарий A — новый frontend-проект

**Цель:** сгенерировать клиент без лишних зависимостей, совместимый с браузером.

```bash
openapi-codegen-cli update-config -ocn openapi.config.json
openapi-codegen-cli generate -i ./openapi/spec.yaml -o ./src/api --auto-select
```

**Что получите:** для React/Next — `fetch` + `none` (без Zod, если его нет в deps). Меньше bundle, нет axios «на всякий случай».

**Усиление:** `"preferStandards": true` в конфиге, если команда стандартизируется на fetch + Zod.

---

### Сценарий B — проект с уже установленным стеком

**Цель:** не тащить второй HTTP-клиент или валидатор.

```json
{
  "autoSelect": {
    "enabled": true,
    "strict": true
  }
}
```

**Что получите:** AutoSelector выберет **только** из того, что уже есть в `package.json` (zod/joi/yup, axios/fetch). Полезно для brownfield, где deps уже зафиксированы.

---

### Сценарий C — React Native / edge / serverless

**Цель:** клиент без тяжёлых runtime-зависимостей.

```json
{
  "autoSelect": {
    "enabled": true,
    "preferSmallBundles": true
  }
}
```

**Как это работает:** detection rules распознают `react-native`, Vercel/Netlify/Lambda, `bundlesize` в `package.json` и рекомендуют `fetch` + при необходимости `validationLibrary: none`.

**Совет:** положите `package.json` в директорию, которую видит AutoSelector (см. [директорию анализа](#директория-анализа-auto-select)).

---

### Сценарий D — quality gate спеки в CI

**Цель:** PR не мержится, если в спеке критические проблемы.

```json
{
  "items": [{
    "input": "./openapi/spec.yaml",
    "output": "./src/api",
    "anomalyDetection": {
      "enabled": true,
      "severity": "high",
      "failOnAnomalies": true,
      "reportFormat": "json",
      "reportPath": "./reports/spec-anomalies.json"
    }
  }]
}
```

```bash
openapi-codegen-cli generate -ocn openapi.config.json --anomaly-detection
# или dot-notation:
openapi-codegen-cli generate -i spec.yaml -o ./src/api \
  --anomaly-detection \
  --anomaly-detection.fail-on-anomalies=true \
  --anomaly-detection.severity=high
```

**Что блокирует сборку:** только аномалии с **`severity: high`**. Medium/low — в отчёте, но не fail.

**Strict OpenAPI + governance:** при `"strictOpenapi": true` отчёт включает и `issues[]` (refs, media types, operationId), и `governance.violations`. По умолчанию generate падает только на `issues[].errors`. Чтобы governance-ошибки тоже блокировали codegen, включите `"failOnGovernanceErrors": true` (требует `strictOpenapi`).

**Совет:** не включайте `missing-pagination` / `missing-caching-headers` без необходимости — высокий false-positive rate (они **исключены по умолчанию**).

---

### Сценарий E — remote spec drift (backend публикует OpenAPI по URL)

**Цель:** локальная спека и клиент не отстают от production API.

```bash
# CI: одна проверка + regen при non-breaking изменениях
openapi-codegen-cli heal \
  --spec-url https://api.example.com/openapi.json \
  --local-spec ./openapi/spec.yaml \
  -o ./src/api \
  --once
```

**Что получите:** non-breaking diff → авто-обновление локального файла + бэкап; breaking → событие `user-review-required`, файл **не** перезаписывается.

**Совет:** continuous mode (`heal` без `--once`) — для dev/staging watch; regen клиента только в `--once` + `-o`.

---

### Сценарий F — миграция axios → fetch

**Цель:** поэтапный cutover без единовременного переключения.

```bash
# 1. Два клиента
openapi-codegen-cli generate -i ./spec.yaml -o ./clients/axios --httpClient axios
openapi-codegen-cli generate -i ./spec.yaml -o ./clients/fetch --httpClient fetch

# 2. План + runtime-хелперы
openapi-codegen-cli migrate \
  --from-client axios-client \
  --to-client fetch-client \
  --strategy canary \
  --output-file ./migration-plan.json
```

**Что получите:** `MIGRATION_GUIDE.md`, `TrafficSplitter.ts`, `migration-runtime-client.ts` — подключение в приложении **вручную**.

---

### Сценарий G — цепочка «спека → клиент → consumer»

Marauder дополняет, но не заменяет другие команды CLI:

```bash
# 1. Delta между версиями спеки (semantic diff + governance)
openapi-codegen-cli analyze-diff -i spec.yaml --compare-with spec.base.yaml --ci

# 2. Генерация с Marauder
openapi-codegen-cli generate -ocn openapi.config.json --auto-select --anomaly-detection

# 3. Проверка, что приложение использует клиент корректно
openapi-codegen-cli analyze-usage -s ./src/api/index.ts -p . --check
```

`analyze-usage` resolves API imports **by path**: pass the generated entry file with `-s`; any consumer import that resolves to that file or a sibling under the same directory is analyzed (relative paths, barrel files, and path-mapped aliases all work when TypeScript resolves them).

---

### Сценарий H — end-to-end CI pipeline

**Цель:** единая цепочка от delta спеки до проверки consumer-кода и плана миграции.

```bash
# 1. Semantic diff + governance gate
openapi-codegen-cli analyze-diff \
  -i ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci \
  --output-report ./openapi-diff-report.json

# 2. Generate (Marauder optional) + strict/governance gate
openapi-codegen-cli generate \
  -i ./openapi/spec.yaml \
  -o ./src/api \
  --auto-select \
  --anomaly-detection \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

# 3. Consumer adoption + RENAME miracle cross-check
openapi-codegen-cli analyze-usage \
  -s ./src/api/index.ts \
  -p . \
  --check \
  --diff-report ./openapi-diff-report.json

# 4. Typecheck
tsc --noEmit

# 5. Migration plan (when switching clients)
openapi-codegen-cli migrate \
  --from-client axios-client \
  --to-client fetch-client \
  --diff-report ./openapi-diff-report.json
```

**Severity mapping (shared operation diagnostics):**

| Проверка | Strict `issues[]` | Governance `violations[]` |
|----------|-------------------|---------------------------|
| missing `operationId` | **info** | **warning** (configurable → `error` via `governance.json`) |
| default без 2xx | warning | warning (configurable) |

По умолчанию `generate --strict-openapi` падает только на `issues[].errors`. Governance errors блокируют codegen при `"failOnGovernanceErrors": true` или CLI `--fail-on-governance-errors`.

**Semantic diff coverage:** unified engine (`analyzeOpenApiDiff`) используется в `analyze-diff`, `heal` (через `ChangeDetector`) и `--diff-report` на `migrate` / `analyze-usage`. Помимо models/operations, diff отслеживает **`info.version`** (informational semver signal) и изменения **`components.securitySchemes`** (security-schemes) в semantic + structural секциях unified report v2.0.0.

---

## Быстрый старт

```bash
openapi-codegen-cli update-config -ocn openapi.config.json

openapi-codegen-cli generate -i spec.yaml -o ./src/api --auto-select
openapi-codegen-cli generate -i spec.yaml -o ./src/api --anomaly-detection
openapi-codegen-cli swarm --specs-dir ./openapi -o ./swarm-out
openapi-codegen-cli migrate --from-client old --to-client new
openapi-codegen-cli heal --spec-url URL --local-spec ./spec.yaml --once -o ./src/api
```

---

## 1. `generate` — auto-select

### Какую проблему решает

Ручной выбор `httpClient` и `validationLibrary` часто приводит к:

- лишним deps (axios в browser-only SPA);
- несовместимости (axios в RN/edge без доработок);
- дублированию (Zod уже в проекте, а codegen тащит другой валидатор).

**Auto-select** читает `package.json` целевого проекта и подставляет рекомендации **перед** генерацией.

### Когда включать

| Ситуация | Рекомендация |
|----------|--------------|
| Greenfield, стандартный web | `--auto-select` |
| Brownfield, deps уже зафиксированы | `strict: true` |
| RN / edge / bundle-sensitive | `preferSmallBundles: true` |
| Явно знаете стек | auto-select **не нужен** — задайте `httpClient` / `validationLibrary` в конфиге |

### Как работает анализ

AutoSelector прогоняет **detection rules** по `package.json` — модульный pipeline (аналог rules в `analyze-usage`, но только для deps):

| Сигнал в `package.json` | Что определяется |
|-------------------------|------------------|
| `react-native` | mobile, small bundle → `fetch` |
| `react`, `next` | browser → `fetch` |
| `@vercel/functions`, `@netlify/functions`, `aws-lambda` | edge → `fetch` |
| `engines.node`, `"type": "module"` | nodejs → `node` http client |
| `zod` / `joi` / `yup`, `axios` / `fetch` | учёт существующих deps |
| `vite` / `webpack` / …, `sideEffects: false` | рекомендации по bundle |

**Defaults без сигналов:** `fetch` + `none`. При наличии zod/joi/yup в deps — соответствующий валидатор.

### Директория анализа (auto-select)

Порядок разрешения `package.json`:

1. `-o` / `output` (директория вывода клиента)
2. Родитель локального `input` (не URL)
3. `process.cwd()` — **для URL-ввода смотрит cwd**, не каталог спеки

**Практический совет:** если генерируете из URL, запускайте CLI из корня приложения или явно укажите `-o` внутри проекта.

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
| `strict` | `false` | Только deps из `package.json`, без «умных» defaults |
| `preferSmallBundles` | `false` | При small-bundle constraints → `validationLibrary: none` |
| `preferStandards` | `false` | fetch + Zod как web-standard stack |

**Programmatic API:** `customRules` (selection) и `detectionRules` (анализ deps) — только через `AutoSelector` в коде, не через JSON config.

```typescript
import { AutoSelector } from 'ts-openapi-codegen';

const result = new AutoSelector().selectOptimal('./my-app', {
  strict: true,
  detectionRules: [{
    id: 'expo',
    apply(ctx, analysis) {
      if (ctx.allDeps.expo) analysis.deploymentTarget = 'react-native';
    },
  }],
});
```

---

## 2. `generate` — anomaly detection

### Какую проблему решает

OpenAPI validator ловит синтаксис, но не **качество контракта**: циклические схемы, deprecated без migration path, inconsistent responses, redundant endpoints. Anomaly detection — набор эвристик, которые формируют **actionable отчёт** для авторов API и codegen pipeline.

### Когда полезно

| Контекст | Настройка |
|----------|-----------|
| Локальная разработка, первичный аудит спеки | `--anomaly-detection`, `severity: medium` |
| CI gate на критические проблемы | `failOnAnomalies: true`, `severity: high` |
| Документация для backend-команды | `reportFormat: markdown` |

### Когда будет шум

- `missing-pagination`, `missing-caching-headers` — **выключены по умолчанию** (много false positives на REST API без page/limit).
- Marketing-метрики в отчётах (`+10-100x`) — ориентиры, не измеренные SLA.

Чтобы включить pagination/caching-проверки:

```json
{ "anomalyDetection": { "excludeCategories": [] } }
```

### Конфиг

```json
{
  "anomalyDetection": {
    "enabled": true,
    "severity": "medium",
    "reportFormat": "markdown",
    "reportPath": "./reports/anomalies.md",
    "failOnAnomalies": false,
    "maxNestingDepth": 5
  }
}
```

| Поле | По умолчанию | Описание |
|------|--------------|----------|
| `enabled` | `false` | Запуск при generate |
| `severity` | `medium` | Порог в отчёте: `low` \| `medium` \| `high` |
| `reportFormat` | `json` | `json` \| `markdown` \| `html` |
| `reportPath` | `./anomaly-report.{ext}` | Относительно cwd |
| `failOnAnomalies` | `false` | Fail generate при **high** severity |
| `maxNestingDepth` | `5` | Порог `deeply-nested-objects` |
| `excludeCategories` | `missing-pagination`, `missing-caching-headers` | Blacklist |

**Детекторы (10):** `inconsistent-response-types`, `batch-endpoints-available`, `redundant-endpoints`, `missing-pagination`, `missing-caching-headers`, `circular-references`, `deeply-nested-objects`, `rate-limit-patterns`, `deprecated-endpoints`, `schema-inconsistencies`.

### Config vs CLI naming

| CLI flag | Config JSON key |
|----------|-----------------|
| `--auto-select` | `autoSelect` |
| `--anomaly-detection` | `anomalyDetection` |
| `--exploit-anomalies` | **`anomalyExploitation`** |

Boolean shorthand (`true` / `false`) нормализуется в `{ "enabled": true }`. Per-item overrides в `items[]` сливаются с root Marauder blocks через `mergeMarauderBlockDeep` (shallow spread + one-level handling для `excludeCategories` и `detectionRules`).

### Merge semantics (config, CLI, items)

| Layer | Behavior |
|-------|----------|
| `mergeMarauderBlock` | One-level shallow spread; override wins on key collision. Nested plain objects and most arrays are replaced wholesale. |
| `mergeMarauderBlockDeep` | Used at config↔CLI and root↔item boundaries. Same as shallow merge for most keys; `excludeCategories` override replaces the array; `detectionRules` arrays are concatenated when both sides provide arrays. |
| CLI dot-notation | Partial flags such as `--anomaly-detection.exclude-categories=X` merge into the config block and **do not** wipe sibling fields like root `severity`. |

```json
{
  "anomalyDetection": { "severity": "high", "enabled": true },
  "items": [{ "input": "a.yaml", "output": "./a", "anomalyDetection": { "excludeCategories": [] } }]
}
```

После merge item получит `{ "severity": "high", "enabled": true, "excludeCategories": [] }`.

---

## 3. `generate` — exploit anomalies

### Какую проблему решает

Отчёт аномалий говорит «что не так», но не даёт кода. **Exploitation** генерирует **заготовки** TS-модулей (middleware, cache, batching) — стартовую точку, не готовое решение.

### Как получить максимум

1. Сначала прогоните `--anomaly-detection`, изучите отчёт.
2. Включите `--exploit-anomalies` (автоматически включает detection).
3. Откройте `{output}/optimizations/INTEGRATION_GUIDE.md` — **подключение вручную**.
4. Выберите `strategy`: `conservative` для prod-adjacent, `aggressive` для экспериментов.

```json
{
  "anomalyExploitation": {
    "enabled": true,
    "strategy": "balanced",
    "outputPath": "./src/api/optimizations"
  }
}
```

| Категория | Класс | Типичный триггер |
|-----------|-------|------------------|
| `batch-requests` | `AutoBatchingMiddleware` | batch endpoints |
| `circuit-breaker` | `CircuitBreaker` | rate limits |
| `smart-caching` | `SmartCache` | inconsistent responses |
| `request-deduplication` | `RequestDeduplicator` | missing cache headers |
| `connection-pooling` | `ConnectionPool` | missing pagination |
| `time-folding` | `TimeFoldingBatcher` | high-severity fallback |

---

## 4. `swarm` — Avatar Swarm

### Какую проблему решает

При нескольких OpenAPI-спеках (микросервисы) ручная генерация N клиентов + согласование naming/health/consensus отнимает время. Swarm генерирует **клиент на сервис** + **координационный каркас** и сводный отчёт.

### Когда использовать

- 3+ независимых API с отдельными спеками;
- нужен единый output layout и metadata для platform-команды;
- готовы доработать coordinator и health-check сами (preview scaffolding).

### Когда не использовать

- один API / одна спека → обычный `generate`;
- нужен production-ready service mesh → swarm не заменяет инфраструктуру.

```bash
openapi-codegen-cli swarm \
  --specs-dir ./openapi/services \
  -o ./generated/swarm \
  --strategy consensus \
  --report-format all
```

**Структура вывода:**

```
generated/swarm/
  users/              # клиент + avatar.ts
  orders/
  coordinator.ts
  swarm-report-*.md
  .swarm-metadata-*.json
```

«AI recommendations» — rule-based эвристики, не LLM.

---

## 5. `migrate` — планирование миграции

### Какую проблему решает

Смена transport (axios → fetch), версии клиента или output layout без плана = big bang и откат. `migrate` формирует **фазовый план** и **runtime-хелперы** для canary / blue-green / shadow / staged rollout.

### Как получить максимум

1. Сгенерируйте оба клиента с разными `httpClient`.
2. Запустите `analyze-diff` и сохраните unified report; подтвердите нужные RENAME miracles (`status: "confirmed"`).
3. Запустите `migrate` с нужной `--strategy` и `--diff-report ./openapi-diff-report.json` для фаз, учитывающих breaking changes из diff.
4. Интегрируйте `MigrationRuntimeClient` по `MIGRATION_GUIDE.md`.
5. Используйте `TrafficSplitter` для weighted / header-based routing.
6. Проверьте consumer adoption: `analyze-usage --check --diff-report ./openapi-diff-report.json`.

**Не делает:** не переключает прод-трафик автоматически.

**RENAME miracles:** diff report `miracles[]` с `type: "RENAME"` и `status: "confirmed"` применяются при `generate --useHistory`; `analyze-usage --diff-report` предупреждает, если consumer code не отражает переименования.

| Стратегия | Когда |
|-----------|-------|
| `canary` | Постепенный сдвиг 0% → 100% |
| `blue-green` | Мгновенное переключение фазами |
| `shadow` | Зеркалирование без отдачи ответов |
| `staged` | Rollout по группам endpoint'ов |

---

## 6. `heal` — self-healing мониторинг

### Какую проблему решает

Backend публикует OpenAPI по URL; локальная копия устаревает → codegen и типы расходятся с реальностью. `heal` синхронизирует локальный файл с remote, безопасно применяя non-breaking изменения.

### Режимы

| Режим | Команда | Use case |
|-------|---------|----------|
| **CI / one-shot** | `--once` (+ `-o` для regen) | Pipeline после deploy backend |
| **Watch** | без `--once` | Dev/staging, периодический poll |

```bash
openapi-codegen-cli heal \
  --spec-url https://api.example.com/openapi.json \
  --local-spec ./openapi/spec.yaml \
  -o ./src/api \
  --once
```

| Ситуация | Действие |
|----------|----------|
| Non-breaking изменения | Авто-обновление + бэкап в `.self-healing-backups/` |
| Breaking изменения | `user-review-required`, файл **не** перезаписывается |
| Regen клиента | Только `--once` + `-o` после `specWritten` |
| Continuous mode | Обновляет спеку; **не** regen клиент |

---

## 7. Статус фич F1–F10

| ID | Статус | Комментарий |
|----|--------|-------------|
| **F1** Anomaly → generate | ✅ | `failOnAnomalies` — config или `--anomaly-detection.fail-on-anomalies` |
| **F2** auto-select на `-i/-o` | ✅ | Detection rules по `package.json` |
| **F3** defaults fetch/none | ✅ | Zod при deps / `preferStandards` |
| **F4** swarm → клиенты | ✅ | |
| **F5** SelfHealingClient | ✅ | regen только `--once` + `-o` |
| **F6** optimization .hbs | ✅ | 6 шаблонов, ручная интеграция |
| **F7** координатор/консенсус | ⚠️ | Scaffolding |
| **F8** детекторы | ⚠️ | 10 реализовано; часть типов в схеме без impl |
| **F9** migrate + headers | ✅ | Live execute — нет |
| **F10** качество | ⚠️ | Детерминированные ID, polish backlog |

---

## 8. Программный API

Экспортируется из `core`:

- `AutoSelector`, `AnomalyDetector`, `AnomalyExploiter`
- `runAnomalyDetection`, `runAnomalyExploitation`
- `GradualMigrationPlanner`, `TrafficSplitter`, `ChangeDetector`
- `SelfHealingClient`
- `AvatarSwarmGenerator`, `RecommendationEngine`, `ReportGenerator`

```typescript
import { runAnomalyDetection } from 'ts-openapi-codegen';

const report = await runAnomalyDetection(openApi, {
  enabled: true,
  failOnAnomalies: true,
  reportPath: './report.json',
}, logger);
```

---

## 9. Ограничения preview

1. **`migrate`** — план + хелперы; прод-traffic не переключает.
2. **`heal`** — continuous mode не regen клиент; breaking требует review.
3. **`swarm`** — coordinator требует ручного wiring health endpoints.
4. **Оптимизации** — модули из `optimizations/` подключаются вручную.
5. **`anomalyDetection`** — шумные категории excluded by default.
6. **Auto-select** — эвристики по `package.json`, не AST consumer-кода.
7. Marauder config merge — shallow spread by default (`mergeMarauderBlock`); known array keys (`excludeCategories`, `detectionRules`) use one-level deep merge via `mergeMarauderBlockDeep` at config↔CLI and root↔item boundaries. Not a fully recursive deep merge.
8. Поведение может измениться до stable release.

---

## 10. Справочная карточка

```bash
# Project-aware generation
openapi-codegen-cli generate -i spec.yaml -o ./api --auto-select

# Quality scan + report
openapi-codegen-cli generate -i spec.yaml -o ./api --anomaly-detection

# CI gate (high severity only)
openapi-codegen-cli generate -i spec.yaml -o ./api \
  --anomaly-detection --anomaly-detection.fail-on-anomalies=true

# Scan + optimization scaffolds
openapi-codegen-cli generate -i spec.yaml -o ./api --exploit-anomalies

# Multi-service orchestration
openapi-codegen-cli swarm --specs-dir ./openapi -o ./swarm-out

# Migration plan + runtime helpers
openapi-codegen-cli migrate --from-client old --to-client new

# Remote spec sync + regen
openapi-codegen-cli heal --spec-url URL --local-spec ./spec.yaml --once -o ./api

# Upgrade config to V6
openapi-codegen-cli update-config -ocn openapi.config.json
```

---

## Связанные документы

- `CHANGELOG.md` / `CHANGELOG.RU.md` — секция `2.2.0-beta.1`
- `MIGRATION.md` — переход на V6
- `.cursor/skills/marauder-openapi-codegen/` — навык для AI-агентов
