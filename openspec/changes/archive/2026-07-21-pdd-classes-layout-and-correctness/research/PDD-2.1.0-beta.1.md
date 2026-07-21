# PDD: openapi-codegen models/history/DTO

> **Тип документа:** reverse-engineered OpenSpec change (PDD)  
> **Исторический якорь:** CHANGELOG `[2.1.0-beta.1] — 2026-03-02`  
> **As-built HEAD:** `package.json` → **`2.1.0-beta.13`** (2026-07-17), schema **`UNIFIED_OPTIONS_v6`**  
> **Схема артефактов:** как у `openspec` (`proposal` → `design` → `specs/*` → `tasks`)  
> **Дата первой сборки:** 2026-07-18  
> **Дата глубокого аудита HEAD:** 2026-07-18  
> **Исследование (агенты):**  
> - [DTO layout beta.1](40663753-9e61-4054-b57d-92b33bdcfd84), [feature map](a49677cc-4cc5-4b01-8617-a0d289c0885d)  
> - [DTO layout HEAD](c3facf0a-78c6-419a-bbd5-e5db638147c8), [history/miracles HEAD](f862afb3-b293-4a68-a8ae-848b92a661ba), [Blob/schema HEAD](96a914bb-4940-42e1-af82-c02f79aa0cc5), [PDD delta](04b74f29-207e-447d-99e1-76d5428794f4)

Документ — спецификация «от кода»: что появилось в beta.1, что эволюционировало до beta.13, и где решение расходится с ожидаемым UX (в первую очередь — раскладка DTO-файлов).

---

## 0. Метаданные change

| Поле | Значение |
|------|----------|
| Change id | `pdd-2-1-0-models-history-dto` |
| Schema | `spec-driven` |
| Status | `implemented` (reverse-spec); layout gap **open** |
| Introduced | `2.1.0-beta.1` |
| Verified at | `2.1.0-beta.13` |
| Scope (core) | history/diff, `modelsMode`, Blob, miracles, coercion, ghost API |
| Scope (later betas, related) | semantic diff 1.1→2.0, `resolveClassesModeTypes`, analyze-usage, entity-cache fallback, V6/Marauder preview |
| Non-scope (отдельные PDD) | RequestExecutor deep-dive, полная спецификация Marauder Phase 2 |

### Delta vs первая версия этого PDD (кратко)

| Тема | Было в PDD (beta.1-centric) | Факт на HEAD (beta.13) |
|------|----------------------------|-------------------------|
| Package | подразумевался beta.1 | **`2.1.0-beta.13`** |
| Config schema | V4 blocks | **V6** (models/analyze/miracles с V4; Marauder с V6) |
| Diff report | «unified» без версии | **`schemaVersion: "2.0.0"`** (beta.9); адаптеры 1.1.0 + legacy |
| `resolveClassesModeTypes` | как часть beta.1 pipeline | добавлен в **beta.9** (fix сломанных imports) |
| Duplicate aliases | упомянуты кратко | **`$2`, `$3`…** via `assignDuplicateAliases` (beta.9, breaking) |
| Stale report | «silent / warn» | **warn** (`DIFF_REPORT.STALE`) с beta.9 |
| Reuse + classes | ReuseStore off | + **entity cache persist** при fallback (beta.13) |
| `analyze.ignore` | не описан | **wired** в analyze-diff |
| `analyze-usage --diff-report` | отсутствовал | флаг есть (beta.11), но **сломан** (нет `useHistory`) |
| Yup boolean coerce | «Yup ок» | **gap** — нет ветки `needsCoercion` |
| Report hash | не уточнён / CHANGELOG SHA-256 | код **MD5** в `analyzeDiff.ts` |
| Layout `models.ts` | single file | **без изменений** — по-прежнему бандл |

---

## 1. proposal.md

### Почему (beta.1)

До 2.1.0-beta.1 клиент генерировал модели только как TypeScript interfaces/types (один файл на схему по `model.path`). Нужны были:

1. эволюция API с мягкой миграцией потребителей (diff → history → annotations);
2. runtime DTO-слой (`*Raw` / `*Dto`) с `toJSON()`, конструкторами и deprecated-геттерами при rename;
3. корректная работа с binary/`Blob`;
4. авто-коэрсинг при смене типов в validation-схемах.

### Что появилось в beta.1

