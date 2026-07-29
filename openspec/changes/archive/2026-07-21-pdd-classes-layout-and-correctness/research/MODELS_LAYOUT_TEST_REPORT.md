# Отчёт: modelsLayout / DTO — прогресс, конфиги, спеки, ошибки генерации

**Дата:** 2026-07-18  
**Change:** `openspec/changes/pdd-classes-layout-and-correctness`  
**Команды проверки:**
```bash
npx tsx ./src/cli/index.ts generate -ocn example/openapi.models.config.json
npx tsx ./src/cli/index.ts generate -ocn example/openapi.models.dto.config.json
# контроль с явным override:
npx tsx ./src/cli/index.ts generate -ocn example/openapi.models.dto.config.json --modelsMode classes --modelsLayout per-file
```

---

## 1. Сумари прогресса (текущее состояние)

### Сделано (OpenSpec apply — 21/21 tasks)

| Область | Статус |
|---------|--------|
| `models.layout` / `--modelsLayout` (`bundle` default \| `per-file`) | Реализовано в коде |
| Write-path classes: bundle `models.ts` / per-file по `model.path` | Реализовано |
| ReuseStore для classes + `per-file` | Реализовано |
| `analyze-usage --diff-report` + `useHistory: true` | Исправлено |
| Runtime `miracles.*` + root→items | Реализовано |
| Yup boolean `needsCoercion` | Реализовано |
| Docs EN/RU + CHANGELOG / CHANGELOG.RU Unreleased | Обновлено |
| Unit + E2E (`v3.json` classes bundle / per-file) | Зелёные |

### Артефакты планирования

`openspec/changes/pdd-classes-layout-and-correctness/` — proposal, design, specs, tasks (все `[x]`).

### Важно для локального тестирования

1. Генерация через `npx tsx ./src/cli/index.ts` идёт из **исходников** (не `dist/`).
2. Обнаружен **блокер CLI** (см. §4): `--modelsMode` с `.default(interfaces)` **перетирает** `models.mode` из конфига при `-ocn`. Без явного `--modelsMode classes` DTO-конфиг фактически генерирует **interfaces**.
3. Change ещё **не заархивирован**; CLI-баг и per-file relative imports — follow-up (не закрыты задачами change).

---

## 2. Конфиги `example/openapi.models*.json` — корректны ли для сравнения?

### Файлы

**A — `example/openapi.models.config.json`**
```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./example/executor.ts",
  "useUnionTypes": true,
  "sortByRequired": true,
  "input": "./test/spec/v3.yml",
  "output": "./test/generated/v3/"
}
```

**B — `example/openapi.models.dto.config.json`**
```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./example/executor.ts",
  "useUnionTypes": true,
  "sortByRequired": true,
  "modelsMode": "classes",
  "models": { "mode": "classes", "layout": "per-file" },
  "useHistory": true,
  "input": "./test/spec/v3withAlias.yaml",
  "output": "./test/generated/v3/"
}
```

### Вердикт: **НЕТ** — это не минимальная корректная пара для сравнения `modelsLayout`

| Проблема | Почему ломает сравнение |
|----------|-------------------------|
| **Разный `input`** (`v3.yml` vs `v3withAlias.yaml`) | Разный набор схем → разные файлы/имена |
| **Один `output`** (`./test/generated/v3/`) | Второй прогон затирает первый; side-by-side невозможен |
| **A = interfaces, B = classes+layout** | Сравниваются *режим формы* и *layout* одновременно; `layout` влияет только на `classes` |
| **B: `useHistory: true` без `diffReport`** | Лишняя ось (warn/skip history); к layout не относится |
| **Дублирование `modelsMode` + `models.mode`** | Безвредно, но не «минимально» |
| **CLI default `--modelsMode interfaces`** | Даже корректный B **не применяется** при `generate -ocn` без явного флага (см. §4) |

### Что сравнивать правильно (две отдельные пары)

Общий base (одинаковый во всех руках):
```json
{
  "httpClient": "fetch",
  "customExecutorPath": "./example/executor.ts",
  "useUnionTypes": true,
  "sortByRequired": true,
  "input": "./test/spec/v3.json"
}
```

**(a) Форма: interfaces vs classes (layout default = bundle)**  
- `models.mode: interfaces` → `./test/generated/v3-interfaces/`  
- `models.mode: classes`, `layout: bundle` → `./test/generated/v3-classes-bundle/`

