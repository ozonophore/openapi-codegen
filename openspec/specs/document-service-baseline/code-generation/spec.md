## Purpose

Оркестрация CLI-команды `generate`: direct vs config mode, multi-spec inheritance, post-generation modules.

**Related delta specs:** `generate-cli-validation`, `generate-cli-marauder-flags`, `example-marauder-config`, `miracles-config-runtime`, `document-service-baseline/semantic-diff-analysis`.

## Requirements

### Requirement: Direct mode при наличии input и output
Когда CLI передаёт оба обязательных параметра `input` и `output`, генератор MUST выполняться в direct mode без загрузки конфигурационного файла, даже если путь к конфигу указан.

#### Scenario: Direct mode с минимальными опциями
- **WHEN** пользователь вызывает generate с `--input spec.yaml` и `--output ./generated`
- **THEN** генерация выполняется по переданным опциям без чтения openapi.config.json

#### Scenario: Отсутствие input или output переключает на config mode
- **WHEN** пользователь вызывает generate без `--input` или без `--output`
- **THEN** генератор MUST загрузить конфигурацию из файла, указанного в `--openapi-config`

---

### Requirement: Запрет custom request при excludeCoreServiceFiles
При direct mode валидация MUST отклонять комбинацию `excludeCoreServiceFiles=true` с непустым `request`.

#### Scenario: Конфликтующие опции
- **WHEN** direct mode содержит `excludeCoreServiceFiles: true` и `request: "./custom-request.ts"`
- **THEN** генерация завершается с ошибкой валидации до начала записи файлов

---

### Requirement: Наследование глобальных опций в multi-spec items
При конфигурации с массивом `items[]` каждый элемент MUST наследовать глобальные опции (httpClient, prefixes, cache, governance, specAnalysis, miracles и др.), если не переопределён на item. Поле `request` на item MUST fallback на глобальный `request`.

#### Scenario: Item без собственного request
- **WHEN** конфиг содержит глобальный `request: "./req.ts"` и item без поля `request`
- **THEN** item использует глобальный путь request

#### Scenario: Per-item specAnalysis сливается с root
- **WHEN** root содержит `specAnalysis: { crossSpec: true }` и item содержит `specAnalysis: { severity: "high" }`
- **THEN** итоговая конфигурация item MUST объединять оба блока deep-merge

#### Scenario: miracles inherited root to item
- **WHEN** root содержит `miracles: { enabled: false }` и item без miracles block
- **THEN** item inherits root miracles config (см. `miracles-config-runtime`)

---

### Requirement: Cross-field modelsMode и modelsLayout
Эффективный режим моделей MUST определяться как `modelsMode ?? models.mode`, layout — как `modelsLayout ?? models.layout`. Layout details — см. `models-classes-layout`.

#### Scenario: Legacy nested models block
- **WHEN** конфиг содержит `models: { mode: "classes", layout: "per-file" }` без top-level `modelsMode`
- **THEN** генерация использует classes mode с per-file layout

---

### Requirement: reuseMode requires reuse cache for auto-group
reuseMode=auto-group MUST быть meaningful только при cacheStrategy=reuse (см. `document-service-baseline/generation-cache-and-reuse`).

#### Scenario: auto-group without reuse cache
- **WHEN** reuseMode=auto-group и cacheStrategy=entity
- **THEN** warning logged, SharedFolderWriter не создаётся

---

### Requirement: Pre-analyze до записи файлов
Когда `preAnalyze: true`, cross-spec анализ MUST выполняться до генерации любого spec item (см. `document-service-baseline/spec-quality-analysis`).

#### Scenario: Pre-analyze с несколькими specs
- **WHEN** конфиг содержит два items и `preAnalyze: true`
- **THEN** в лог выводятся shared models и conflicts до начала generateSingle для первого item

---

### Requirement: Опциональные post-generation модули не прерывают run
Traffic splitter, swarm и workspace report MUST генерироваться после combine index; ошибка MUST логироваться как warning.

#### Scenario: Ошибка traffic splitter
- **WHEN** `trafficSplitter: true` и запись модуля завершилась исключением
- **THEN** warning в лог, процесс завершается успешно если основная генерация прошла

---

### Requirement: Batch ESLint требует оба пути
Post-generation ESLint fix MUST выполняться только когда заданы и tsconfigPath, и eslintConfigPath на top-level опциях.

#### Scenario: Только tsconfigPath
- **WHEN** задан `tsconfigPath` без `eslintConfigPath`
- **THEN** batch ESLint пропускается с предупреждением, lint registry очищается

---

### Requirement: Diff report apply pipeline
При useHistory=true generate MUST загрузить diff report и применить annotations; miracles apply-time filter — см. `miracles-config-runtime`; report construction — см. `document-service-baseline/semantic-diff-analysis`.

#### Scenario: useHistory without report file
- **WHEN** useHistory=true но diff report файл отсутствует
- **THEN** warning, diff annotations не применяются, generation continues
