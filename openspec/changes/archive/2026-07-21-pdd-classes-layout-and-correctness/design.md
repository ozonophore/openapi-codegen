## Context

PDD reverse-spec (`research/PDD-2.1.0-beta.1.md`) зафиксировал as-built HEAD `2.1.0-beta.13`:

```
prepareDtoModels → resolveClassesModeTypes → writeClientModels
                                                      │
                         modelsMode===classes ────────┤
                                                      ▼
                                         early-return → models.ts ONLY
```

Interfaces-path пишет `{model.path}.ts` и умеет ReuseStore. Classes-path игнорирует `model.path`, бандлит всё через `exportModels.hbs`, сервисы импортируют `./models`. Это intentional с beta.1 (CHANGELOG), но ортогонально DTO-форме и блокирует DX/reuse.

Дополнительно аудит нашёл тихие дефекты: `analyze-usage` вызывает `loadDiffReport` без `useHistory: true` → всегда `null`; `miracles.*` в схеме не читается; Yup boolean без coerce.

**Constraint «без ухудшения»:** любое решение не должно ломать default consumers (`interfaces`, classes+bundle, существующие импорты из `models.ts`) без явного opt-in/миграции.

## Goals / Non-Goals

**Goals:**

1. Развести *форму* модели (interfaces vs classes/DTO) и *топологию* файлов (bundle vs per-file).
2. Сохранить текущий classes-output по умолчанию (`bundle`).
3. Дать opt-in `per-file`, совместимый с path-семантикой interfaces и с ReuseStore.
4. Починить broken `analyze-usage --diff-report` и оживить `miracles.*` без смены default-фильтрации miracles.
5. Закрыть Yup boolean coercion gap.
6. Зафиксировать регрессионные тесты на оба layout.
7. Закрыть post-apply дефекты из `research/MODELS_LAYOUT_TEST_REPORT.md`: CLI override `modelsMode`, nested `outputCore`, path-keyed dtoImports / alias+dictionary init, example A/B configs.

**Non-Goals:**

- Менять default layout на `per-file` в этом change (**BREAKING** — отдельный major/migration change).
- Рефакторить dual placement `BaseDto`/`dtoUtils` (core vs inline).
- Fail-closed stale/missing report (`analyze.failOnBreaking`).
- Расширять DTO constructor coercion за пределы number/boolean.
- Менять алгоритм hash (MD5→SHA-256) без отдельного решения; в этом change — docs alignment.
- Marauder Phase 2 / RequestExecutor.

## Decisions

### D1. `models.layout: "bundle" | "per-file"`, default `bundle`

**Выбор:** новый ключ в nested `models.layout` (+ flat alias `modelsLayout` / CLI `--modelsLayout` при наличии паттерна flat flags). При отсутствии ключа → `bundle` (эквивалент HEAD).

**Почему не сразу per-file default:** потребители и тесты (`writeClientModels.test.ts`, E2E) уже зависят от `models/models.ts`; CHANGELOG/docs описывают bundle. Opt-in = zero regression.

**Альтернативы:**
- A) Сразу сделать per-file default + `layout: bundle` escape — отвергнуто: **BREAKING** без migration window.
- B) Только hard-switch на per-file без флага — отвергнуто: ухудшает существующих.
- C) Отдельный `modelsMode: "classes-per-file"` — отвергнуто: путает форму и layout.

### D2. Per-file write-path переиспользует interfaces loop + DTO template fragment

**Выбор:** при `classes` + `per-file` цикл по `models` как в interfaces (`model.path` → `{path}.ts`), содержимое файла = Raw + Dto + convenience alias для **одной** схемы (вынести из `exportModels.hbs` в per-model template или параметризовать шаблон одним `model`).

`bundle` ветка остаётся early-return на `models.ts` без изменений поведения.

**Cross-model DTO init:** `prepareDtoModels` уже кладёт метаданные на каждую модель; per-file импорты соседних DTO — через relative imports по `model.path` (как interfaces ссылаются друг на друга), не через глобальный бандл.

