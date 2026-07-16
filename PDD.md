# PDD — Product Design Document  
**Проект:** openapi-codegen · Marauder Platform  
**Ветка:** `wip_marauder_next`  
**Период:** 2026-07-02 — 2026-07-06  
**Версия пакета:** 2.1.0 (unreleased)  
**Автор спецификации:** реконструирована из коммитов (reverse-openspec)  

---

## Содержание

1. [Контекст и мотивация](#1-контекст-и-мотивация)
2. [Инициатива 1 — Swarm-lite: `workspaceReport`](#2-инициатива-1--swarm-lite-workspacereport)
3. [Инициатива 2 — `TrafficSplitter`: постепенная миграция клиентов](#3-инициатива-2--trafficsplitter)
4. [MVP AvatarSwarm — карта всей мульти-спечной системы](#4-mvp-avatarswarm)
5. [Reuse Observability, `preAnalyze`, `reuseMode: auto-group`](#5-reuse-observability-preanalyze-reusemode-auto-group)
6. [Схема конфига V6 — новые поля](#6-схема-конфига-v6--новые-поля)
7. [Зависимости и экспорты](#7-зависимости-и-экспорты)
8. [Матрица совместимости и ограничений](#8-матрица-совместимости-и-ограничений)

---

## 1. Контекст и мотивация

Ветка `wip_marauder_next` развивает **Marauder Platform** — надстройку над codegen для управления жизненным циклом OpenAPI-клиентов в монорепозиториях. Выпуск 2.1.0 закрывает четыре темы:

| Тема | Проблема, которую решает |
|------|--------------------------|
| `workspaceReport` (Swarm-lite) | В multi-spec монорепо нет единого отчёта о пересечении/дрейфе моделей между сервисами |
| `TrafficSplitter` | Нет готового runtime-хелпера для canary-миграции между двумя версиями сгенерированного клиента |
| AvatarSwarm | Нет машиночитаемой карты всей системы генерируемых клиентов (кто что знает, что разделяет) |
| Reuse Observability / `preAnalyze` / `auto-group` | Нет ни видимости статистики reuse, ни предупреждений о пересечениях до записи файлов, ни дедупликации shared-артефактов без физических копий |

---

## 2. Инициатива 1 — Swarm-lite: `workspaceReport`

**Коммит:** `9adadcd`  
**Затронуто файлов:** 26 (+730 строк)

### 2.1 Назначение

Для multi-item (`items: [...]`) запусков `generate` создаёт консолидированный `workspace-report.json` / `workspace-report.md`, объединяющий:
- **Статистику генерации** по каждой спеке (длительность, reuse-хиты/промахи)
- **Cross-spec находки** из существующего `CrossSpecAnalyzer`: конфликты модели (name/hash), возможности переиспользования, дрейф схем, риски коллизий output-путей

### 2.2 Архитектурные решения

| Решение | Обоснование |
|---------|-------------|
| Без фиктивного coordinator/health-check/AI-рекомендаций | Только реальные данные из `CrossSpecAnalyzer` |
| Работает с `cacheStrategy: "reuse"` и без него | Использует манифест `ReuseStore` когда доступен, иначе строит из свежепарсенных спек |
| Опция только для root конфига | Аналогично `autoSelect`; не применима к отдельным item |
| Не связана с `specAnalysis`/`anomalyDetection` | Не пишет `anomaly-report.*`, не влияет на `failOnHigh` |

### 2.3 Конфигурация

```jsonc
// openapi.config.json (только root-уровень)
{
  "workspaceReport": {
    "enabled": true,
    "path": "./reports/workspace-report",   // base path без расширения
    "format": "both"                        // "json" | "markdown" | "both"
  }
}
```

**Shorthand:**
```jsonc
{ "workspaceReport": true }  // → enabled: true, defaults для path и format
```

**CLI:**
```bash
openapi-codegen generate --workspace-report
```

### 2.4 Структура отчёта

```ts
interface WorkspaceReport {
  generatedAt: string;           // ISO 8601
  specs: WorkspaceSpecSummary[]; // per-spec статистика
  crossSpec: SpecFinding[];      // находки CrossSpecAnalyzer
  summary: SpecAnalysisSummary;  // агрегированные счётчики
}

interface WorkspaceSpecSummary {
  name: string;
  input: string;
  durationMs: number;
  reuseHits: number;
  reuseMisses: number;
}
```

### 2.5 Выходные файлы

| Формат | Путь (default) |
|--------|----------------|
| JSON | `./workspace-report.json` |
| Markdown | `./workspace-report.md` |

### 2.6 Источники кода

| Файл | Роль |
|------|------|
| `src/core/workspaceReport/buildWorkspaceReport.ts` | Агрегация статистики + CrossSpec анализ |
| `src/core/workspaceReport/writeWorkspaceReport.ts` | Запись JSON и/или Markdown |
| `src/core/workspaceReport/types.ts` | Типы `WorkspaceReport`, `WorkspaceSpecSummary`, `WorkspaceReportConfig` |

---

## 3. Инициатива 2 — `TrafficSplitter`

**Коммит:** `7727a79`  
**Затронуто файлов:** 17 (+1029 строк)

### 3.1 Назначение

Опциональный runtime-хелпер постепенной миграции между старой и новой версией сгенерированного клиента. Генерируется как **самодостаточный модуль** — без внешних зависимостей — при включении соответствующей опции.

### 3.2 Стратегии маршрутизации

| Стратегия | Описание | Конфиг |
|-----------|----------|--------|
| `weighted` *(default)* | Распределение по весам `oldClientWeight`/`newClientWeight` | `strategy: "weighted"` |
| `round-robin` | Строгое чередование по запросам | `strategy: "round-robin"` |
| `header-based` | Маршрут по значению HTTP-заголовка | `strategy: "header-based"` + `headerName`, `headerValues` |
| `header-and-weighted` | Header как primary signal, weight как fallback | `strategy: "header-and-weighted"` |

**Гарантии:**
- **Детерминированный роутинг** per-clientId (hash-consistent).
- **Sticky sessions** с TTL (default `1h`, настраивается через `sessionDuration`).
- **Session statistics**: `totalSessions`, `oldClientSessions`, `newClientSessions`, процент распределения.

### 3.3 Конфигурация

```jsonc
// openapi.config.json (только root-уровень)
{
  "trafficSplitter": {
    "enabled": true,
    "strategy": "weighted",          // default
    "oldClientWeight": 80,
    "newClientWeight": 20,
    "stickySessions": true,
    "sessionDuration": "1h",
    "headerName": "X-Client-Version",
    "headerValues": { "old": "v1", "new": "v2" }
  }
}
```

**Shorthand:**
```jsonc
{ "trafficSplitter": true }  // → enabled: true, все defaults
```

**CLI:**
```bash
openapi-codegen generate --traffic-splitter
```

### 3.4 Сценарий canary-миграции

```ts
// Сгенерированный TrafficSplitter.ts в output-папке
const splitter = new TrafficSplitter({ strategy: 'weighted', newClientWeight: 10 });

const { isNewClient } = splitter.routeRequest({ clientId: userId });
const client = isNewClient ? newApiClient : oldApiClient;
```

### 3.5 Источники кода

| Файл | Роль |
|------|------|
| `src/core/migration/TrafficSplitter.ts` | Класс с 4 стратегиями, sticky sessions, статистикой |
| `src/core/migration/generateTrafficSplitterModule.ts` | Генератор автономного модуля (inline types, 0 зависимостей) |
| `src/core/migration/types.ts` | `TrafficSplitterConfig`, `TrafficSplittingResult`, `SessionStats` |

---

## 4. MVP AvatarSwarm

**Коммит:** `8071efe`  
**Затронуто файлов:** 16 (+590 строк)

### 4.1 Назначение

Постгенерационный шаг, записывающий `swarm-manifest.json` — машиночитаемую карту всей мульти-спечной системы. Позволяет инструментам и CI получить единый срез: кто что генерирует, какие модели разделяются, какой operationId в каком сервисе живёт.

### 4.2 Структура манифеста

```ts
interface SwarmManifest {
  version: 1;
  generatedAt: string;        // ISO 8601
  avatars: AvatarDescriptor[];
  sharedModels: SwarmSharedModel[];
  operationIndex: Record<string, string>;  // operationId → specItem
}

interface AvatarDescriptor {
  specItem: string;       // имя item'а из конфига
  input: string;          // путь к spec
  output: string;         // папка вывода
  operationIds: string[];
  modelNames: string[];
  reuseHits: number;
  reuseMisses: number;
}

interface SwarmSharedModel {
  name: string;
  usedBy: string[];       // specItem names
}
```

**Поведение при коллизии operationId:** побеждает первый встреченный (deterministic).

**Источник sharedModels:** манифест `ReuseStore` (если доступен) или пересечение имён моделей как fallback.

### 4.3 Конфигурация

```jsonc
// openapi.config.json (только root-уровень)
{
  "swarm": {
    "enabled": true,
    "output": "./swarm-manifest.json"  // default
  }
}
```

**Shorthand:**
```jsonc
{ "swarm": true }
```

**CLI:**
```bash
openapi-codegen generate --swarm
```

### 4.4 Источники кода

| Файл | Роль |
|------|------|
| `src/core/avatarSwarm/AvatarSwarmGenerator.ts` | Сборка манифеста из ReuseStore + spec items |
| `src/core/avatarSwarm/writeSwarmOutput.ts` | Запись `swarm-manifest.json` |
| `src/core/avatarSwarm/types.ts` | `SwarmManifest`, `AvatarDescriptor`, `SwarmSharedModel`, `SwarmConfig` |

---

## 5. Reuse Observability, `preAnalyze`, `reuseMode: auto-group`

**Коммит:** `efba83f`  
**Затронуто файлов:** 17 (+475 строк)

### 5.1 Reuse Observability (статистика переиспользования)

После каждого запуска `generate` с `cacheStrategy: "reuse"` **автоматически** выводится в stdout компактная сводка:

```
Reuse summary:
  hits: 47 / misses: 3  (94%)
  Top shared models: UserDto (12 specs), ErrorDto (10 specs), ...
  Conflicts resolved: 2
```

Настройка не требуется — выводится всегда при активном reuse.

### 5.2 `preAnalyze` — предгенерационный анализ пересечений

До записи первого файла парсит все спеки (только схемы, без записи артефактов), строит транзиентный cross-spec манифест, запускает `CrossSpecAnalyzer` и выводит отчёт в stdout.

**Что выводится:**
- Количество shared-моделей, конфликтов, уникальных
- Топ-5 shared-моделей с числом спек
- Детали конфликтов (name/hash)

**Генерация продолжается в штатном режиме.** `preAnalyze` — информационный шаг, не блокирующий.

**Конфигурация:**
```jsonc
{ "preAnalyze": true }
```

**CLI:**
```bash
openapi-codegen generate --pre-analyze
```

### 5.3 `reuseMode: auto-group` — дедупликация через shared-folder

| Режим | Поведение |
|-------|-----------|
| `"copy"` *(default)* | Физические копии shared-артефактов в каждой item-папке (существующее поведение) |
| `"auto-group"` | Один canonical-файл + stub-реэкспорты у каждого item |

**Алгоритм `auto-group`:**

```
1. resolveOutputGroups(absoluteOutputPaths)
   → находит LCA (longest common ancestor) для 2+ items
   → если LCA тривиален (корень ФС) — fallback к copy

2. Для каждого shared-артефакта:
   → пишет canonical в {LCA}/__shared__/{kind}/{Name}.ts
   → пишет stub в {item.output}/{kind}/{Name}.ts:
       export * from '../../__shared__/{kind}/{Name}';

3. combineAndWrite() — barrel-индексы разрешаются через stub-файлы
```

**Имя папки `__shared__` фиксировано** — не настраивается, чтобы исключить path traversal.

**При отсутствии полезного LCA:** молча возвращается к copy-based reuse.

**Конфигурация:**
```jsonc
{ "reuseMode": "auto-group" }
```

**CLI:**
```bash
openapi-codegen generate --reuse-mode=auto-group
```

### 5.4 Исправления

| Файл | Баг | Исправление |
|------|-----|-------------|
| `src/core/utils/adapters/semanticToStructural.ts` | `ignored: ignored \|\| undefined` приводил `ignored = 0` к `undefined`, исключая поле из JSON | `ignored: ignored` — поле теперь `0` при явной передаче |

### 5.5 Источники кода

| Файл | Роль |
|------|------|
| `src/core/reuseStore/OutputGroupResolver.ts` | LCA-алгоритм, определение `OutputGroup` |
| `src/core/reuseStore/SharedFolderWriter.ts` | Запись canonical + stub файлов |
| `src/core/reuseStore/computeStoreRelativeImport.ts` | Вычисление относительного пути импорта из stub → canonical |

---

## 6. Схема конфига V6 — новые поля

Все новые опции добавлены **только на root-уровень** (не применяются к отдельным items).

```ts
// Расширение TStrictFlatOptions / UnifiedOptionsSchemaV6
interface MarauderV6Extensions {
  // === Инициатива 1 ===
  workspaceReport?: boolean | {
    enabled?: boolean;
    path?: string;                          // default: "./workspace-report"
    format?: 'json' | 'markdown' | 'both'; // default: "both"
  };

  // === Инициатива 2 ===
  trafficSplitter?: boolean | {
    enabled?: boolean;
    strategy?: 'weighted' | 'round-robin' | 'header-based' | 'header-and-weighted';
    oldClientWeight?: number;               // default: 50
    newClientWeight?: number;               // default: 50
    headerName?: string;
    headerValues?: { old: string; new: string };
    stickySessions?: boolean;
    sessionDuration?: string;               // default: "1h"
  };

  // === MVP AvatarSwarm ===
  swarm?: boolean | {
    enabled?: boolean;
    output?: string;                        // default: "./swarm-manifest.json"
  };

  // === Reuse Observability ===
  preAnalyze?: boolean;                     // default: false
  reuseMode?: 'copy' | 'auto-group';       // default: "copy"
}
```

**Defaults (из `COMMON_DEFAULT_OPTIONS_VALUES`):**

```ts
workspaceReport: { enabled: false, path: buildDefaultReportPath('workspace-report'), format: 'both' }
trafficSplitter: { enabled: false }
swarm:           { enabled: false, output: './swarm-manifest.json' }
preAnalyze:      false
reuseMode:       'copy'
```

---

## 7. Зависимости и экспорты

### 7.1 Новые программные экспорты из `core`

```ts
// src/core/index.ts — после всех коммитов ветки
export { buildWorkspaceReport, writeWorkspaceReport }  // + WorkspaceReport* types
export { TrafficSplitter, generateTrafficSplitterModule }  // + TrafficSplitterConfig, TrafficSplittingResult, SessionStats
export { AvatarSwarmGenerator }       // + AvatarDescriptor, SwarmManifest, SwarmConfig
```

---

## 8. Матрица совместимости и ограничений

| Фича | Совместима с `items: [...]` | Совместима с `cacheStrategy: "reuse"` | Только root конфиг | Блокирует генерацию при ошибке |
|------|:---:|:---:|:---:|:---:|
| `workspaceReport` | **Да** (требует) | Да | **Да** | Нет |
| `trafficSplitter` | Нет (single-item) | N/A | **Да** | Нет |
| `swarm` | **Да** | Да (предпочтительно) | **Да** | Нет |
| `preAnalyze` | **Да** | Да | **Да** | Нет |
| `reuseMode: auto-group` | **Да** | **Требует** | **Да** | Нет (fallback к copy) |

### 8.1 Ограничения `reuseMode: auto-group`

- Имя папки `__shared__` не настраивается.
- При тривиальном LCA (нет общего родителя) — молчаливый fallback к `copy`.
- Реэкспортные stub-файлы добавляются в barrel-индексы через `combineAndWrite()`, поэтому порядок проходов фиксирован: stub-запись → combineAndWrite.

### 8.2 Ограничения `swarm`

- При коллизии `operationId` между спеками победителем становится первый встреченный item (детерминировано, но без предупреждения).
- Для `sharedModels`: если `ReuseStore`-манифест недоступен — используется пересечение имён моделей (менее точно, без hash-верификации).

---

*Документ сгенерирован обратным анализом коммитов ветки `wip_marauder_next` относительно `master` (merge-base `0b3ac90`). Дата реконструкции: 2026-07-16.*
