## ADDED Requirements

### Requirement: Spec-load parses OpenAPI content strings
Система MUST предоставлять Spec-load leaf `parseOpenApiContent(content, sourcePath)`, который парсит строковое содержимое OpenAPI в объект. Пустой (после trim) content MUST бросать ошибку, включающую `sourcePath`. Content, начинающийся с `{` или `[`, MUST парситься через `JSON.parse`. Иначе MUST использоваться временный файл (расширение из `sourcePath`, иначе `.yaml`) и `SwaggerParser.parse`. MUST NOT выполнять `git show` / `execSync` внутри Spec-load.

#### Scenario: JSON content
- **WHEN** `parseOpenApiContent` получает валидный JSON object string и `sourcePath`
- **THEN** возвращается распарсенный object без создания temp file для parse path

#### Scenario: YAML content via temp
- **WHEN** `parseOpenApiContent` получает YAML string (не начинающийся с `{`/`[`)
- **THEN** content парсится через temp file + `SwaggerParser.parse` и temp cleanup выполняется

#### Scenario: Empty content
- **WHEN** content пустой или только whitespace
- **THEN** бросается Error, сообщение содержит `sourcePath`

### Requirement: Analyze-diff git path keeps show in CLI
CLI `readSpecFromGit` MUST по-прежнему читать blob через `git show` в CLI и MUST делегировать string parse в Spec-load `parseOpenApiContent`. Semantic expand MUST оставаться на существующем `loadSemanticOpenApiObject` после parse.

#### Scenario: Git ref load path
- **WHEN** analyze-diff загружает old spec из git ref
- **THEN** CLI выполняет git show, core парсит content, затем semantic load object path используется как сегодня
