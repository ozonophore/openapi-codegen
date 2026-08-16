## MODIFIED Requirements

### Requirement: analyze-diff разрешает объединённые пути плагинов
`resolvePluginEntries(openapiConfig, cliPlugins)` MUST сливать записи плагинов из конфига с путями CLI (сначала конфиг, dedupe по path) и возвращать `NormalizedPluginEntry[]` (path + config), без strip через `extractPluginPaths`.

#### Scenario: Только плагины из конфига
- **WHEN** openapi-конфиг содержит plugins, а CLI не передаёт `--plugins`
- **THEN** загружаются плагины из конфига с сохранённым `config`

#### Scenario: Конфиг и CLI объединены
- **WHEN** конфиг содержит `./a.cjs`, а CLI передаёт `./b.cjs`
- **THEN** оба entry загружаются в порядке config-first

#### Scenario: Object config preserved
- **WHEN** конфиг содержит `{ path: "./a.cjs", config: { mode: "x" } }`
- **THEN** returned entry includes `config: { mode: "x" }`