- Команда `analyze-diff` + опции `useHistory` / `diffReport`.
- `modelsMode: "interfaces" | "classes"` (CLI `--modelsMode`, конфиг flat/nested `models.mode`).
- При `classes`: `*Raw` + `*Dto`, `BaseDto`, `dtoUtils`, miracles → deprecated getters.
- Blob/`format: binary` + `responseType: 'blob'` во всех HTTP-клиентах.
- Auto-coercion в Zod/Joi/Yup/AJV при history + type-change (с оговорками по библиотекам — см. §3.7 / §4).
- Блоки конфига `models`, `analyze`, `miracles` в unified-схеме / `init`.
- Улучшения парсинга response `$ref` и загрузки спеки без `chdir`.

### Что эволюционировало после beta.1 (релевантно этому PDD)

| Beta | Изменение |
|------|-----------|
| **5** | Semantic diff engine (`1.1.0`), governance, CI markdown, `--compare-with` priority |
| **7** | Команда `analyze-usage` |
| **9** | **Unified report `2.0.0`**, `buildMiraclesFromSemanticChanges`, adapters, ghosts, stale warn, **`resolveClassesModeTypes`**, `assignDuplicateAliases` `$2`, fix classes service imports |
| **11** | `analyze-usage --diff-report`, default reports → `./.openapi-codegen-reports/`, ReuseStore preview |
| **13** | Entity-cache **persist** при `reuse`+`classes`; Marauder Phase 2 preview (V6); cache hashes → MD5 |

### Возможности (capabilities)

| Capability id | Introduced | Описание |
|---------------|------------|----------|
| `binary-blob-runtime` | beta.1 | Маппинг binary → Blob и runtime blob responses |
| `analyze-diff-cli` | beta.1; report 2.0.0 в beta.9 | Diff между версиями OpenAPI |
| `history-generate` | beta.1; adapters beta.9 | Применение diff-отчёта при `generate --useHistory` |
| `models-mode-classes` | beta.1 | Режим DTO/Raw (`modelsMode=classes`) — **single `models.ts`** |
| `dto-core-helpers` | beta.1 | `BaseDto` + `dtoUtils` в generated core |
| `miracles-dto-getters` | beta.1 | Confirmed RENAME → deprecated getters на DTO |
| `validation-coercion` | beta.1 | Coercion в схемах валидации при type change |
| `ghost-api-surface` | beta.9 (hardened) | Ghost operations/properties из removed entries |
| `resolve-classes-mode-types` | **beta.9** | Rewrite service imports/types под bundle exports |
| `duplicate-model-aliases` | **beta.9** | `$2`/`$3` naming для коллизий схем |
| `analyze-usage-cli` | beta.7; `--diff-report` beta.11 | Consumer usage analysis (+ broken rename check) |

### Влияние (HEAD)

- **CLI:** `src/cli/index.ts` — флаги generate + `analyze-diff` + `analyze-usage`.
- **Core pipeline:** `OpenApiClient.normalizeOptions` / `generateSingle` → `applyDiffReport` → `[classes] prepareDtoModels` → **`resolveClassesModeTypes` (beta.9+)** → `WriteClient`.
- **Write-path:** `writeClientModels.ts` (fork interfaces vs classes), `writeClientCore.ts`, templates `exportModels.hbs`.
- **Выходная раскладка:** при `classes` — **один** `{outputModels}/models.ts` (не менялось с beta.1).
- **Reuse:** `ReuseStore` отключён для `modelsMode=classes`; при `cacheStrategy: reuse` — fallback **entity cache с persist** (beta.13).

### Ожидание пользователя vs факт (критический gap — **без изменений на HEAD**)

| Ожидание | Факт beta.1 → beta.13 |
|----------|------------------------|
| При `modelsMode=classes` сохранить раскладку «одна модель — один файл», как без DTO-прослойки (`interfaces`) | Все Raw/Dto пишутся в **один** `models.ts` |
| DTO — только смена *формы* модели (interface → class), не смена *топологии* файлов | Топология файлов жёстко меняется в `writeClientModels` |

CHANGELOG beta.1 и `docs/*/features.md` фиксируют intentional design: «в одном `models.ts`». Флаг layout / per-file **по-прежнему отсутствует**. Для потребителя, привыкшего к per-file layout, это дефект продукта, даже если код «работает как задумано».

---

## 2. design.md

### Контекст (HEAD pipeline)

