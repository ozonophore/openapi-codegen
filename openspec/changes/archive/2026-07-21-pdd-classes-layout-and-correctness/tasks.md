## 1. Config & types (layout + miracles inheritance)

- [x] 1.1 Добавить `models.layout: "bundle" | "per-file"` в UNIFIED_OPTIONS_v6 / Zod schema / types (`TRawOptions`), default при normalize = `bundle`
- [x] 1.2 Пробросить flat alias `modelsLayout` и CLI `--modelsLayout` (если есть паттерн как у `--modelsMode`); наследовать layout root→items
- [x] 1.3 Наследовать блок `miracles` root→items в `normalizeOptions`
- [x] 1.4 Unit-тесты normalizeOptions: default layout, explicit per-file, miracles inheritance

## 2. Classes layout write-path (P0)

- [x] 2.1 Вынести per-model Raw+Dto+alias template (partial) из `exportModels.hbs` для переиспользования bundle/per-file
- [x] 2.2 В `writeClientModels`: ветка `classes` + `per-file` — цикл по `model.path` (как interfaces); `bundle` — сохранить early-return `models.ts`
- [x] 2.3 Обновить `resolveClassesModeTypes` для dual-mode (bundle module vs per-path imports)
- [x] 2.4 Обновить `exportService.hbs`, `indexModels.hbs` / `indexFull.hbs` под layout
- [x] 2.5 Gate ReuseStore: enable при classes+per-file; entity-fallback только classes+bundle
- [x] 2.6 Тесты: bundle regression (`models.ts`); per-file два path-файла; service imports; `$2` alias в path-файле
- [x] 2.7 E2E smoke: classes+bundle и classes+per-file

## 3. analyze-usage diff-report (P1)

- [x] 3.1 В `analyzeUsage.ts` передавать `useHistory: true` (или validate-mode) при `--diff-report`
- [x] 3.2 Тест: валидный report → `checkRenameMiracles` вызывается / findings возможны; generate gate без `useHistory` по-прежнему `null`

## 4. Miracles config runtime (P1)

- [x] 4.1 В `applyDiffReportToClient` применить filter `enabled` / `confidence` / `types` поверх HEAD-фильтра (`confirmed | confidence===1`)
- [x] 4.2 Тесты: `enabled: false` → нет RENAME getters; confidence threshold; types allowlist; omitted block = HEAD

## 5. Yup boolean coercion (P2)

- [x] 5.1 Добавить coerce/transform ветку для boolean + `needsCoercion` в Yup template
- [x] 5.2 Тест / snapshot на Yup boolean coercion; без `needsCoercion` — без transform

## 6. Docs & examples

- [x] 6.1 Документировать `models.layout`, рекомендовать `per-file` новым classes-проектам; MIGRATION note bundle→per-file
- [x] 6.2 Example config snippet с `modelsMode: classes` (+ optional layout)
- [x] 6.3 Выровнять CHANGELOG/docs: report hashes = MD5 (не SHA-256); описать живой `miracles.*` vs прежний schema-only
- [x] 6.4 Обновить контрактные тесты/доки, которые утверждают «classes ⇒ только models.ts» как единственный режим

## 7. Post-apply correctness (`research/MODELS_LAYOUT_TEST_REPORT.md`)

- [x] 7.1 Убрать Commander `.default(ModelsMode.INTERFACES)` у `--modelsMode`; убедиться что config `models.mode=classes` применяется при `generate -ocn` без CLI flag
- [x] 7.2 В `writeClientModels` для classes+per-file считать `outputCore` relative от `dirName(model.path)`; тест nested path → корректный import BaseDto
- [x] 7.3 Path-keyed `dtoImports` (`path → raw/dto names`); `buildDtoInit`/`buildDtoToJson`: no `new` for `dtoKind=alias`; dictionary-of-ref map; unit-тесты
- [x] 7.4 Переписать `example/openapi.models.config.json` (classes+bundle) и `example/openapi.models.dto.config.json` (classes+per-file): один `input` `test/spec/v3.json`, разные `output`, без `useHistory`
- [x] 7.5 Regression: generate обоих example-конфигов без `--modelsMode`/`--modelsLayout` CLI overrides; smoke tsc или assert BaseDto + layout artifacts