**Альтернативы:**
- Держать `models.ts` + дополнительно per-file re-exports — отвергнуто: дублирование, хуже DX.
- Генерировать только Dto per-file, Raw в бандле — отвергнуто: усложняет imports без выигрыша.

### D3. `resolveClassesModeTypes` dual-mode

**Выбор:**
- `bundle`: текущая семантика — map path → `exportName`, imports из единого `models` модуля.
- `per-file`: map path → per-file module path (как interfaces); `exportName` / `$2` aliases остаются именами символов внутри файла.

**Почему:** beta.9 rewrite нужен из-за бандла и duplicate aliases; per-file возвращает path-based imports, но aliases `$2` всё ещё обязательны внутри файла.

### D4. ReuseStore только при `per-file`

**Выбор:** `useReuseStore = cacheStrategy===reuse && modelsMode!==classes` **заменить на**  
`useReuseStore = reuse && !(modelsMode===classes && layout===bundle)`.

Entity-fallback + persist (`needsEntityCacheFallback`) — **только** для classes+bundle (текущий контракт `generation-cache-resilience`).

**Почему:** ReuseStore предполагает один artifact на `{path}.ts`; с bundle несовместим. Per-file снимает блокер без ломки bundle-пути.

### D5. Fix analyze-usage: явный load mode, не ломая generate gate

**Выбор:** расширить `loadDiffReport` параметром вроде `purpose: 'generate' | 'validate'` **или** передавать `useHistory: true` из `analyzeUsage` когда задан `--diff-report`.

Предпочтительно **минимальный fix:** `useHistory: true` при наличии `diffReport` в analyze-usage (симптом PDD). Опционально позже: `requireHistoryGate: boolean` default true для generate.

**Не делать:** убирать gate из generate path — это защита от случайной загрузки report.

**Stale check:** для analyze-usage input может отсутствовать; сохранить текущую `isFreshEnough` семантику (если нет inputPath — не stale). Не ужесточать в этом change.

### D6. Miracles config: AND с текущим hard filter, default-совместимо

**Выбор:**
1. Наследовать `miracles` root→items в `normalizeOptions` (как `useHistory`/`modelsMode`).
2. В `applyDiffReportToClient` после существующего фильтра `confirmed | confidence===1` применить:
   - если `miracles.enabled === false` → не применять miracles (diff annotations/ghosts — отдельное решение: **оставить** structural diff apply; только miracles/getters/coercion-from-miracles off);
   - `confidence` threshold: miracle проходит если `confidence >= configured` **или** `status===confirmed` (confirmed не режется threshold — без ухудшения confirmed UX);
   - `types` allowlist: если задан непустой массив — только перечисленные типы.

**Default при отсутствии блока:** поведение = HEAD (confirmed | confidence===1).

**Альтернатива:** заменить hard filter целиком конфигом — отвергнуто: риск ослабить/ужесточить defaults незаметно.

### D7. Yup boolean coerce — зеркало number/string transform

**Выбор:** в `yupSchemaGeneric.hbs` (или аналог) для `needsCoercion` + boolean добавить `.transform` string→boolean (truthy set: `true`/`1`/`yes` — согласовать с Zod/Joi ветками в репо).

**Не трогать** Zod/Joi/AJV (уже ок) и DTO constructor.

### D8. Docs: MD5 truth, example classes

**Выбор:** поправить CHANGELOG/docs на MD5 (код — source of truth). Не менять hash algorithm в этом change (invalidation churn). Добавить example snippet `modelsMode: classes` + `layout`.

### D9. CLI overrides: no Commander default for mergeable mode/layout flags (post-apply fix)

**Проблема (локальный прогон `-ocn`):** `--modelsMode` с `.default(ModelsMode.INTERFACES)` всегда попадает в Zod/`GenerateOptions` как `interfaces`, а `mergeGenerateCliOverrides` пишет любое `!== undefined` поверх конфига → `models.mode: classes` из JSON игнорируется.

