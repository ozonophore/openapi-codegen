## ADDED Requirements

### Requirement: ProjectProbe disk strings use slash
Сравниваемые и сохраняемые строки дисковых путей ProjectProbe MUST использовать `/` после `pathHelpers`. Проверки префикса (consumer-файлы под `src`) MUST NOT дописывать нативный `path.sep` к пути, нормализованному к слешу. Тесты MUST проверять через `joinHelper`, не через нативный `path.join`.

#### Scenario: Файлы consumer совпадают с корнем src на Windows
- **WHEN** ProjectProbe отфильтровывает исходники consumer под `src` на Windows
- **THEN** файл под этим каталогом MUST считаться consumer-файлом, даже если `getFilePath()` использует `/`

#### Scenario: Тесты ProjectProbe проверяют через joinHelper
- **WHEN** тест ProjectProbe проверяет строку дискового пути
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper`, не через нативный `path.join`