```
                    ┌─────────────────┐
  OpenAPI spec ───► │ Parser V2 / V3  │ ──► Client.models[].path
                    │ + duplicate $2  │     (assignDuplicateAliases)
                    └────────┬────────┘
                             │
              useHistory?    ▼
                    ┌─────────────────┐
                    │ loadDiffReport  │ ──► 2.0.0 | 1.1.0 | legacy
                    │ applyDiffReport │ ──► miracles, coercion, ghosts
                    └────────┬────────┘
                             │
              modelsMode===classes?
                    ┌────────┴────────┐
                    ▼                 ▼
           prepareDtoModels     (skip)
           resolveClassesModeTypes   ← since beta.9
                    │
                    ▼
              WriteClient.writeClient
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
      core/     services/   models/
   BaseDto+     from ./models  ★ layout fork: models.ts ONLY
   dtoUtils
```

### Цели

- Дать opt-in DTO-слой без ломки default (`interfaces`).
- Связать history/miracles с DTO (deprecated getters, coercion в конструкторе).
- Сохранить существующий interface-path для большинства пользователей.

### Не-цели (as-built HEAD)

- Per-file layout для `classes` — **не реализовано и не конфигурируется**.
- Runtime-чтение `miracles.enabled` / `confidence` / `types` из конфига — схема есть, логика фильтрации захардкожена.
- ReuseStore / auto-group для class-mode models.
- Паритет Yup boolean coercion с Zod/Joi.

### Решения (as-built)

#### R1. Раскладка models: single `models.ts` при classes ⚠ UNCHANGED

**Где:** `src/core/utils/writeClientModels.ts:75–91`

```ts
if (modelsMode === ModelsMode.CLASSES) {
    const file = resolveHelper(outputModelsPath, 'models.ts');
    // templates.exports.models(...)  // exportModels.hbs
    await this.writeOutputFile(file, formattedValue);
    return; // ← нет цикла по model.path
}
```

**Interfaces** (`:93–150`): цикл `for (const model of models)` → `{model.path}.ts` через `exportModel.hbs`, с optional ReuseStore.

**Почему так сделали (inferred):**

1. `prepareDtoModels` строит глобальную name-map (`baseName → rawName/dtoName`) и cross-model `dtoInit`/`dtoToJSON`.
2. `exportModels.hbs` — три прохода (Raw, Dto, `export type Alias = *Raw`) с общими импортами `BaseDto`/`fromArray`.
3. `resolveClassesModeTypes` (**beta.9**) переписывает импорты сервисов на consolidated export names из одного модуля.
4. ReuseStore предполагает один artifact на `{path}.ts` — несовместим с монолитом.

**Альтернатива (ожидаемая / желательная):**  
Один файл на модель: `{path}.ts` содержит `*Raw` + `*Dto` (+ alias), сохраняя `model.path` из парсера — как без DTO-прослойки.

#### R2. Подготовка DTO-метаданных

**Где:** `prepareDtoModels.ts` → `OpenApiClient` только при `modelsMode === CLASSES` (~783, ~827).

- `rawName` / `dtoName` / `exportName`, типы свойств, init/toJSON, optional `undefined` fallback.
- `attachDtoGetters` из RENAME miracles, уже отфильтрованных в `applyDiffReportToClient`.
- Coercion в конструкторе: только `number` и `boolean` string→typed.
- Quoted property accessors (`['weird-name']`).

#### R3. History pipeline (HEAD)

```
analyze-diff
  → (optional) analyze.ignore filter
  → semantic report + buildMiraclesFromSemanticChanges
  → adaptSemanticToStructural
  → unified report schemaVersion "2.0.0"
       semantic.* + structural.{diff,miracles,stats}

generate --useHistory
  → loadDiffReport (gate: useHistory===true)
       accepts 2.0.0 | 1.1.0 | legacy flat
       stale mtime → warn + null
  → applyDiffReportToClient
       miracles filter: confirmed | confidence===1
       ghosts, coercion flags
  → [classes] prepareDtoModels → resolveClassesModeTypes → write
```

CLI: `--useHistory`, `--diffReport`; nested: `analyze.useHistory`, `analyze.reportPath`.  
Default path (с beta.11): `./.openapi-codegen-reports/openapi-diff-report.json`.

#### R4. BaseDto / dtoUtils

- Обычно: `core/BaseDto.ts`, `core/dtoUtils.ts` (`writeClientCore.ts`).
- При `excludeCoreServiceFiles && classes`: inline в `models/` (`WriteClient.ts`); `outputCorePath: './'`.
- **Тестовый gap:** E2E `excludeCoreServiceFiles` покрывает interfaces, не classes+inline.

#### R5. Miracles

