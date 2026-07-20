### Requirement: generateOptionsBaseSchema принимает поле workspaceReport
`generateOptionsBaseSchema` в `src/cli/schemas/generate.ts` ДОЛЖНА включать поле `workspaceReport` с типом `workspaceReportConfigSchemaOrBoolean.optional()`, следуя паттерну `autoSelectConfigSchemaOrBoolean`. Когда поле является булевым `true`, Zod НЕ ДОЛЖЕН его трансформировать; когда это объект — Zod ДОЛЖЕН валидировать его форму (`enabled`, `path`, `format`).

#### Scenario: булево сокращение проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ workspaceReport: true }`
- **THEN** Zod-валидация проходит и `validated.workspaceReport` равно `true`

#### Scenario: объектная форма с корректным format проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ workspaceReport: { format: "json" } }`
- **THEN** Zod-валидация проходит и `validated.workspaceReport.format` равно `"json"`

#### Scenario: объектная форма с некорректным format не проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ workspaceReport: { format: "xml" } }`
- **THEN** Zod возвращает ошибку валидации, указывая что `format` должен быть `"json"`, `"markdown"` или `"both"`

---

### Requirement: generateOptionsBaseSchema принимает поле trafficSplitter
`generateOptionsBaseSchema` ДОЛЖНА включать поле `trafficSplitter` с типом `trafficSplitterConfigSchemaOrBoolean.optional()`. Объектная форма ДОЛЖНА валидировать `strategy` как одно из `"weighted" | "round-robin" | "header-based" | "header-and-weighted"`, `oldClientWeight`/`newClientWeight` как числа, `stickySessions` как булево и `sessionDuration` как строку.

#### Scenario: булево сокращение проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ trafficSplitter: true }`
- **THEN** Zod-валидация проходит

#### Scenario: некорректное значение strategy не проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ trafficSplitter: { strategy: "random" } }`
- **THEN** Zod возвращает ошибку валидации для `strategy`

---

### Requirement: generateOptionsBaseSchema принимает поле swarm
`generateOptionsBaseSchema` ДОЛЖНА включать поле `swarm` с типом `swarmConfigSchemaOrBoolean.optional()`. Объектная форма ДОЛЖНА валидировать `enabled` как булево и `output` как строку.

#### Scenario: булево сокращение проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ swarm: true }`
- **THEN** Zod-валидация проходит

#### Scenario: объект с пользовательским output проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ swarm: { enabled: true, output: "./reports/swarm.json" } }`
- **THEN** Zod-валидация проходит и `validated.swarm.output` равно `"./reports/swarm.json"`

---

### Requirement: generateOptionsBaseSchema принимает поле preAnalyze
`generateOptionsBaseSchema` ДОЛЖНА включать поле `preAnalyze` с типом `z.boolean().optional()`.

#### Scenario: булево true проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ preAnalyze: true }`
- **THEN** Zod-валидация проходит и `validated.preAnalyze` равно `true`

#### Scenario: отсутствие поля даёт undefined
- **WHEN** `preAnalyze` отсутствует в разобранных CLI-опциях
- **THEN** `validated.preAnalyze` равно `undefined`

---

### Requirement: generateOptionsBaseSchema принимает поле reuseMode
`generateOptionsBaseSchema` ДОЛЖНА включать поле `reuseMode` с типом `z.enum(['copy', 'auto-group']).optional()`.

#### Scenario: корректное enum-значение проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ reuseMode: "auto-group" }`
- **THEN** Zod-валидация проходит и `validated.reuseMode` равно `"auto-group"`

#### Scenario: некорректное enum-значение не проходит валидацию
- **WHEN** разобранные CLI-опции содержат `{ reuseMode: "shared" }`
- **THEN** Zod возвращает ошибку валидации, перечисляя `"copy"` и `"auto-group"` как допустимые значения

---

### Requirement: root-only block-флаги исключены из direct flat-mode-валидации
`workspaceReport`, `trafficSplitter` и `swarm` ДОЛЖНЫ быть добавлены в `DIRECT_FLAT_CLI_EXCLUDE_KEYS` в `generateCliOverrides.ts`, чтобы их сложная объектная форма не ломала валидацию `flatOptionsSchema` в direct-режиме (`--input`/`--output`), по аналогии с `autoSelect`, `specAnalysis` и `anomalyDetection`.

#### Scenario: block-флаг исключён в direct-режиме
- **WHEN** пользователь передаёт `--workspace-report --input spec.yaml --output ./out`
- **THEN** `pickDirectFlatCliInput` не включает `workspaceReport` в плоский объект, передаваемый в `flatOptionsSchema`

---

### Requirement: новые block-флаги сливаются через mergeMarauderBlockDeep
`workspaceReport`, `trafficSplitter` и `swarm` ДОЛЖНЫ сливаться через `mergeMarauderBlockDeep` в `mergeGenerateCliOverrides`, а не перезаписываться скалярным spread. `preAnalyze` и `reuseMode` ДОЛЖНЫ быть добавлены в `GENERATE_CLI_OVERRIDE_KEYS` как скалярные переопределения.

#### Scenario: CLI block сливается с block из конфига
- **WHEN** конфиг содержит `{ workspaceReport: { enabled: true, path: "./ws" } }` и CLI передаёт `--workspace-report.format=json`
- **THEN** итоговый результат: `{ workspaceReport: { enabled: true, path: "./ws", format: "json" } }`

#### Scenario: CLI скаляр переопределяет скаляр из конфига
- **WHEN** конфиг содержит `{ reuseMode: "copy" }` и CLI передаёт `--reuse-mode auto-group`
- **THEN** итоговый результат содержит `reuseMode: "auto-group"`
