## Контекст

Пайплайн генерации управляется `OpenApiClient`: метод `generate(rawOptions)` нормализует опции и вызывает `generateCodeForItems(items)`. Тот, в свою очередь, итерируется по items, вызывает `generateSingle`, затем `combineAndWrite`. Финальные постгенерационные шаги (запись кеш-репорта, gc ReuseStore) выполняются после цикла.

Все пять новых функций являются **opt-in** шагами этого пайплайна. Они не изменяют поведение существующих шагов — добавляются до (`preAnalyze`) или после (`workspaceReport`, `trafficSplitter`, `swarm`, `reuseMode: auto-group`) основного цикла.

`TRawOptions` и `TStrictFlatOptions` пока не содержат новых полей — их нужно добавить через `UnifiedOptionsSchemaV6` (уже сделано для схемы) и в `addDefaultValues` / `normalizeOptions` в `OpenApiClient`.

## Цели / Не-цели

**Цели:**
- Реализовать все пять core-модулей согласно `openspec/research/PDD.md`
- Подключить их к `OpenApiClient` и `WriteClient` в существующий пайплайн
- Пробросить новые поля через `TFlatOptions` / `TStrictFlatOptions`
- Экспортировать публичные API из `src/core/index.ts`

**Не-цели:**
- LLM/AI-рекомендации в отчётах (PDD §2.2 явно исключает)
- Изменение существующего поведения без флагов
- Per-item overrides для root-only опций

## Решения

### 1. Точки подключения в OpenApiClient

| Функция | Место в пайплайне | Метод |
|---|---|---|
| `preAnalyze` | До первого `generateSingle` | новый `runPreAnalyze(rawOptions, items)` |
| `workspaceReport` | После `combineAndWrite` + после `finalizeSpecAnalysis` | новый `writeWorkspaceReportIfEnabled(rawOptions, specStats, reuseStore)` |
| `trafficSplitter` | После `combineAndWrite`, для каждого item | новый `generateTrafficSplitterIfEnabled(rawOptions, items)` |
| `swarm` | После `combineAndWrite` | новый `generateSwarmIfEnabled(rawOptions, items, reuseStore)` |
| `reuseMode: auto-group` | Внутри `WriteClient.writeClient` при записи моделей | расширение `reuseWriterHelpers` |

### 2. Передача опций через пайплайн

Новые поля (`workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode`) живут на **root-уровне** конфига и не наследуются items. Они передаются напрямую из `rawOptions` в постгенерационные функции — не через `TStrictFlatOptions`. `normalizeOptions` и `addDefaultValues` не меняются.

### 3. workspaceReport — источники данных

`buildWorkspaceReport` получает:
- `specStats: SpecGenerationStats[]` — уже собирается в `generateCodeForItems`
- `reuseStore.getManifest()` — для cross-spec анализа через `analyzeCrossSpecManifest`
- `CrossSpecAnalyzer` — уже существует в `src/core/specAnalysis/`

Формат отчёта соответствует PDD §2.4. Запись через `writeWorkspaceReport` с поддержкой `format: 'json' | 'markdown' | 'both'`.

### 4. trafficSplitter — автономный модуль

Генерируется один файл `TrafficSplitter.ts` в `output`-папке **первого item** (или единственного item в non-items режиме). Файл самодостаточен — без внешних зависимостей, содержит inlined типы. Логика маршрутизации:
- `weighted`: `hash(clientId) % 100 < newClientWeight`
- `round-robin`: счётчик запросов % 2
- `header-based`: проверка `headerValues` в заголовке
- `header-and-weighted`: header как primary, weight как fallback

Sticky sessions: `Map<clientId, { client, expiresAt }>` с TTL из `sessionDuration` (парсинг `"1h"` → мс).

### 5. AvatarSwarm — источники данных

`AvatarSwarmGenerator` собирает данные из:
- `items` конфига (input/output пути)
- `reuseStore.getManifest().specItems` — артефактные ключи и reuseHits/Misses
- `reuseStore.getManifest().artifacts` — для определения sharedModels

При отсутствии `reuseStore` — пересечение имён моделей через `buildModelSchemaMap` (fallback).

### 6. preAnalyze — транзиентный анализ

Парсит все спеки последовательно через существующие парсеры (V2/V3), собирает схемы моделей, передаёт в `CrossSpecAnalyzer`. Вывод в stdout через `logger.forceInfo`. Генерация продолжается в штатном режиме.

### 7. reuseMode: auto-group

`OutputGroupResolver.resolveOutputGroups(absoluteOutputPaths)`:
- Находит LCA (Longest Common Ancestor) для 2+ output-путей
- Если LCA тривиален (корень ФС или `/`) — fallback к copy-based reuse
- Имя `__shared__` фиксировано

`SharedFolderWriter`:
- Canonical файл: `{LCA}/__shared__/{kind}/{Name}.ts`
- Stub у каждого item: `{item.output}/{kind}/{Name}.ts` → `export * from '../../__shared__/{kind}/{Name}'`

Интеграция: в `reuseWriterHelpers.ts`, проверяется `reuseMode === 'auto-group'` перед записью артефакта.

## Риски / Компромиссы

- **`TStrictFlatOptions` не расширяется** → root-only опции передаются из `rawOptions` напрямую, не через item-контекст. Это нарушает единообразие, но исключает случайное per-item применение root-only фич.
- **`reuseMode: auto-group` + trivial LCA** → молчаливый fallback к copy, без предупреждения. Риск: пользователь не поймёт, почему `__shared__` не появился. Меры: логировать fallback через `logger.warn`.
- **`trafficSplitter` в multi-item** → PDD §8 говорит, что он несовместим с `items`. Реализация: проверяем `items.length > 1` и логируем предупреждение, но не блокируем.
- **`swarm` без `ReuseStore`** → fallback к пересечению имён моделей менее точен. Документируем ограничение в логе.
