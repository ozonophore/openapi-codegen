## Purpose

Entity skip policy and fingerprint v3 for GenerationCache hits (`entity` and hybrid `reuse`), including Reuse manifest presence guard.

## Requirements

### Requirement: Entity skip module owns fingerprint and skip decision
Система MUST реализовывать entity cache key, entity fingerprint и skip decision в module `generationCache/EntitySkip` (или эквивалентном пути под `generationCache/`). `OpenApiClient` MUST NOT содержать private `getCacheKey` / `getCacheFingerprint` / `resolveEntitySkipForItem` после change. Skip module MUST NOT выполнять `registerOutputFile`.

#### Scenario: Facade uses EntitySkip for warm and generate paths
- **WHEN** session `shouldEntitySkip` callback или `generateSingle` проверяет entity skip
- **THEN** решение MUST вычисляться через EntitySkip (`shouldEntitySkip` / fingerprint builders), а не ad-hoc logic на фасаде

#### Scenario: Write side effect stays in generateSingle
- **WHEN** entity skip hit происходит в `generateSingle`
- **THEN** регистрация cached output paths на WriteClient MUST оставаться в `generateSingle` (или эквивалентном per-item коде), не в EntitySkip

---

### Requirement: Hybrid entity skip eligibility
Entity skip MUST быть eligible, когда `cache` включён и `cacheStrategy` равен `entity` **или** `reuse` (любой `modelsMode` / `modelsLayout`). Система MUST NOT ограничивать reuse skip только classes+bundle layout.

#### Scenario: Plain reuse can entity-skip
- **WHEN** `cacheStrategy=reuse`, layout не classes-bundle, fingerprint совпадает, cached files существуют и Reuse manifest содержит spec item
- **THEN** `shouldEntitySkip` MUST вернуть true

#### Scenario: Entity strategy unchanged
- **WHEN** `cacheStrategy=entity`, fingerprint совпадает и cached files существуют
- **THEN** `shouldEntitySkip` MUST вернуть true (manifest guard не применяется)

---

### Requirement: Reuse manifest presence guard
Когда item использует ReuseStore (`cacheStrategy=reuse` и не classes-bundle) и `reuseStore` передан, `shouldEntitySkip` MUST вернуть false, если `manifest.specItems[specItem]` отсутствует. Skip path MUST NOT хешировать output files; для reuse MUST проверить целостность store-артефактов этого spec item (`contentHash` через ReuseStore).

#### Scenario: Missing manifest entry denies skip
- **WHEN** GenerationCache fingerprint и files совпадают, но spec item нет в Reuse manifest
- **THEN** entity skip MUST NOT применяться

#### Scenario: Present manifest entry allows skip when store artifacts are intact
- **WHEN** fingerprint и files совпадают, `specItems[specItem]` существует, и store-артефакты spec item проходят integrity check
- **THEN** entity skip MAY применяться без хеширования output files

#### Scenario: Corrupt store artifact denies skip
- **WHEN** fingerprint и files совпадают и spec item есть в manifest, но store-артефакт не проходит `contentHash` integrity check
- **THEN** entity skip MUST NOT применяться, чтобы write path мог перегенерировать артефакт

---

### Requirement: Entity fingerprint v3 embeds optionsSliceHash
Entity fingerprint MUST использовать `cacheFingerprintVersion` = 3 и MUST включать `optionsSliceHash`, полученный из `buildOptionsSlice` / `buildOptionsSliceHash`. Residual MUST содержать только options, отсутствующие в `OptionsSlice`, и MUST NOT дублировать `plugins` / `disableBuiltinPlugins` (они покрыты slice). Сериализация MUST использовать `stableStringify` и тот же hash helper, что reuse fingerprints.

#### Scenario: Slice field change invalidates entity fingerprint
- **WHEN** меняется поле из `OptionsSlice` (например `prettierConfigPath` или prefixes)
- **THEN** `optionsSliceHash` меняется и entity fingerprint MUST измениться

#### Scenario: Plugin path/config change invalidates via slice only
- **WHEN** меняется plugin `config` или path entry
- **THEN** entity fingerprint MUST измениться через `pluginsHash` внутри options slice, без отдельного raw `plugins` в residual

#### Scenario: Version bump forces warm miss
- **WHEN** на диске лежит GenerationCache entry, записанный с fingerprint version 2
- **THEN** version 3 fingerprint MUST NOT совпасть → entity skip miss (one-time cold)

---

### Requirement: Shared Spec item name helper
`getSpecItemName` MUST быть единственной реализацией для Generation report / entity skip / preAnalyze / AvatarSwarm (локальные string-split копии MUST быть удалены). Канон: `resolveHelper` + `basename`.

#### Scenario: preAnalyze and skip use same name
- **WHEN** warm skip set строится по `getSpecItemName(item.input)` и preAnalyze фильтрует по тому же имени
- **THEN** оба пути MUST вызывать один shared helper
