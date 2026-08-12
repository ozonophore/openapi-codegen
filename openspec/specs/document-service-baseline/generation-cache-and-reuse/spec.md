## Purpose

Umbrella spec для cache strategies, ReuseStore orchestration и GenerationCache entity-fallback.

**Related delta specs:** `artifact-fingerprint-correctness`, `reuse-auto-group-core`, `reuse-shared-core`, `reuse-namespace-paths`.

## Requirements

### Requirement: Три cache strategies
Поддерживаемые strategies: `content` (write-if-changed only), `entity` (per-output fingerprint cache), `reuse` (cross-spec artifact store). Strategy MUST быть consistent across all items в одном run.

#### Scenario: Content strategy
- **WHEN** cache=true и cacheStrategy=content
- **THEN** entity cache не загружается, только writeFileIfChanged оптимизация

#### Scenario: Entity cache hit
- **WHEN** cacheStrategy=entity, fingerprint совпадает и все cached files exist on disk
- **THEN** generateSingle skip write, register cached paths as outputs

#### Scenario: Entity cache miss on missing file
- **WHEN** cache entry exists но файл на диске удалён
- **THEN** cache miss, полная регенерация item

---

### Requirement: Reuse store conflict detection
Reuse lookup MUST возвращать conflict когда name+kind совпадает но schema hash отличается от существующего artifact. Schema hash MUST вычисляться по правилам `artifact-fingerprint-correctness`.

#### Scenario: Same name different schema
- **WHEN** два specs генерируют model User с разным schema hash
- **THEN** lookup status=conflict; поведение определяется reuseOnConflict policy

---

### Requirement: reuseOnConflict policies
При conflict MUST поддерживаться `fail` (throw ReuseConflictError) и `namespace` (disambiguate by spec namespace — см. `reuse-namespace-paths`).

#### Scenario: fail policy
- **WHEN** reuseOnConflict=fail и conflict detected
- **THEN** generation прерывается; early generation report записывается с conflict record (до Reuse GC/save, без требования полных phase timings)

---

### Requirement: Final Generation report after Reuse GC and save
Когда `ReuseStore` активен в batch run, финальная запись Generation report MUST происходить **после** `reuseStore.gc` и (если dirty) `reuseStore.save`. При `cacheDebug` поле `phases` MUST отражать измеренные `manifestLoadMs`, `manifestSaveMs` и `gcMs` финального прохода (не нули из-за записи report до GC).

#### Scenario: cacheDebug phases include gc and save
- **WHEN** cacheStrategy=reuse, cacheDebug=true, run завершается успешно с активным ReuseStore
- **THEN** generation report на диске содержит `phases.gcMs` и `phases.manifestSaveMs`, соответствующие выполненным GC/save (save может быть 0 только если store не dirty)

#### Scenario: Early conflict dump still allowed before GC
- **WHEN** mid-batch возникает `ReuseConflictError` и политика требует записать report с conflict record
- **THEN** early generation report MAY быть записан до GC/save; такой dump MUST NOT требовать финальных phase timings

---

### Requirement: Classes bundle disables reuse store
При modelsMode=classes и layout=bundle reuse store MUST быть disabled для item; MUST fallback на entity cache если cache enabled.

#### Scenario: Classes bundle item
- **WHEN** cacheStrategy=reuse и item classes+bundle
- **THEN** warning о fallback, item использует entity cache not reuse store

#### Scenario: classes per-file uses ReuseStore not entity-only
- **WHEN** cacheStrategy=reuse, modelsMode=classes, models.layout=per-file
- **THEN** models идут через ReuseStore; entity-fallback-only путь для этого item не активируется как единственная стратегия models

---

### Requirement: auto-group requires reuse cache
reuseMode=auto-group MUST активировать SharedFolderWriter только когда cacheStrategy=reuse; иначе warning AUTO_GROUP_REQUIRES_REUSE_CACHE. Детали LCA/stubs — см. `reuse-auto-group-core`.