- Производятся в `analyze-diff` (`buildMiraclesFromSemanticChanges`):
  - `TYPE_COERCION` — всегда `confidence: 1`;
  - `RENAME` — Levenshtein ratio ≤ 0.2, heuristic confidence.
- Хранятся в `report.structural.miracles` (2.0.0).
- Применяются при generate, если `status === 'confirmed'` **или** `confidence === 1`.
- Конфиг-блок `miracles.{enabled,confidence,types}` в схеме **не читается** runtime-фильтром.
- Root→item: `useHistory`/`diffReport`/`modelsMode` наследуются в `normalizeOptions`; **`miracles` — нет**.

#### R6. `resolveClassesModeTypes` (beta.9)

- Map `model.path → exportName`.
- Rewrite service imports + recursive operation type `base`/`type` (включая nested links/properties).
- Нужен именно из-за бандла `models.ts` и `$2` aliases.

#### R7. Duplicate aliases (beta.9)

- `assignDuplicateAliases`: первое совпадение без суффикса; далее `$2`, `$3`, …
- Breaking для потребителей со старой нумерацией (см. MIGRATION).

### Риски / компромиссы (as-built HEAD)

| Риск | Следствие | Статус vs beta.1 PDD |
|------|-----------|----------------------|
| Монолитный `models.ts` | Плохой DX, merge conflicts, блокирует reuse | **без изменений** |
| ReuseStore disabled for classes | Нет дедупа моделей | + entity cache **persist** (beta.13) |
| `model.path` игнорируется при write classes | Мёртвая семантика path | без изменений |
| Stale/missing diff | History не применяется | **warn** (улучшено beta.9); fail-closed нет |
| Dual BaseDto placement | Хрупкие relative imports | без изменений |
| `analyze-usage --diff-report` | Rename check no-op | **новый P1** |
| Yup boolean coerce | Паритет библиотек нарушен | **новый P2** |
| MD5 vs docs SHA-256 | Drift CHANGELOG↔код | **новый P2** |

---

## 3. specs/ (requirements от кода на HEAD)

### 3.1 `binary-blob-runtime`

#### Requirement: format binary маппится в Blob

Генератор ДОЛЖЕН маппить OpenAPI `format: binary` в TypeScript тип `Blob` и при наличии Blob/File в results операции выставлять `responseType: 'blob'`. Runtime HTTP-клиенты (`fetch`/`xhr`/`node`/`axios`) ДОЛЖНЫ корректно читать бинарное тело. `x-typescript-type` ДОЛЖЕН иметь приоритет (например `File`).

#### Scenario: schema binary → Blob
- **WHEN** свойство схемы имеет `format: binary`
- **THEN** сгенерированный тип свойства — `Blob`

#### Scenario: operation responseType blob
- **WHEN** результат операции имеет base `Blob` или `File`
- **THEN** в опциях запроса присутствует `responseType: 'blob'`

#### Scenario: File type rendering by httpClient
- **WHEN** base — `File` и `httpClient` — `fetch`/`xhr`
- **THEN** в типах рендерится `Blob`; для `node`/`axios` — `Buffer | ArrayBuffer | ArrayBufferView`

---

### 3.2 `analyze-diff-cli`

#### Requirement: команда analyze-diff пишет unified report 2.0.0

CLI ДОЛЖЕН предоставлять `analyze-diff` с флагами `--input`, `--compare-with` / `--git`, `--output-report`, governance/CI флаги. При отсутствии compare-источника команда МОЖЕТ завершиться с exit 0 без анализа.

Выходной JSON ДОЛЖЕН иметь `schemaVersion: "2.0.0"` с секциями `semantic` и `structural` (включая `structural.miracles`).

#### Scenario: compare-with wins over git
- **WHEN** заданы и `--compare-with`, и `--git`
- **THEN** используется `--compare-with`

#### Scenario: report shape 2.0.0
- **WHEN** analyze-diff успешно сравнивает две спеки
- **THEN** отчёт содержит `semantic.changes` и `structural.miracles` (не плоский `report.miracles` как в pre-2.0.0)

#### Scenario: analyze.ignore filters changes
- **WHEN** в конфиге задан `analyze.ignore`
- **THEN** matching semantic changes исключаются, stats отражают ignored

#### Scenario: metadata hash algorithm
- **WHEN** пишется `metadata.baseHash` / `targetHash`
- **THEN** используется **MD5** сериализованной спеки (`createSpecHash` в `analyzeDiff.ts`) — несмотря на упоминание SHA-256 в CHANGELOG beta.9

