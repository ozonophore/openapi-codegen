### Requirement: buildWorkspaceReport агрегирует статистику и cross-spec находки
Функция `buildWorkspaceReport(specStats, reuseStore, config)` ДОЛЖНА возвращать объект типа `WorkspaceReport`, содержащий: `generatedAt` (ISO 8601), массив `specs` из переданного `specStats`, массив `crossSpec` из `analyzeCrossSpecManifest(reuseStore.getManifest())` (или пустой массив при отсутствии `reuseStore`), и `summary` с агрегированными счётчиками.

#### Scenario: отчёт формируется с reuseStore
- **WHEN** вызвана `buildWorkspaceReport` с непустым `specStats` и инициализированным `reuseStore`
- **THEN** результат содержит корректный `generatedAt`, все items из `specStats` в `specs`, cross-spec находки в `crossSpec` и ненулевой `summary`

#### Scenario: отчёт формируется без reuseStore
- **WHEN** вызвана `buildWorkspaceReport` с `reuseStore = null`
- **THEN** `crossSpec` равен пустому массиву, `summary` содержит только агрегацию по `specStats`

---

### Requirement: writeWorkspaceReport записывает файлы в зависимости от format
Функция `writeWorkspaceReport(report, config)` ДОЛЖНА записывать файлы согласно `config.format`: `"json"` → только `.json`, `"markdown"` → только `.md`, `"both"` → оба файла. Базовый путь берётся из `config.path` (default: `"./workspace-report"`).

#### Scenario: format both записывает два файла
- **WHEN** `config.format === 'both'`
- **THEN** существуют файлы `{path}.json` и `{path}.md`

#### Scenario: format json записывает только JSON
- **WHEN** `config.format === 'json'`
- **THEN** существует `{path}.json`, файл `{path}.md` не создаётся

#### Scenario: format markdown записывает только MD
- **WHEN** `config.format === 'markdown'`
- **THEN** существует `{path}.md`, файл `{path}.json` не создаётся

---

### Requirement: workspaceReport выполняется как постгенерационный шаг в OpenApiClient
`OpenApiClient.generateCodeForItems` ДОЛЖЕН после `combineAndWrite` и `finalizeSpecAnalysis`, при `rawOptions.workspaceReport?.enabled === true`, вызвать `buildWorkspaceReport` и `writeWorkspaceReport`. Шаг не блокирует генерацию при ошибке записи — ошибка логируется как warn.

#### Scenario: workspaceReport включён — файл создаётся
- **WHEN** конфиг содержит `{ workspaceReport: { enabled: true } }` и генерация завершена
- **THEN** файл `workspace-report.json` (и/или `.md`) создан в указанном пути

#### Scenario: workspaceReport выключен — файл не создаётся
- **WHEN** `workspaceReport` отсутствует в конфиге или `enabled: false`
- **THEN** никакой файл `workspace-report.*` не создаётся

---

### Requirement: типы WorkspaceReport соответствуют PDD §2.4
`src/core/workspaceReport/types.ts` ДОЛЖЕН содержать интерфейсы `WorkspaceReport`, `WorkspaceSpecSummary`, `WorkspaceReportConfig` точно соответствующие структуре из PDD.md §2.4. `WorkspaceSpecSummary` ДОЛЖЕН включать поля: `name`, `input`, `durationMs`, `reuseHits`, `reuseMisses`.

#### Scenario: WorkspaceSpecSummary содержит все обязательные поля
- **WHEN** `specStats` передан в `buildWorkspaceReport`
- **THEN** каждый элемент `specs` в отчёте имеет все пять полей с корректными типами
