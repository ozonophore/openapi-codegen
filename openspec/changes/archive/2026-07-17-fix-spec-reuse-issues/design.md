## Context

Кодовая база содержит три уровня кэширования/переиспользования артефактов: `GenerationCache`
(entity-стратегия), `ReuseStore` (reuse-стратегия), `ArtifactFingerprinter` (ключи для обоих).
Audit-документ `openspec/research/SPEC-REUSE.md` выявил три критических (P0) бага, пять high (P1) и ряд medium (P2)
проблем. Большинство из них — изолированные точечные правки в одном методе, без архитектурных
изменений. Основные модули: `src/core/utils/GenerationCache.ts`,
`src/core/reuseStore/ReuseStore.ts`, `src/core/reuseStore/ArtifactFingerprinter.ts`,
`src/core/OpenApiClient.ts`, `src/core/reuseStore/reuseWriterHelpers.ts`.

## Goals / Non-Goals

**Goals:**
- Исправить все три P0-бага (data loss / silent wrong result)
- Исправить все P1-проблемы (silent wrong behavior)
- Исправить приоритетные P2 (fingerprint correctness, orphan GC)
- Убрать dead code (P2.9, P2.10) и расчистить tech debt (P3)
- Не сломать существующие API и конфиги

**Non-Goals:**
- Переписывать архитектуру кэширования (три механизма остаются как есть)
- Добавлять новые стратегии кэширования
- Менять формат конфига / CLI-флаги
- P1.4 (file lock) — реализация отложена: требует новой зависимости `proper-lockfile`
  и дополнительного решения о стратегии retry; включить в отдельный PR

## Decisions

### D1: P0.1 — save() при entity-fallback

`generateCodeForItems` уже вычисляет флаг `needsEntityCacheFallback` и создаёт
`generationCaches` для соответствующих items. Решение: изменить условие persist-save с
`cacheStrategy === 'entity'` на `cacheStrategy === 'entity' || needsEntityCacheFallback`.

Альтернатива рассматривалась: вынести save() в финализатор вне условий. Отклонено — излишне
широко, сохраняли бы кэш даже при `cacheStrategy: content`, где это не нужно.

### D2: P0.2 — contentHash проверка в ReuseStore

В `readArtifactIfIntegrityOk` убрать `if (entry.byteSize > 0) return content` — всегда
выполнять hash-проверку. Небольшой overhead (~1–3 ms на файл) — приемлем.

Альтернатива: проверять только при `cacheDebug: true`. Отклонено — integrity bypass при
любом обычном запуске неприемлем для P0.

### D3: P0.3 — try/catch в GenerationCache.load()

Обернуть весь блок `readFile + JSON.parse + version check` в try/catch. При ошибке:
`logger.warn(CacheMessages.loadError(path, e))` + `return` (остаётся пустой кэш).

### D4: P1.1 — nameKindIndex multi-entry

Изменить тип `nameKindIndex` с `Record<string, ManifestArtifact>` на
`Record<string, ManifestArtifact[]>`. В `findNameKindConflict` возвращать первый entry с
отличным schemaHash. В `registerArtifact` при `skipConflictCheck: true` — push в массив.

Это исправляет корректность `ReuseConflictError.existing` и перестаёт затирать предыдущие
namespace-регистрации при `load()` из манифеста.

### D5: P1.2 — атомарный save() в ReuseStore

Паттерн: write → `manifest.json.tmp` → `fs.rename`. `rename` атомарен на POSIX-системах.
На Windows `rename` может фейлиться если target существует — добавить try/unlink + rename.

### D6: P1.3 — orphan scan при bad manifest

При `load()` bad/v1 манифест → сканировать `{cachePath}/artifacts/**/*.ts`,
удалять все найденные файлы (orphan cleanup), затем стартовать с пустым манифестом.
Логировать `logger.warn(CacheMessages.manifestOrphanCleanup(count))`.

### D7: P2.1–P2.4 — ArtifactFingerprinter correctness

- **P2.1**: Расширить `SCHEMA_HASH_KEYS` константой — добавить 10 полей.
- **P2.2**: Добавить `visited: Set<object>` в `normalizeSchemaNode`, перед рекурсией
  проверять и добавлять в Set.
- **P2.3**: В `stableStringify` (или перед передачей) сортировать значения полей `required`
  и `enum` если они массив строк.
- **P2.4**: В `buildOptionsSlice` включить конфигурацию плагинов — `JSON.stringify(plugin.config ?? {})`.

### D8: P2.9 — SharedFolderWriter.write() dead API

Удалить метод `write()` из `SharedFolderWriter`. Класс остаётся как holder для `lca`,
что документируется комментарием. Это безопасно: метод нигде не вызывается.

### D9: P2.10 / P2.11 — CrossSpecAnalyzer fixes

- **P2.10**: Удалить `detectCrossSpecDrift` и его вызов из `CrossSpecAnalyzer.run()`.
  Dead code, никогда не срабатывает.
- **P2.11**: В `runPreAnalyze` передавать реальный `items` вместо `[]` в
  `runCrossSpecAnalysis(manifest, items)`.

### D10: P3 tech debt

- P3.1: Убрать `'core'` из `ArtifactKind` union.
- P3.2: Убрать поле `kind` из `ManifestReference`.
- P3.3: Исправить hint в `ReuseConflictError` — использовать `entry.kind` вместо `"Model"`.
- P3.5: `getManifest()` возвращает `Readonly<ReuseStoreManifest>`.
- P3.6: Заменить `replace(/^[IET]/, '')` на явный список: `['I', 'E', 'T']`.

## Risks / Trade-offs

- **D4 (nameKindIndex)**: Изменение типа — небольшой риск регрессий в коде, который
  читает index напрямую. Митигация: поиск всех use-sites через grep перед изменением.
- **D5 (атомарный save)**: Windows rename limitation → добавить `try/catch` вокруг rename
  с fallback к прямой записи + лог warn.
- **D6 (orphan scan)**: Glob `artifacts/**/*.ts` может быть медленным при огромном store.
  Митигация: scan только при bad manifest (не нормальный путь).
- **D2 (contentHash always)**: Незначительный overhead на каждый hit. Приемлем — integrity
  важнее нескольких ms.
- **P1.4 (file lock) отложен**: Параллельные CLI-запуски в monorepo по-прежнему могут
  вызвать race condition. Задокументировано как known limitation до реализации lock.

## Migration Plan

Все изменения backward-compatible. Нет изменений в формате конфига или CLI.

1. P0-фиксы применяются первыми (наивысший риск для пользователей)
2. P1-фиксы: D4 изменяет внутренний тип — убедиться в отсутствии внешних потребителей
3. P2/P3: применяются последовательно по файлам
4. После P2.1 (расширенный whitelist) — существующие кэши могут инвалидироваться
   (другой hash) → GC удалит старые записи на следующем запуске. Приемлемо.