---

### 3.3 `history-generate`

#### Requirement: useHistory применяет diff report к Client

При `useHistory === true` генератор ДОЛЖЕН загрузить report (`diffReport` / `analyze.reportPath` / default path), и если report валиден и не stale — применить annotations через `applyDiffReportToClient` до записи артефактов.

`loadDiffReport` ДОЛЖЕН принимать:
- unified **2.0.0** (extract `structural`);
- semantic **1.1.0** (adapt via `adaptSemanticToStructural`);
- legacy flat (`diff.all` / `miracles`).

#### Scenario: missing report warns
- **WHEN** `useHistory` включён, а report отсутствует
- **THEN** генерация продолжается с warn (`USE_HISTORY_NO_REPORT`), без history-annotations

#### Scenario: stale report warns and skips
- **WHEN** mtime report старше mtime спеки
- **THEN** эмитируется warn (`STALE`), report не применяется (`null`)

#### Scenario: 1.1.0 semantic report still works
- **WHEN** передан legacy semantic report 1.1.0 и `useHistory`
- **THEN** он адаптируется и может применить miracles/diff (fix beta.9)

---

### 3.4 `models-mode-classes` ⚠ PROBLEM AREA

#### Requirement (as-built): classes пишут один models.ts

При `modelsMode === "classes"` генератор ДОЛЖЕН записать все definition-модели в один файл `{outputModels}/models.ts` через шаблон `exportModels.hbs` (Raw interfaces/types, Dto classes, convenience aliases). Цикл per-`model.path` НЕ ДОЛЖЕН выполняться.

#### Scenario: classes → models.ts
- **WHEN** `modelsMode: "classes"`
- **THEN** существует `{outputModels}/models.ts`, и нет обязательных per-schema `{path}.ts` для DTO/Raw

#### Scenario: interfaces → per-file
- **WHEN** `modelsMode: "interfaces"` (default)
- **THEN** каждая модель с `path` пишется в `{outputModels}/{path}.ts`

#### Requirement (expected / desired — НЕ реализовано): per-model files for classes

При `modelsMode === "classes"` генератор ДОЛЖЕН сохранять ту же файловую топологию, что и `interfaces`: один файл на `model.path`, содержащий `*Raw` и `*Dto` для этой схемы. Barrel/`index` и service imports ДОЛЖНЫ ссылаться на per-path модули, а не на единый `models.ts`.

#### Scenario: classes сохраняет path layout ⚠ FAIL vs expectation
- **WHEN** спека содержит схемы `User` и `Profile` с путями `schemas/User`, `schemas/Profile`, и `modelsMode: "classes"`
- **THEN (ожидание)** файлы вроде `schemas/User.ts` и `schemas/Profile.ts` (каждый с Raw+Dto)
- **THEN (факт HEAD)** только `models/models.ts` со всеми типами

#### Requirement: ReuseStore не используется в classes; entity cache fallback

При `modelsMode === "classes"` генератор НЕ ДОЛЖЕН писать models через ReuseStore. При `cacheStrategy: "reuse"` ДОЛЖЕН fallback на entity cache, предупредить пользователя, и (с beta.13) **персистить** entity cache (`needsEntityCacheFallback`).

#### Scenario: reuse disabled warn + entity persist
- **WHEN** multi-item generate с `cacheStrategy: reuse` и хотя бы один item `modelsMode=classes`
- **THEN** логируется warn о disabled ReuseStore; GenerationCache для classes-item создаётся и сохраняется

---

### 3.5 `dto-core-helpers`

#### Requirement: BaseDto и dtoUtils при classes

При `modelsMode=classes` и генерации core генератор ДОЛЖЕН эмитить `BaseDto.ts` и `dtoUtils.ts` в `outputCore` (или inline в models при `excludeCoreServiceFiles`). Dto-классы ДОЛЖНЫ наследовать `BaseDto<Raw>` и использовать `fromArray` для массивов DTO.

---

### 3.6 `miracles-dto-getters`

#### Requirement: confirmed RENAME → deprecated getter

При наличии miracle RENAME со `status: confirmed` или `confidence === 1` и `modelsMode=classes`, `prepareDtoModels` ДОЛЖЕН добавить deprecated getter со старым именем на DTO-класс (`@miracle:` JSDoc).

#### Scenario: auto-generated RENAME без confirm
- **WHEN** miracle RENAME имеет `status: auto-generated` и `confidence < 1`
- **THEN** deprecated getter НЕ создаётся

