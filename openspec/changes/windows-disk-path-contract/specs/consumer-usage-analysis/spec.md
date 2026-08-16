## ADDED Requirements

### Requirement: analyzeUsage disk strings use slash
Проверки analyzeUsage Client, Import, Service и rename MUST сравнивать и сохранять строки дисковых путей со `/` после `pathHelpers`. Область API-импорта MUST NOT дописывать нативный `path.sep` к пути, нормализованному к слешу. Тесты MUST проверять через `joinHelper`, не через нативный `path.join`.

#### Scenario: Import под корнем сгенерированного API на Windows
- **WHEN** analyzeUsage решает, лежит ли импорт под корнем сгенерированного API, на Windows
- **THEN** файл под этим корнем MUST совпадать, когда обе стороны используют `/`, включая правила Client, Import, Service и rename

#### Scenario: Тесты analyzeUsage проверяют через joinHelper
- **WHEN** тесты Client, Import, Service или rename проверяют строку дискового пути
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper`, не через нативный `path.join`
