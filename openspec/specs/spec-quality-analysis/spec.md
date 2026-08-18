## Purpose

Spec quality analysis (`specAnalysis` / legacy `anomalyDetection`) и pre-generation cross-spec scan (`preAnalyze`).

**Related:** `code-generation` (preAnalyze trigger), `generator-plugins` (preAnalyze plugin load).

## Requirements

### Requirement: Per-spec и cross-spec findings
Spec analysis MUST собирать per-spec findings во время generate каждого item; cross-spec analysis MUST выполняться при finalize если crossSpec !== false.

#### Scenario: Cross-spec enabled
- **WHEN** specAnalysis enabled с default crossSpec
- **THEN** после всех items finalize добавляет crossSpec findings в report

#### Scenario: Cross-spec disabled
- **WHEN** specAnalysis.crossSpec = false
- **THEN** cross-spec findings не генерируются

---

### Requirement: failOnHigh прерывает generation
Когда failOnHigh (или deprecated failOnAnomalies) true и summary.high > 0, finalize MUST throw и прервать generation run.

#### Scenario: High severity anomaly
- **WHEN** detector находит high-severity finding и failOnHigh true
- **THEN** ошибка содержит count high findings и path к report

---

### Requirement: Merge specAnalysis config across items
При multi-spec MUST использоваться merged config: max severity из всех items, crossSpec=true если хоть один item не отключил, failOnHigh=true если хоть один включил.

#### Scenario: Mixed severity
- **WHEN** item A severity medium, item B severity high
- **THEN** merged severity = high

---

### Requirement: anomalyDetection alias
Поле anomalyDetection MUST трактоваться как alias specAnalysis через resolveSpecAnalysisConfig; deprecated flag MUST сохранять backward compatibility.

#### Scenario: Legacy anomalyDetection flag
- **WHEN** конфиг содержит `anomalyDetection: true` без specAnalysis
- **THEN** spec analysis выполняется как enabled

---

### Requirement: Pre-analyze cross-spec scan до первой записи
При preAnalyze=true OpenApiClient MUST выполнить cross-spec анализ до первого generateSingle: parse всех items (schemas only), run cross-spec analysis, вывести structured summary в stdout. Генерация MUST продолжиться в штатном режиме — preAnalyze не блокирует.

runCrossSpecAnalysis MUST получать реальный список items (не пустой), чтобы detectSharedOutputCollisionRisk мог обнаруживать коллизии outputModels/outputSchemas paths.

#### Scenario: Analysis before file writes
- **WHEN** preAnalyze=true и 3 items
- **THEN** stdout содержит shared models/conflicts до сообщений о генерации

#### Scenario: preAnalyze false skips
- **WHEN** preAnalyze отсутствует или false
- **THEN** предгенерационный анализ не выполняется

#### Scenario: Shared output collision warning
- **WHEN** preAnalyze=true и два items имеют одинаковый outputModels
- **THEN** stdout содержит shared-output-collision-risk warning

#### Scenario: One spec fails parse
- **WHEN** два items и один input invalid
- **THEN** pre-analyze парсит успешный item, warning для failed, продолжает analysis

#### Scenario: No parsable specs
- **WHEN** все items fail parse
- **THEN** лог "No specs could be parsed, skipping analysis", без throw

#### Scenario: Parse error does not block generation
- **WHEN** один item.input недоступен и preAnalyze=true
- **THEN** warn в stdout, генерация остальных specs выполняется успешно

---

### Requirement: Pre-analyze structured stdout
Вывод preAnalyze MUST включать: количество shared models, количество conflicts, top-5 shared models, детали name/hash conflicts.

#### Scenario: Counters and top shared models
- **WHEN** 5 shared models и 1 conflict между тремя specs
- **THEN** stdout содержит "Shared models: 5", "Conflicts: 1" и список top models

---

### Requirement: Default excluded categories
Per-spec analysis MUST применять DEFAULT_EXCLUDED_ANOMALY_CATEGORIES если excludeCategories не переопределён.

#### Scenario: Default exclusions
- **WHEN** specAnalysis enabled без excludeCategories
- **THEN** категории из default exclusion list не генерируют findings