#### Scenario: getters only in classes mode
- **WHEN** `modelsMode: interfaces` и confirmed RENAME miracle
- **THEN** deprecated DTO getter НЕ эмитируется (возможны ghost/`@info` в interfaces)

---

### 3.7 `validation-coercion`

#### Requirement: type change → coerce в validation templates

При `useHistory` и type-change entries / TYPE_COERCION miracles генератор ДОЛЖЕН пометить свойства `needsCoercion` и эмитить coerce-логику в выбранной `validationLibrary`.

| Library | Поведение при `needsCoercion` |
|---------|-------------------------------|
| Zod | `z.coerce.*` |
| Joi | `Joi.alternatives().try(...)` |
| Yup | `.transform(...)` для string/number/integer; **boolean — gap** |
| AJV | `coerceTypes: true` при `model.hasCoercion` |

#### Scenario: no history → no coerce from type change alone
- **WHEN** тип в спеке изменился, но `useHistory` выключен
- **THEN** coercion metadata из diff НЕ применяется

#### Scenario: Yup boolean coercion ⚠ KNOWN GAP
- **WHEN** `validationLibrary: yup` и property `needsCoercion` к boolean
- **THEN (факт)** эмитится `yup.boolean()` **без** coerce/transform
- **THEN (ожидание паритета)** string→boolean coerce как у Zod/Joi

---

### 3.8 `ghost-api-surface` (beta.9+)

#### Requirement: removed API surface → ghosts

При применении structural diff с `action: removed` генератор ДОЛЖЕН:

- для свойств моделей — добавлять `ghostProperties` (`type: unknown`, deprecated);
- для операций — создавать ghost operations (`deprecated`, `isGhost`, path params).

#### Scenario: removed property → ghost on DTO/interface
- **WHEN** property removed в diff и `useHistory`
- **THEN** в шаблоне модели присутствует ghost property с `@deprecated Removed from API`

#### Scenario: removed operation → ghost method
- **WHEN** operation removed в diff и `useHistory`
- **THEN** сервис содержит ghost operation с path params

---

### 3.9 `resolve-classes-mode-types` (beta.9+)

#### Requirement: service types map to bundle export names

При `modelsMode=classes` после `prepareDtoModels` генератор ДОЛЖЕН вызвать `resolveClassesModeTypes`, чтобы импорты/типы сервисов ссылались на `exportName` (включая `$2` aliases), согласованные с `models.ts`.

#### Scenario: duplicate schema import rewrite
- **WHEN** две схемы с коллизией имени и classes mode
- **THEN** service import использует `IFoo$2` (не старый path-based name)

---

### 3.10 `duplicate-model-aliases` (beta.9+)

#### Requirement: collision naming `$2`, `$3`

При коллизии имён схем генератор ДОЛЖЕН сохранять первое имя без суффикса и нумеровать последующие `$2`, `$3`, … (`assignDuplicateAliases`).

#### Scenario: DTO names follow aliases
- **WHEN** дубликат `Ingredient` в classes mode
- **THEN** второй получает `IIngredient$2Raw` / `IIngredient$2Dto`

---

### 3.11 `analyze-usage-cli` ⚠ INTEGRATION BUG

#### Requirement (intended): --diff-report validates RENAME miracles

`analyze-usage --diff-report <path>` ДОЛЖЕН загрузить diff report и через `checkRenameMiracles` предупреждать, если потребители всё ещё импортируют старые символы.

#### Scenario: diff-report loads ⚠ FAIL at HEAD
- **WHEN** передан валидный `--diff-report` с RENAME miracles
- **THEN (ожидание)** report загружается, rename warnings возможны
- **THEN (факт)** `loadDiffReport` вызывается **без** `useHistory: true` → всегда `null` → post-check не выполняется

---

## 4. Проблемные места решения

Приоритет: P0 блокирует ожидаемый DX; P1 ломает связанные фичи; P2 — незавершённый дизайн / долг.

### P0 — DTO models в одном файле (главная претензия) — **актуально на HEAD**

**Симптом:** при `modelsMode=classes` все модели оказываются в `{outputModels}/models.ts`.

**Ожидание:** под каждую модель свой файл — как при `modelsMode=interfaces` без DTO-прослойки (тот же `model.path` из парсера).

**Корень:** hard-coded early-return в `writeClientModels.ts:75–91`; шаблон `exportModels.hbs`; сервисы импортируют из `.../models`; index-шаблоны реэкспортируют `./models`.

