## Purpose

Resilient `GenerationCache` behavior: safe load on corrupt files, persistence under
entity-fallback in reuse mode, and GC of unused batch keys.

## Requirements

### Requirement: GenerationCache.load() устойчив к повреждённому JSON
`GenerationCache.load()` ДОЛЖЕН перехватывать любые исключения при чтении и парсинге
файла кэша. При ошибке ДОЛЖЕН логировать предупреждение и продолжать работу с пустым
кэшем — генерация не должна прерываться из-за повреждения cache-файла.

#### Scenario: битый JSON не роняет генерацию
- **WHEN** файл `.openapi-codegen-cache.json` содержит невалидный JSON
- **THEN** `GenerationCache.load()` логирует warn и инициализирует пустой кэш

#### Scenario: отсутствующий файл кэша игнорируется
- **WHEN** файл кэша не существует
- **THEN** `load()` завершается без ошибки, кэш пустой

#### Scenario: несовместимая version при read-error всё равно не роняет
- **WHEN** файл кэша содержит `{ "version": 99 }` (неизвестная версия)
- **THEN** кэш обнуляется, предупреждение логируется

---

### Requirement: GenerationCache сохраняется при entity-fallback в reuse-режиме
При `cacheStrategy === 'reuse'` и `modelsMode: 'classes'` (entity-fallback) `GenerationCache`
ДОЛЖЕН сохраняться на диск после завершения генерации. Кэш НЕ ДОЛЖЕН быть in-memory only
при использовании entity-fallback.

#### Scenario: entity-fallback кэш персистентен между запусками
- **WHEN** `cacheStrategy: 'reuse'`, `modelsMode: 'classes'`, первый запуск генерации
- **THEN** файл `.openapi-codegen-cache.json` создаётся в outputRoot

#### Scenario: повторный запуск использует сохранённый кэш
- **WHEN** spec не изменилась после первого запуска с entity-fallback
- **THEN** `GenerationCache` обнаруживает hit, генерация пропускается

---

### Requirement: GenerationCache имеет GC устаревших ключей
`GenerationCache` ДОЛЖЕН удалять записи для ключей, которые не использовались в текущем
batch. Это предотвращает неограниченный рост cache-файла при ротации specs.

#### Scenario: устаревший ключ удаляется из кэша
- **WHEN** spec, для которой была создана cache-запись, удалена из конфига
- **THEN** после следующего запуска её запись отсутствует в `.openapi-codegen-cache.json`