#### Scenario: auto-group without reuse
- **WHEN** reuseMode=auto-group и cacheStrategy=entity
- **THEN** warning logged, shared folder writer не создаётся

---

### Requirement: Reuse store GC после run
После всех items reuse store MUST gc unreferenced artifacts и save manifest если dirty.

#### Scenario: Orphan artifact
- **WHEN** artifact key не в referencedArtifactKeys set текущего run
- **THEN** gc удаляет orphan files и manifest entries

---

### Requirement: Corrupted manifest recovery
При load reuse store если manifest JSON corrupted или version mismatch, MUST clean orphan artifacts и начать с empty manifest.

#### Scenario: Invalid manifest.json
- **WHEN** manifest.json parse fails или version < 2
- **THEN** store treats as empty, orphan cleanup runs

#### Scenario: Missing manifest on first run
- **WHEN** manifest.json не существует
- **THEN** load завершается без orphan scan, store пустой

---

### Requirement: Shared output warnings
Без cache enabled duplicate output paths across items MUST trigger warning; с reuse cache — additional warning для shared core/services paths (core sharing — см. `reuse-shared-core`).

#### Scenario: Duplicate output without cache
- **WHEN** два items same resolved output и cache=false
- **THEN** CACHE_SHARED_OUTPUT_WARNING logged

---

### Requirement: GenerationCache.load() устойчив к повреждённому JSON
GenerationCache MUST перехватывать ошибки чтения/parse cache-файла, логировать warning и продолжать с пустым кэшем.

#### Scenario: Corrupt cache file
- **WHEN** `.openapi-codegen-cache.json` содержит невалидный JSON
- **THEN** load логирует warn, кэш пустой, генерация не прерывается

#### Scenario: Missing cache file
- **WHEN** файл кэша не существует
- **THEN** load завершается без ошибки

---

### Requirement: GenerationCache сохраняется при entity-fallback в reuse-режиме
При cacheStrategy=reuse и classes+bundle layout GenerationCache MUST persist на диск после run (не in-memory only).

#### Scenario: Entity-fallback cache persists
- **WHEN** cacheStrategy=reuse, modelsMode=classes, layout bundle, первый run
- **THEN** `.openapi-codegen-cache.json` создаётся в output root

#### Scenario: Repeat run cache hit
- **WHEN** spec и fingerprint не изменились после entity-fallback run
- **THEN** GenerationCache hit, генерация item пропускается

---

### Requirement: GenerationCache GC устаревших ключей
GenerationCache MUST удалять записи для ключей, не использованных в текущем batch.

#### Scenario: Removed spec from config
- **WHEN** spec удалена из items[] между runs
- **THEN** её cache entry отсутствует после save

---

### Requirement: ReuseStore contentHash integrity check
ReuseStore MUST проверять contentHash при integrity check; проверка только по byteSize НЕ ДОПУСКАЕТСЯ.

#### Scenario: Same size different content
- **WHEN** byteSize совпадает но contentHash отличается
- **THEN** artifact rejected, regenerated

---

### Requirement: ReuseStore atomic manifest save
ReuseStore.save() MUST записывать manifest через temp file + atomic rename.

#### Scenario: Interrupted save
- **WHEN** процесс завершается во время save
- **THEN** manifest.json остаётся валидным (предыдущая или новая версия)

---

### Requirement: nameKindIndex multi-artifact per name|kind
nameKindIndex MUST хранить массив артефактов на ключ name|kind для корректного conflict detection при namespace policy.

#### Scenario: Two namespace artifacts same name
- **WHEN** reuseOnConflict=namespace и два UserDto с разными schema hash
- **THEN** оба присутствуют в nameKindIndex

---

### Requirement: ReuseStore.gc() sync specItems
После gc ReuseStore MUST удалить мёртвые artifactKeys из specItems[].

#### Scenario: GC removed artifact
- **WHEN** artifact удалён gc как unreferenced
- **THEN** его ключ отсутствует в specItems любого item