**Почему это «проблема», даже если в CHANGELOG так написано:**

1. DTO — ортогональное измерение к layout (форма vs файловая структура).
2. `model.path` уже вычисляется парсером и используется в interfaces — classes его отбрасывает.
3. Ломает code review / ownership / partial re-generation.
4. Блокирует ReuseStore и ухудшает совместимость с Marauder reuse/auto-group.
5. Нет opt-out флага (`models.layout: "per-file" | "bundle"`).
6. **С beta.1 до beta.13 layout не эволюционировал** — правились только imports/aliases внутри бандла (beta.9).

**Направление фикса:**

1. В `writeClientModels` для classes: цикл по `models` → Raw+Dto+alias в `{path}.ts`.
2. Обновить `exportService.hbs`, `indexModels.hbs`, `indexFull.hbs`, `resolveClassesModeTypes`.
3. Включить ReuseStore для classes.
4. Breaking migration для импортов из `models.ts`.

---

### P1 — `analyze-usage --diff-report` молча не работает (**новое**)

**Где:** `src/cli/analyzeUsage/analyzeUsage.ts:55–60` вызывает `loadDiffReport` без `useHistory: true`; gate в `loadDiffReport.ts` возвращает `null`.

**Следствие:** заявленный beta.11 rename post-check — no-op в CLI.

**Фикс:** передать `useHistory: true` или разделить loader на generate vs validate modes.

---

### P1 — `miracles` config мёртвый

Поля `miracles.enabled`, `confidence`, `types` есть в schema/`init`, но фильтрация в `applyDiffReportToClient` захардкожена. Root→items наследование `miracles` отсутствует в `normalizeOptions`.

**Уточнение vs старый PDD:** блок `analyze.ignore` — **не** мёртвый (читается analyze-diff). Мёртвы именно `miracles.*` и `analyze.failOnBreaking`.

---

### P1 — Reuse / cache асимметрия (уточнено beta.13)

`modelsMode=classes` ⇒ ReuseStore off. С beta.13 entity cache при `reuse`+`classes` **персистится** (`needsEntityCacheFallback`) — лучше, чем «полный skip cache», но class-mode всё ещё second-class для monorepo dedup.

---

### P1 — Dual placement BaseDto/dtoUtils

`core/` vs inline `models/` при `excludeCoreServiceFiles` — хрупкие relative paths. Нет E2E на classes+inline.

---

### P1 — Duplicate `$2` aliases как breaking surface (уточнено)

`assignDuplicateAliases` (beta.9) меняет имена импортов при коллизиях; в bundle менее заметно, чем в per-file. См. MIGRATION checklist.

---

### P2 — Schema-only опции models

`models.corePath` / `models.modelsPath` — нет runtime readers; только `models.mode`.

---

### P2 — Coercion: узкий DTO + Yup boolean gap (**уточнено**)

- Dto constructor: только number/boolean.
- Yup: нет coerce-ветки для boolean (`yupSchemaGeneric.hbs`).
- Без history type-change coercion не включается.

---

### P2 — Stale/missing diff UX (**частично улучшено**)

С beta.9 — явный **warn** при stale/missing. Остаётся gap: нет fail-closed opt-in (`analyze.failOnBreaking` schema-only).

---

### P2 — MD5 vs CHANGELOG SHA-256 (**новое**)

- Diff report metadata hashes: код **MD5**; CHANGELOG beta.9 пишет SHA-256.
- GenerationCache / ReuseStore: MD5 с beta.13 (upgrade invalidation).

---

### P2 — Нет committed example с `modelsMode: classes`

`example/openapi.config.json` и marauder-конфиг не демонстрируют classes; только init template, docs one-liner и `test/index.test.ts`.

---

## 5. tasks.md (suggested follow-up)

### A. Layout (P0)

- [ ] **A.1** Product decision: `classes` layout = `per-file` | `bundle` | configurable `models.layout`
- [ ] **A.2** Per-model write path в `writeClientModels` для `CLASSES`
- [ ] **A.3** Адаптировать templates + `resolveClassesModeTypes`
- [ ] **A.4** ReuseStore для classes
- [ ] **A.5** Тесты + MIGRATION breaking note

### B. History / miracles correctness

- [ ] **B.1** Fix `analyze-usage` → `loadDiffReport({ useHistory: true, ... })`
- [ ] **B.2** Runtime чтение `miracles.*` из конфига
- [ ] **B.3** Fail-closed opt-in для stale/missing report
- [ ] **B.4** Yup boolean `needsCoercion` branch
- [ ] **B.5** Выровнять CHANGELOG (MD5) или сменить hash на SHA-256

