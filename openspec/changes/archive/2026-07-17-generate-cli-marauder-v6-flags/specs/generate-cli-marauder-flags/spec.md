## ADDED Requirements

### Requirement: флаг --workspace-report для команды generate
Команда `generate` ДОЛЖНА принимать булев флаг `--workspace-report`, включающий функцию `workspaceReport` с конфигурацией по умолчанию (`enabled: true`, путь по умолчанию, формат `"both"`). Флаг ДОЛЖЕН также поддерживать dot-notation sub-ключи `--workspace-report.path` и `--workspace-report.format` через существующий пре-парсер `parseNestedCliOptions`. Если флаг не передан, поведение `workspaceReport` определяется исключительно конфигурационным файлом.

#### Scenario: флаг включает workspaceReport со значениями по умолчанию
- **WHEN** пользователь запускает `openapi-codegen generate --workspace-report --openapi-config ./openapi.config.json`
- **THEN** CLI сливает `{ workspaceReport: true }` поверх загруженного конфига, активируя генерацию workspace-отчёта с путём и форматом по умолчанию

#### Scenario: dot-notation переопределяет вложенное поле
- **WHEN** пользователь запускает `openapi-codegen generate --workspace-report.format=markdown`
- **THEN** `parseNestedCliOptions` устанавливает `workspaceReport.format = "markdown"` и `workspaceReport.enabled = true` в итоговых опциях

#### Scenario: флаг не передан
- **WHEN** `--workspace-report` не передан
- **THEN** `workspaceReport` берётся из конфигурационного файла (или остаётся отключённым по умолчанию)

---

### Requirement: флаг --traffic-splitter для команды generate
Команда `generate` ДОЛЖНА принимать булев флаг `--traffic-splitter`, включающий функцию `trafficSplitter` со значениями по умолчанию (`enabled: true`, `strategy: "weighted"`, равные веса). Поддержка dot-notation ДОЛЖНА быть обеспечена для `strategy`, `oldClientWeight`, `newClientWeight`, `stickySessions`, `sessionDuration`, `headerName` и `headerValues`.

#### Scenario: флаг включает trafficSplitter со значениями по умолчанию
- **WHEN** пользователь запускает `openapi-codegen generate --traffic-splitter --openapi-config ./openapi.config.json`
- **THEN** `{ trafficSplitter: true }` сливается в конфиг, в результате чего сгенерированный вывод содержит модуль `TrafficSplitter.ts` с weighted-стратегией по умолчанию

#### Scenario: переопределение стратегии через dot-notation
- **WHEN** пользователь запускает `openapi-codegen generate --traffic-splitter.strategy=round-robin`
- **THEN** `trafficSplitter.strategy` устанавливается в `"round-robin"` в итоговом конфиге

---

### Requirement: флаг --swarm для команды generate
Команда `generate` ДОЛЖНА принимать булев флаг `--swarm`, включающий генерацию AvatarSwarm-манифеста с путём вывода по умолчанию (`./swarm-manifest.json`). Флаг ДОЛЖЕН поддерживать dot-notation `--swarm.output` для переопределения пути вывода.

#### Scenario: флаг включает swarm со значениями по умолчанию
- **WHEN** пользователь запускает `openapi-codegen generate --swarm --openapi-config ./openapi.config.json`
- **THEN** `{ swarm: true }` сливается, и после генерации записывается `swarm-manifest.json`

#### Scenario: пользовательский путь вывода через dot-notation
- **WHEN** пользователь запускает `openapi-codegen generate --swarm.output=./reports/swarm.json`
- **THEN** swarm-манифест записывается в `./reports/swarm.json`

---

### Requirement: флаг --pre-analyze для команды generate
Команда `generate` ДОЛЖНА принимать булев флаг `--pre-analyze`, включающий предгенерационный cross-spec анализ. Это скалярный булев флаг без вложенных sub-ключей.

#### Scenario: флаг запускает предгенерационный анализ
- **WHEN** пользователь запускает `openapi-codegen generate --pre-analyze --openapi-config ./openapi.config.json`
- **THEN** выполняется анализ пересечений моделей между спеками и его результаты выводятся в stdout до записи любых файлов

#### Scenario: отсутствие флага пропускает пре-анализ
- **WHEN** `--pre-analyze` не передан и конфиг не устанавливает `preAnalyze: true`
- **THEN** предгенерационный анализ не выполняется

---

### Requirement: флаг --reuse-mode для команды generate
Команда `generate` ДОЛЖНА принимать опцию `--reuse-mode <value>`, где `<value>` — одно из `copy` (по умолчанию) или `auto-group`. Это скалярная enum-опция без dot-notation.

#### Scenario: режим auto-group через флаг
- **WHEN** пользователь запускает `openapi-codegen generate --reuse-mode auto-group --openapi-config ./openapi.config.json`
- **THEN** `reuseMode` устанавливается в `"auto-group"` в итоговом конфиге, активируя путь дедупликации через shared-папку

#### Scenario: некорректное значение отклоняется
- **WHEN** пользователь запускает `openapi-codegen generate --reuse-mode=invalid`
- **THEN** Commander отклоняет значение с ошибкой использования, перечисляя допустимые варианты

---

### Requirement: новые флаги должны быть зарегистрированы в пре-парсере parseNestedCliOptions
`--workspace-report`, `--traffic-splitter` и `--swarm` ДОЛЖНЫ быть добавлены в `MARAUDER_GROUP_KEYS` в `parseNestedCliOptions.ts`, чтобы пре-парсер перехватывал их и их dot-notation-варианты до обработки Commander. `--pre-analyze` и `--reuse-mode` НЕ ДОЛЖНЫ добавляться в `MARAUDER_GROUP_KEYS` (это скалярные Commander-опции).

#### Scenario: dot-notation флаг перехватывается до Commander
- **WHEN** `argv` содержит `--workspace-report.format=markdown`
- **THEN** `parseNestedCliOptions` удаляет его из `cleanedArgv` и устанавливает `nestedOptions.workspaceReport.format = "markdown"`, так что Commander никогда не видит неизвестный флаг

#### Scenario: неизвестный group-ключ не перехватывается
- **WHEN** `argv` содержит `--pre-analyze`
- **THEN** `parseNestedCliOptions` не удаляет его из `cleanedArgv` (его нет в `MARAUDER_GROUP_KEYS`), и Commander обрабатывает его в штатном режиме
