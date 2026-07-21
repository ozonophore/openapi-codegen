## MODIFIED Requirements

### Requirement: GenerationCache сохраняется при entity-fallback в reuse-режиме
При `cacheStrategy === 'reuse'` и `modelsMode: 'classes'` **и** layout bundle (явный `models.layout: "bundle"` или layout omitted) (entity-fallback) `GenerationCache` ДОЛЖЕН сохраняться на диск после завершения генерации. Кэш НЕ ДОЛЖЕН быть in-memory only при использовании entity-fallback.

При `cacheStrategy === 'reuse'`, `modelsMode: 'classes'` и `models.layout: "per-file"` генератор MUST использовать ReuseStore для models и MUST НЕ требовать entity-fallback-only путь для этих items.

#### Scenario: entity-fallback кэш персистентен между запусками
- **WHEN** `cacheStrategy: 'reuse'`, `modelsMode: 'classes'`, layout bundle (default), первый запуск генерации
- **THEN** файл `.openapi-codegen-cache.json` создаётся в outputRoot

#### Scenario: повторный запуск использует сохранённый кэш
- **WHEN** spec не изменилась после первого запуска с entity-fallback (classes + bundle)
- **THEN** `GenerationCache` обнаруживает hit, генерация пропускается

#### Scenario: classes per-file uses ReuseStore not entity-only
- **WHEN** `cacheStrategy: 'reuse'`, `modelsMode: 'classes'`, `models.layout: 'per-file'`
- **THEN** models идут через ReuseStore; entity-fallback-only путь для этого item не активируется как единственная стратегия models
