## Why

Механизм кэширования и переиспользования spec-артефактов (`ReuseStore`, `GenerationCache`,
`ArtifactFingerprinter`) содержит три критических бага (P0), при которых данные либо теряются,
либо кэш молча возвращает повреждённый результат. Дополнительно — пять high-приоритетных
проблем (P1), вызывающих silent wrong behavior: неатомарная запись, некорректный индекс,
отсутствие file lock. Совокупно они делают `cacheStrategy: reuse`nenадёжным в production и
тормозят внедрение в monorepo-сценариях.

## What Changes

- **P0.1** `OpenApiClient`: добавить `generationCache.save()` при `needsEntityCacheFallback`
  (`reuse + modelsMode: classes`) — entity-кэш сейчас in-memory only, не персистентен
- **P0.2** `ReuseStore.readArtifactIfIntegrityOk`: всегда проверять `contentHash`,
  независимо от `byteSize` — текущий код пропускает hash-проверку для любого непустого файла
- **P0.3** `GenerationCache.load()`: обернуть `JSON.parse` в try/catch — битый JSON файл
  сейчас роняет всю генерацию вместо silent-reset кэша
- **P1.1** `nameKindIndex` → поддержать несколько entries на `name|kind`
  (`Map<string, ManifestArtifact[]>`) для корректного `reuseOnConflict: namespace`
- **P1.2** `ReuseStore.save()`: атомарная запись через temp file + rename
- **P1.3** `ReuseStore.load()`: при bad/v1 manifest — сканировать `artifacts/` и удалять orphan-файлы
- **P1.4** File lock для `ReuseStore` / `GenerationCache` (через `proper-lockfile`)
- **P2.1** Расширить `SCHEMA_HASH_KEYS` в `ArtifactFingerprinter` (добавить `minimum`, `maximum`,
  `pattern`, `const`, `default`, `discriminator`, `minLength`, `maxLength`, `minItems`, `maxItems`)
- **P2.2** `normalizeSchemaNode`: добавить `visited: Set<schema>` против циклических `$ref`
- **P2.3** `stableStringify`: сортировать массивы `required` и `enum`
- **P2.4** `buildOptionsSlice`: включить конфигурацию плагинов в hash
- **P2.5** `ReuseStore.gc()`: синхронизировать `specItems[].artifactKeys`
- **P2.9** Удалить мёртвый `SharedFolderWriter.write()` или реализовать и использовать
- **P2.10** Удалить или починить `detectCrossSpecDrift` (сейчас dead code)
- **P2.11** `runPreAnalyze`: передавать `items` в `runCrossSpecAnalysis`
- **P3.1–P3.6** Мелкий технический долг: мёртвые типы, hint-тексты, хрупкие паттерны

## Capabilities

### New Capabilities

- `generation-cache-resilience`: надёжный `GenerationCache` — try/catch при load, корректный
  save при entity-fallback в reuse-режиме, GC мёртвых ключей
- `reuse-store-integrity`: надёжный `ReuseStore` — атомарная запись, contentHash-верификация,
  multi-entry `nameKindIndex`, orphan GC при bad manifest, file lock
- `artifact-fingerprint-correctness`: корректные fingerprints — полный whitelist schema hash
  keys, защита от циклических `$ref`, сортировка массивов, конфигурация плагинов в hash

### Modified Capabilities

- `reuse-auto-group-core`: P2.9 (удалить мёртвый `SharedFolderWriter.write()`), P2.14
  (canonical path в `__shared__` включает hash при конфликтах namespace)
- `pre-analyze-core`: P2.10 (починить/удалить `detectCrossSpecDrift`), P2.11
  (`detectSharedOutputCollisionRisk` получает реальный список items)

## Impact

- **Файлы ядра:** `src/core/utils/GenerationCache.ts`, `src/core/reuseStore/ReuseStore.ts`,
  `src/core/reuseStore/ArtifactFingerprinter.ts`, `src/core/OpenApiClient.ts`
- **Вспомогательные:** `src/core/reuseStore/reuseWriterHelpers.ts`,
  `src/core/reuseStore/SharedFolderWriter.ts`, `src/core/specAnalysis/runPreAnalyze.ts`,
  `src/core/specAnalysis/CrossSpecAnalyzer.ts`
- **Зависимость:** добавление `proper-lockfile` (или аналога) для P1.4
- **Обратная совместимость:** все изменения backward-compatible; `reuseOnConflict: namespace`
  начнёт работать корректно (ранее давал неверный existing-hint)
- **Тесты:** нужны новые unit-тесты для LCA edge-cases, cyclic `$ref`, namespace mode,
  contentHash integrity (P3.10)