**Выбор:** убрать `.default(...)` у Commander для `--modelsMode` (как уже сделано для `--modelsLayout`). Default `interfaces` остаётся в normalizeOptions / `COMMON_DEFAULT_OPTIONS_VALUES`, когда mode не задан ни в конфиге, ни в CLI. Аудит: любые ключи из `GENERATE_CLI_OVERRIDE_KEYS` с Commander `.default(...)` дают тот же баг (например `reportFile` — отдельный follow-up, не блокер layout).

### D10. Per-file `outputCore` relative to model directory

**Проблема:** в template передаётся `outputCore` = relative от корня `outputModels` → `../core`. Файл в `models/path/alias_request/*.ts` требует `../../../core`.

**Выбор:** в `writeClientModels` для classes+per-file вычислять  
`relativeHelper(dirName(model.path), outputCoreFromModelsRoot)` (при пустом dir — оставить as-is). Bundle не менять.

### D11. Path-keyed dtoImports + alias/dictionary DTO init

**Проблема:** `attachDtoImports` мапит по `imprt.name` → при `$2` path-alias импортируется неверный export; `buildDtoInit` делает `new` для alias и не маппит dictionary values.

**Выбор:**
1. `path → {rawName,dtoName,dtoKind}` map; при наличии `imprt.path` lookup по path first.
2. `new`/`fromArray` только при `dtoKind === 'class'`.
3. Dictionary-of-ref: map entries ↔ Dto (зеркало array). Composition (oneOf/anyOf/allOf) — raw passthrough в этом fix.

### D12. Example configs for layout A/B

**Выбор:** пара `example/openapi.models.config.json` (classes+bundle) и `example/openapi.models.dto.config.json` (classes+per-file): один `input` (`test/spec/v3.json`), разные `output`, без `useHistory`, без дублирования лишних осей. Проверка: `generate -ocn` без CLI override flags.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Per-file ломает cross-model relative imports / circular DTO | Следовать существующему interfaces import graph; тесты на связанные схемы |
| Потребители ждут «classes = per-file» без флага | Docs + proposal: default bundle; отдельный breaking change позже |
| ReuseStore + classes per-file edge cases (`$2`, miracles getters) | Unit + reuse integration; fingerprint включает layout |
| `miracles.enabled: false` трактуют как «выключить весь history» | Документировать: только miracles; ghosts/diff annotations остаются |
| analyze-usage stale skip при старом report | Сохранить warn+null; не fail-closed |
| Рост шаблонной сложности (bundle + per-file) | Один shared partial для Raw/Dto body; два entry templates |

## Migration Plan

1. **Ship opt-in:** выпустить `models.layout` с default `bundle` — no migration required.
2. **Docs:** рекомендовать `per-file` новым проектам и тем, кто мигрирует с interfaces→classes.
3. **Consumers на bundle:** без действий; импорты `from '.../models'` валидны.
4. **Переход bundle→per-file:** breaking для import paths; checklist в MIGRATION: заменить barrel `models` на per-path imports (или полагаться на generated index).
5. **Rollback:** удалить/не задавать `layout` / выставить `bundle`.
6. **Future (out of scope):** major bump с default `per-file` + deprecation warning на implicit bundle.

## Open Questions

1. Нужен ли CLI `--modelsLayout` в первой итерации, или достаточно config-only? → **Решено:** CLI `--modelsLayout` добавлен; без Commander default.
2. При `miracles.enabled: false` — отключать ли TYPE_COERCION miracles, влияющие на validation `needsCoercion`? (Рекомендация: да, единообразно все miracle types.)
3. Нужен ли thin compatibility re-export `models.ts` при `per-file` (barrel, реэкспорт всех path)? (Рекомендация: **нет** в v1 — index templates уже дают barrel; отдельный `models.ts` путает с bundle.)
4. Расширять ли DTO init для oneOf/anyOf/allOf в этом change? → **Нет** (raw passthrough); отдельный follow-up.
