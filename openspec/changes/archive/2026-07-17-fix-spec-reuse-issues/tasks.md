## 1. P0 — Критические баги (исправить первыми)

- [x] 1.1 `OpenApiClient.ts`: добавить `generationCache.save()` при `needsEntityCacheFallback` — изменить условие persist-save с `cacheStrategy === 'entity'` на `cacheStrategy === 'entity' || needsEntityCacheFallback`
- [x] 1.2 `ReuseStore.ts`: убрать ранний return в `readArtifactIfIntegrityOk` при `byteSize > 0` — всегда проверять `contentHash`
- [x] 1.3 `GenerationCache.ts`: обернуть `readFile + JSON.parse + version check` в try/catch в методе `load()`, при ошибке логировать warn и возвращать пустой кэш

## 2. P1 — Высокий приоритет

- [x] 2.1 `ReuseStore.ts`: изменить тип `nameKindIndex` с `Record<string, ManifestArtifact>` на `Record<string, ManifestArtifact[]>`
- [x] 2.2 `ReuseStore.ts`: реализовать атомарный `save()` — write в `manifest.json.tmp`, затем `fs.rename`
- [x] 2.3 `ReuseStore.ts`: в `load()` при bad/v1 манифесте — сканировать `{cachePath}/artifacts/**/*.ts`, удалить все файлы (orphan cleanup)

## 3. P2 — ArtifactFingerprinter correctness

- [x] 3.1 `ArtifactFingerprinter.ts`: расширить `SCHEMA_HASH_KEYS`
- [x] 3.2 `ArtifactFingerprinter.ts`: добавить `visited: Set<object>` в `normalizeSchemaNode`
- [x] 3.3 `ArtifactFingerprinter.ts`: сортировать значения массивов `required` и `enum`
- [x] 3.4 `ArtifactFingerprinter.ts`: в `buildOptionsSlice` добавить конфигурацию плагинов в hash

## 4. P2 — ReuseStore / CrossSpec fixes

- [x] 4.1 `ReuseStore.ts`: в `gc()` после удаления unreferenced artifacts — синхронизировать `specItems[].artifactKeys`
- [x] 4.2 `CrossSpecAnalyzer.ts`: удалить метод `detectCrossSpecDrift` и его вызов из `run()`
- [x] 4.3 `runPreAnalyze.ts`: передавать реальный `items` в `runCrossSpecAnalysis(manifest, items)` вместо пустого `[]`

## 5. P2 — GenerationCache GC

- [x] 5.1 `GenerationCache.ts`: реализовать GC — после генерации batch удалять из `entries` ключи, которые не были обращены в текущем запуске

## 6. P2.9 — SharedFolderWriter dead API

- [x] 6.1 `SharedFolderWriter.ts`: удалить метод `write()`, добавить комментарий о роли класса как lca-holder

## 7. P3 — Tech debt

- [x] 7.1 `types.ts`: убрать `'core'` из `ArtifactKind` union type
- [x] 7.2 `types.ts`: убрать поле `kind` из `ManifestReference`
- [x] 7.3 `types.ts` / `ReuseConflictError`: исправить hint-текст — заменить `"Model"` на фактический `entry.kind`
- [x] 7.4 `ReuseStore.ts`: `getManifest()` — изменить возвращаемый тип на `Readonly<ReuseStoreManifest>`- [x] 7.5 `reuseHelpers.ts`: заменить `replace(/^[IET]/, '')` на явный lookup-список
- [x] 7.6 `OpenApiClient.ts`: обновить или удалить `validateConsistentCacheSettings`

## 8. Тесты

- [x] 8.1 Добавить unit-тест: `GenerationCache.load()` с битым JSON → пустой кэш, warn
- [x] 8.2 Добавить unit-тест: `ReuseStore.readArtifactIfIntegrityOk` — файл с тем же byteSize, но изменённым содержимым → null
- [x] 8.3 Добавить unit-тест: `ArtifactFingerprinter.hashSchema` — циклическая схема не роняет
- [x] 8.4 Добавить unit-тест: `hashSchema` — `required: ['b', 'a']` === `required: ['a', 'b']`
- [x] 8.5 Добавить unit-тест: `nameKindIndex` при двух namespace-артефактах с одним именем
- [x] 8.6 Добавить unit-тест: `OutputGroupResolver` LCA edge-cases (один путь, trivial LCA, cross-root)
- [x] 8.7 Добавить unit-тест: `computeStoreRelativeImport` для вложенных stub-путей
