## MODIFIED Requirements

### Requirement: preAnalyze выполняет cross-spec анализ до записи первых файлов
При `rawOptions.preAnalyze === true`, до первого вызова `generateSingle`, `OpenApiClient`
ДОЛЖЕН: распарсить все спеки из `items` (только схемы, без записи артефактов), запустить
`CrossSpecAnalyzer`, вывести отчёт в stdout через `logger.forceInfo`. Генерация продолжается
в штатном режиме — `preAnalyze` не блокирует.

`runCrossSpecAnalysis` ДОЛЖЕН получать реальный список `items` (а не пустой `[]`), чтобы
`detectSharedOutputCollisionRisk` мог корректно обнаруживать коллизии output-путей.

#### Scenario: анализ выполняется до записи файлов
- **WHEN** `preAnalyze: true` и конфиг имеет 3 items
- **THEN** вывод с результатами кросс-спечного анализа появляется в stdout до сообщений о генерации спек

#### Scenario: preAnalyze: false пропускает шаг
- **WHEN** `preAnalyze` отсутствует или `false`
- **THEN** предгенерационный анализ не выполняется, stdout не содержит соответствующего вывода

#### Scenario: detectSharedOutputCollisionRisk обнаруживает коллизии при preAnalyze
- **WHEN** `preAnalyze: true` и два items имеют одинаковый `outputModels`
- **THEN** stdout содержит предупреждение о `shared-output-collision-risk`

## REMOVED Requirements

### Requirement: detectCrossSpecDrift обнаруживает drift между specs
**Reason**: Детектор `detectCrossSpecDrift` реализован с условием, идентичным
`detectNameHashConflicts`, и никогда не срабатывает (все conflict-имена попадают в
`skipNames`). Функционально мёртвый код.
**Migration**: Не требуется. `cross-spec-drift` категория диагностик никогда не
эмитировалась в production. Детектор удаляется без замены.
