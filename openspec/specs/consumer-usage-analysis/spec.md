## Purpose

Поведение CLI-команды `analyze-usage`: сканирование consumer-проекта и проверка соответствия generated API contract.

## Requirements

### Requirement: API import scope ограничивает анализ
Analyzer MUST учитывать только импорты, относящиеся к generated API source path (через api import scope), игнорируя unrelated imports в consumer project.

#### Scenario: Unrelated import
- **WHEN** consumer импортирует символ не из generated API entry
- **THEN** import не учитывается в usage findings

---

### Requirement: Diff report loading для analyze-usage
При `--diff-report <path>` MUST загрузить diff report через loadDiffReport с useHistory=true (или эквивалент), чтобы gate useHistory не блокировал загрузку. При успешном parse MUST передать miracles в rename post-check.

#### Scenario: Valid report enables rename post-check
- **WHEN** передан валидный `--diff-report` с RENAME miracles
- **THEN** report загружается (не null из-за отсутствующего useHistory) и rename warnings могут попасть в findings

#### Scenario: Missing report stays non-fatal
- **WHEN** `--diff-report` указывает на отсутствующий файл
- **THEN** analyze-usage продолжается без rename post-check, без падения процесса

---

### Requirement: Generate history gate unchanged
loadDiffReport из generate-path при useHistory !== true MUST возвращать null и не применять history annotations.

#### Scenario: Generate without useHistory skips report
- **WHEN** generate без useHistory даже если report file существует
- **THEN** loadDiffReport возвращает null, history annotations не применяются

---

### Requirement: Rename miracle post-check
При загруженном diff report с miracles MUST проверяться stale imports старых символов. Findings MUST иметь severity WARNING (не ERROR) и не fail `--check`.

#### Scenario: Stale import after rename
- **WHEN** miracle указывает rename OldModel→NewModel и consumer импортирует OldModel
- **THEN** findings содержат rename miracle warning

#### Scenario: Symbol variant matching
- **WHEN** consumer импортирует UserSchema а miracle old symbol User
- **THEN** система MUST сопоставлять через Schema/Service suffix variants

---

### Requirement: CI check mode
При `--check` наличие finding с severity ERROR MUST приводить к success=false и exit code 1.

#### Scenario: Critical mismatch
- **WHEN** analyzer находит ERROR severity finding
- **THEN** CI check failed message, success=false

#### Scenario: Only warnings
- **WHEN** findings содержат только WARNING/INFO (включая rename warnings)
- **THEN** check mode завершается success=true

---

### Requirement: Coverage report
После анализа MUST вычисляться coverage: доля использованных methods/schemas/models относительно contract.

#### Scenario: Partial usage
- **WHEN** contract содержит 10 methods, consumer использует 3
- **THEN** coverage отражает 30% method usage в JSON report

---

### Requirement: Project context через tsconfig
При `--tsconfigPath` MUST использоваться указанный tsconfig; иначе probe ищет default в project root.

#### Scenario: Custom tsconfig
- **WHEN** `--tsconfigPath ./apps/web/tsconfig.json`
- **THEN** TypeScript project context строится из указанного файла

---

### Requirement: analyzeUsage disk strings use slash
Проверки analyzeUsage Client, Import, Service и rename MUST сравнивать и сохранять строки дисковых путей со `/` после `pathHelpers`. Область API-импорта MUST NOT дописывать нативный `path.sep` к пути, нормализованному к слешу. Тесты MUST проверять через `joinHelper`, не через нативный `path.join`.

#### Scenario: Import под корнем сгенерированного API на Windows
- **WHEN** analyzeUsage решает, лежит ли импорт под корнем сгенерированного API, на Windows
- **THEN** файл под этим корнем MUST совпадать, когда обе стороны используют `/`, включая правила Client, Import, Service и rename

#### Scenario: Тесты analyzeUsage проверяют через joinHelper
- **WHEN** тесты Client, Import, Service или rename проверяют строку дискового пути
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper`, не через нативный `path.join`
