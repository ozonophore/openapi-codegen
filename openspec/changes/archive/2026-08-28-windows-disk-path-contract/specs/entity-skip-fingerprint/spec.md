## ADDED Requirements

### Requirement: EntitySkip disk strings use slash
Сравниваемые и сохраняемые строки дисковых путей EntitySkip (кэш `files`, входные/выходные пути в skip и тестах) MUST использовать `/` после `pathHelpers`. Тесты MUST проверять эти строки через `joinHelper`, не через нативный `path.join`.

#### Scenario: Пути кэшированных файлов совпадают с формой хелпера
- **WHEN** EntitySkip записывает или проверяет кэшированные выходные файлы на Windows
- **THEN** сохраняемые и сравниваемые пути MUST использовать `/`, чтобы проверки существования совпадали с файлами, записанными через `pathHelpers`

#### Scenario: Тесты EntitySkip проверяют через joinHelper
- **WHEN** тест EntitySkip проверяет строку дискового пути
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper`, не через нативный `path.join`
