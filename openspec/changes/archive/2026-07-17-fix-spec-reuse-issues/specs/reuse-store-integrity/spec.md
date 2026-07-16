## ADDED Requirements

### Requirement: ReuseStore всегда проверяет contentHash при integrity check
`ReuseStore.readArtifactIfIntegrityOk` ДОЛЖЕН проверять `contentHash` для каждого артефакта
независимо от значения `byteSize`. Проверка только по размеру файла НЕ ДОПУСКАЕТСЯ.

#### Scenario: файл того же размера, но изменённого содержимого отклоняется
- **WHEN** артефакт в store имеет то же `byteSize`, но изменённое содержимое
- **THEN** `readArtifactIfIntegrityOk` возвращает `null`, артефакт регенерируется

#### Scenario: корректный файл проходит integrity check
- **WHEN** артефакт не изменён (`byteSize` и `contentHash` совпадают)
- **THEN** `readArtifactIfIntegrityOk` возвращает содержимое файла

---

### Requirement: ReuseStore.save() выполняет атомарную запись манифеста
`ReuseStore.save()` ДОЛЖЕН записывать манифест через временный файл с последующим
атомарным переименованием. Прямая запись в `manifest.json` НЕ ДОПУСКАЕТСЯ.

#### Scenario: прерванная запись не повреждает manifest
- **WHEN** процесс завершается во время `save()`
- **THEN** `manifest.json` остаётся валидным (предыдущая версия либо новая, не corrupted)

#### Scenario: успешный save создаёт корректный manifest
- **WHEN** `save()` завершается без ошибок
- **THEN** `manifest.json` содержит актуальное состояние store

---

### Requirement: ReuseStore.load() выполняет GC orphan-файлов при bad manifest
При обнаружении невалидного или устаревшего (version < 2) манифеста `ReuseStore.load()`
ДОЛЖЕН сканировать директорию `{cachePath}/artifacts/` и удалять все найденные файлы.
Логируется количество удалённых orphan-файлов.

#### Scenario: bad manifest инициирует orphan cleanup
- **WHEN** `manifest.json` содержит невалидный JSON или `"version": 1`
- **THEN** все файлы в `{cachePath}/artifacts/` удаляются, store стартует пустым

#### Scenario: отсутствующий manifest не вызывает cleanup
- **WHEN** `manifest.json` не существует (первый запуск)
- **THEN** `load()` завершается без сканирования, store пустой

---

### Requirement: nameKindIndex поддерживает несколько артефактов на пару name|kind
`nameKindIndex` ДОЛЖЕН хранить `ManifestArtifact[]` на каждый ключ `name|kind` (а не один
entry). Все зарегистрированные артефакты с одним именем и kind ДОЛЖНЫ быть доступны при
поиске конфликтов, включая namespace-registered артефакты.

#### Scenario: два namespace-артефакта с одинаковым именем оба сохраняются в индексе
- **WHEN** `reuseOnConflict: 'namespace'` и две specs используют `UserDto` с разными схемами
- **THEN** оба артефакта присутствуют в `nameKindIndex['UserDto|model']`

#### Scenario: conflict detection возвращает правильный existing-артефакт
- **WHEN** третья spec пытается зарегистрировать `UserDto` с новой схемой
- **THEN** `findNameKindConflict` возвращает корректный existing-артефакт (не перезаписанный)

---

### Requirement: ReuseStore.gc() очищает мёртвые ссылки в specItems
После удаления артефактов в `gc()` `ReuseStore` ДОЛЖЕН синхронизировать
`specItems[].artifactKeys` — удалять ссылки на артефакты, которые были GC-удалены.

#### Scenario: удалённый артефакт не остаётся в specItems
- **WHEN** артефакт не referenced ни одной spec и удаляется GC
- **THEN** его ключ отсутствует в `specItems` любого spec-item после `gc()`