**(b) Layout: classes bundle vs classes per-file** (главное для `modelsLayout`)  
- `mode: classes`, `layout: bundle` → `./test/generated/v3-classes-bundle/`  
- `mode: classes`, `layout: per-file` → `./test/generated/v3-classes-per-file/`

Без `useHistory`, с **разными** `output`, с **одним** `input`.  
Workaround CLI до фикса: всегда добавлять `--modelsMode classes --modelsLayout …`.

---

## 3. Какие спеки из `test/spec` лучше для сравнения DTO + modelsLayout

| Ранг | Спека | Схемы / cross-refs | Рекомендация |
|------|-------|--------------------|--------------|
| **1** | `test/spec/v3.json` | ~48 schemas, сильные `$ref` между моделями | **Основная** (уже в E2E classes) |
| **2** | `test/spec/v3.yml` | ~19 + внешние фрагменты, слабее граф | Быстрый OAS3-вариант |
| **3** | `test/spec/lom/lom_api.yaml` | 6 объектов, 1 cross-ref | Только smoke |
| **4** | `test/spec/v3.withDifferentRefs.yml` | Сложные `$ref` | Stress после основной пары |
| — | `v3withAlias.yaml` | Почти нет `components.schemas`; path-alias DTO | **Плохо** как единственная спека для layout (как раз B сейчас) |
| — | `anomalies/*`, `path.yaml`, мелкие fragments | Не entrypoint / не граф моделей | Не для layout A/B |

**Итог:** для сравнения `modelsLayout` + DTO использовать **`test/spec/v3.json`**, не `v3withAlias.yaml`.

---

## 4. Ошибки после `generate -ocn` — причины и пути решения

### 4.1 Прогон как у пользователя

| Конфиг | Exit code CLI | Фактический `modelsMode` | Результат в `test/generated/v3/` |
|--------|---------------|--------------------------|----------------------------------|
| `openapi.models.config.json` | 0 | interfaces (default) | Per-path interfaces (из `v3.yml`, затем затёрто) |
| `openapi.models.dto.config.json` | 0 | **interfaces** (CLI default перетёр config!) | Interfaces из `v3withAlias` — **нет** BaseDto/Dto |

Контроль с `--modelsMode classes --modelsLayout per-file`: появляются `core/BaseDto.ts`, `dtoUtils.ts`, per-file `*Raw`/`*Dto` — layout работает, но **tsc падает** (ниже).

### 4.2 P0 — CLI: `--modelsMode` default убивает конфиг

**Симптом:** в конфиге `"models": { "mode": "classes" }`, а генерируются interfaces.

**Причина:**
```ts
// src/cli/index.ts
.addOption(...('--modelsMode'...).default(ModelsMode.INTERFACES))
// mergeGenerateCliOverrides: если cliValue !== undefined → пишем в merged
```
Commander всегда ставит default → merge всегда пишет `interfaces` поверх конфига → `models.mode` не читается (`modelsMode ?? models?.mode`).

**Решения:**
1. **Codegen (правильный):** убрать `.default(ModelsMode.INTERFACES)` у Commander (как уже сделано для `--modelsLayout`), либо override только если флаг реально передан (`opts().modelsMode` / check `process.argv`).
2. **Workaround:**  
   `npx tsx ./src/cli/index.ts generate -ocn example/openapi.models.dto.config.json --modelsMode classes --modelsLayout per-file`
3. Аналогично проверить другие флаги с `.default(...)` в `GENERATE_CLI_OVERRIDE_KEYS` (httpClient, validationLibrary, …).

### 4.3 P0 — Per-file: неверный relative import `BaseDto` / `dtoUtils`

**Симптом (tsc):**
```
models/path/alias_request/SimpleDto.ts: Cannot find module '../core/BaseDto'
```

**Причина:** в шаблон передаётся `outputCore` = relative от **корня** `models/` → `../core`.  
Файл лежит в `models/path/alias_request/` → нужно `../../../core`, а не `../core`.

**Решения:**
1. При записи каждого per-file модели вычислять `relativeHelper(dirName(model.path), outputCore)` / depth от `model.path`.
2. Либо в template helper: `joinPath` с учётом глубины текущего файла.
3. Bundle (`models/models.ts`) этой ошибки не имеет — только per-file + вложенные path.

