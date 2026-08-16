## ADDED Requirements

### Requirement: Generation cache listing assertions use joinHelper
Тесты generation cache, которые проверяют перечисленные выходные пути, MUST сравнивать их с результатами `joinHelper` (`/`), не с нативным `path.join` и не с листингами со `\`.

#### Scenario: Рекурсивный листинг совпадает с путями со слешем
- **WHEN** тест generation cache перечисляет выходные файлы через `readdir` (рекурсивно) и проверяет наличие сгенерированного файла
- **THEN** ожидаемый путь MUST быть формой `joinHelper` (например `core/OpenAPI.ts`), не нативным `path.join` с разделителем `\`

#### Scenario: Warning shared output сравнивается со слешем
- **WHEN** тест проверяет, что предупреждение «cache is disabled» содержит каталог вывода
- **THEN** ожидаемый путь MUST быть формой `joinHelper` (`/`), не нативным `path.join` со `\`
