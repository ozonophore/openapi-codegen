## Purpose

CLI-команда `preview-changes`: dry-run generation и file-level diff.

## Requirements

### Requirement: Пустая generated directory блокирует preview
preview-changes MUST завершиться ошибкой если `--generated-dir` пуст или не содержит файлов.

#### Scenario: Empty generated dir
- **WHEN** generated-dir существует но пуст
- **THEN** ошибка PREVIEW_DIR_EMPTY, success=false

---

### Requirement: Preview dir пересоздаётся каждый run
Перед генерацией preview MUST удалить и заново создать preview directory.

#### Scenario: Повторный preview
- **WHEN** preview dir уже существует от прошлого run
- **THEN** директория удаляется и создаётся заново перед generate

---

### Requirement: Output path remapping для preview
Конфиг MUST быть трансформирован так, чтобы все output paths из generated-dir были перенаправлены в preview-dir с сохранением относительной структуры.

#### Scenario: Multi output paths
- **WHEN** конфиг items имеют output `./generated/api` и outputModels `./generated/models`
- **THEN** preview generate пишет в эквivalent paths под preview-dir

---

### Requirement: Diff artifacts в markdown
При обнаружении изменений MUST создаваться diff-dir с per-file `.md` diff, summary.json и summary.md с категориями added/removed/modified.

#### Scenario: Modified file
- **WHEN** файл существует в обеих dirs с разным содержимым
- **THEN** status=modified, diff сохраняется в `{diffDir}/{relativePath}.md`

#### Scenario: No changes
- **WHEN** все файлы идентичны
- **THEN** diff-dir удаляется, лог сообщает no changes detected

---

### Requirement: Preview dir cleanup в finally
Временная preview directory MUST удаляться в finally block даже при ошибках; ошибка cleanup MUST установить exit code 1.

#### Scenario: Generation error
- **WHEN** generate в preview dir завершился исключением
- **THEN** finally всё равно пытается удалить preview dir