### C. DX / docs

- [ ] **C.1** Example config с `modelsMode: classes`
- [ ] **C.2** E2E `excludeCoreServiceFiles` + classes
- [ ] **C.3** Документировать `analyze.ignore` vs dead `miracles.*`

---

## 6. Поверхности CLI / config (сводка HEAD)

| Фича | CLI | Config | Runtime? |
|------|-----|--------|----------|
| Models mode | `--modelsMode` | `modelsMode` / `models.mode` | ✅ |
| models paths | — | `models.corePath` / `modelsPath` | ❌ schema-only |
| History | `--useHistory`, `--diffReport` | `analyze.useHistory` / `reportPath` | ✅ |
| analyze.ignore | — | `analyze.ignore[]` | ✅ (analyze-diff) |
| analyze.failOnBreaking | — | `analyze.failOnBreaking` | ❌ |
| Diff analysis | `analyze-diff` | default `.openapi-codegen-reports/…` | ✅ |
| Usage analysis | `analyze-usage --diff-report` | — | ⚠ flag есть, load broken |
| Blob | via `--httpClient` | `httpClient` | ✅ |
| Miracles filter | via report JSON | `miracles.*` block | ❌ config; ✅ report |
| Coercion | `--useHistory` + `--validationLibrary` | + report | ✅ (Yup bool gap) |
| Schema version | `update-config` | `UNIFIED_OPTIONS_v6` | ✅ |

### Ключевые точки кода

| Роль | Путь | Since |
|------|------|-------|
| CLI flags | `src/cli/index.ts` | beta.1+ |
| Orchestration | `src/core/OpenApiClient.ts` | beta.1+ |
| Layout fork | `src/core/utils/writeClientModels.ts:75–91` | beta.1 |
| DTO prep | `src/core/utils/prepareDtoModels.ts` | beta.1 |
| Type rewrite | `src/core/utils/resolveClassesModeTypes.ts` | **beta.9** |
| Duplicate aliases | `src/core/utils/modelHelpers.ts` (`assignDuplicateAliases`) | **beta.9** |
| Bundle template | `src/templates/client/exportModels.hbs` | beta.1 |
| Core helpers | `src/core/utils/writeClientCore.ts` | beta.1 |
| Diff apply | `src/core/utils/applyDiffReportToClient.ts` | beta.1; ghosts beta.9 |
| Diff load | `src/core/utils/loadDiffReport.ts` | beta.1; 2.0.0 adapters beta.9 |
| Miracles build | `src/core/utils/buildMiraclesFromSemanticChanges.ts` | **beta.9** |
| analyze-usage bug | `src/cli/analyzeUsage/analyzeUsage.ts:55–60` | beta.11 |

### Тесты, фиксирующие контракт

| Test | Что лочит |
|------|-----------|
| `writeClientModels.test.ts` | classes → single `models.ts` |
| `prepareDtoModels.test.ts` | Raw/Dto, getters, `$2`, coercion |
| `resolveClassesModeTypes.test.ts` | import rewrite |
| `applyDiffReportToClient.test.ts` | coercion/ghosts from miracles |
| `test/index.test.ts` | E2E classes → `models/models.ts` + `core/BaseDto.ts` |

---

## 7. Вердикт

**2.1.0-beta.1** заложил history/diff, Blob, miracles и DTO-классы. К **2.1.0-beta.13** pipeline существенно окреп (unified report 2.0.0, `resolveClassesModeTypes`, ghosts, stale warns, entity-cache fallback), но **файловая топология classes mode не изменилась**: всё ещё один `models.ts`.

Главный продуктовый дефект с точки зрения ожиданий остаётся: **DTO-прослойка меняет не только форму модели, но и layout**. Ожидание — один файл на модель по `model.path`, как без DTO.

Новые находки аудита HEAD, которых не было в первой версии PDD:

1. `analyze-usage --diff-report` — мёртвая интеграция (`useHistory` gate).
2. Yup boolean coercion gap.
3. MD5 vs CHANGELOG SHA-256.
4. `resolveClassesModeTypes` / `$2` aliases — beta.9, не beta.1.
5. `analyze.ignore` wired; `miracles.*` / `analyze.failOnBreaking` — schema-only.

Рекомендуемые OpenSpec changes: `classes-mode-per-file-layout` (§5.A), `fix-analyze-usage-diff-report` (§5.B.1).
)