### 4.4 P1 — Неверные имена импортов peer DTO (`ISimpleDtoRaw` vs `ISimpleDto$2Raw`)

**Симптом:**
```
'"../common_request/SimpleDto"' has no exported member named 'ISimpleDtoRaw'.
Did you mean 'ISimpleDto$2Raw'?
```

**Причина:** `prepareDtoModels` / `dtoImports` мапят по «базовому» имени из `imports`, не учитывая `$2`/`$3` alias export names файла-источника. На `v3withAlias` коллизии имён — норма.

**Решения:**
1. Строить `dtoImports` через `path → exportName/rawName/dtoName` map (как `resolveClassesModeTypes`), а не только по `imprt.name`.
2. Для сравнения layout временно использовать `v3.json` (меньше path-alias коллизий) — ошибки будут проще.

### 4.5 P1 — Dictionary / oneOf / anyOf / allOf не оборачиваются в Dto

**Симптом:**
```
Type 'Record<string, ISimpleDto$2Raw>' is not assignable to 'Record<string, ISimpleDto$2Dto>'
```
В конструкторе: `this.dictionaryOfRequest = data.dictionaryOfRequest ?? undefined` без `fromArray`/map в Dto.

**Причина:** `buildDtoInit` в `prepareDtoModels` покрывает reference и array-of-ref; dictionary/compositions — raw passthrough.

**Решения:** расширить `buildDtoInit` / `buildDtoToJson` для `dictionary` + composition (или оставлять Raw-тип поля для composition until designed). Follow-up вне минимального layout.

### 4.6 P1 — Примитивный alias как value: `new TTypeDto(...)`

**Симптом:** `'TTypeDto' only refers to a type, but is being used as a value`  
(`export type TTypeDto = TTypeRaw` / `string`).

**Причина:** `dtoKind: 'alias'` для non-interface, но init всё равно делает `new …Dto`.

**Решение:** для `dtoKind !== 'class'` не генерировать `new`; присваивать raw значение.

### 4.7 P2 — Interfaces mode: TS2440 (когда classes не применился)

**Симптом в `alias_request/SimpleDto.ts` (interfaces):**
```ts
import type { ISimpleDto } from './../common_response/SimpleDto';
export interface ISimpleDto { ... }  // TS2440 Import declaration conflicts with local declaration
```

**Причина:** codegen не алиасит одноимённый импорт, если локальный export = то же имя.  
Проявляется на `v3withAlias` даже без DTO.

**Решение:** всегда alias foreign same-name imports (`as ISimpleDto$N`).

### 4.8 P2 — Коллизия output / leftover

Оба конфига → `./test/generated/v3/`. Смешение артефактов + невозможность diff.  
**Решение:** разные `output` + при необходимости `clean: true`.

### 4.9 P2 — `useHistory: true` без отчёта

Лишний шум; к layout не относится. Убрать из минимальных конфигов сравнения.

### 4.10 Косметика

`index.ts` пути вида `././core/...` — не ломают tsc, но шум; поправить `joinPath`/`modelsPackage`.

---

## 5. Приоритетный план действий

1. **Fix CLI default `--modelsMode`** (и аудит других `.default` + override keys) — иначе конфиг classes бесполезен при `-ocn`.
2. **Fix relative `outputCore` для nested per-file** — иначе DTO per-file не компилируется.
3. **Переписать тестовые конфиги** по §2 (один input `v3.json`, разные output, пара bundle/per-file).
4. Fix `dtoImports` alias/`$N` mapping; dictionary/composition init; primitive `new` — качество classes на alias-heavy спеках.
5. Зафиксировать regression-тесты: config-only `models.mode=classes` без CLI flag; per-file nested path → корректный import BaseDto.

---

## 6. Краткие ответы на вопросы

1. **Прогресс:** feature modelsLayout реализована и задокументирована; apply tasks закрыты; при локальном `-ocn` тестировании всплыли CLI override + per-file import bugs.  
2. **Конфиги:** для сравнения layout — **некорректны** (разный input/output/mode/history + CLI override).  
3. **Спека:** лучше всего **`test/spec/v3.json`**; `v3withAlias.yaml` — плохой primary для layout.  
4. **Ошибки:** CLI default `modelsMode` → нет DTO; после force classes — битые `../core` imports, wrong `$N` peer names, dictionary/primitive DTO init; interfaces TS2440 на alias-спеке.
