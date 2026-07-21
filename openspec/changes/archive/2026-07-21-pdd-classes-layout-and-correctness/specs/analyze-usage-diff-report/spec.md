## ADDED Requirements

### Requirement: analyze-usage loads diff report when --diff-report is set
Команда `analyze-usage` при наличии `--diff-report <path>` MUST загрузить diff report через `loadDiffReport` так, чтобы gate `useHistory` не блокировал загрузку (передать `useHistory: true` или эквивалентный validate-mode). При успешном parse MUST передать `miracles` в `checkRenameMiracles`.

#### Scenario: valid report enables rename post-check
- **WHEN** передан валидный `--diff-report` с RENAME miracles и потребители импортируют старые символы
- **THEN** report загружается (не `null` из-за отсутствующего `useHistory`) и rename warnings могут попасть в findings

#### Scenario: missing report stays non-fatal
- **WHEN** `--diff-report` указывает на отсутствующий файл
- **THEN** analyze-usage продолжается без rename post-check (без падения процесса из-за load)

---

### Requirement: Generate history gate unchanged
Вызов `loadDiffReport` из generate-path при `useHistory !== true` MUST по-прежнему возвращать `null` и не применять history.

#### Scenario: generate without useHistory skips report
- **WHEN** generate без `useHistory` даже если файл report существует по default path
- **THEN** `loadDiffReport` возвращает `null`, history annotations не применяются
