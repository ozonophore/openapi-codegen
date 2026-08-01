## Purpose

CLI-команда `analyze-diff`: семантическое сравнение OpenAPI specs и JSON report.

**Related:** `miracles-config-runtime` (apply-time filter), `document-service-baseline/consumer-usage-analysis` (rename post-check consumer).

## Requirements

### Requirement: Пропуск analyze-diff без baseline source
Когда не указаны ни `--compare-with`, ни `--git`, analyze-diff MUST завершиться успешно (exit 0) со статусом skipped без создания отчёта.

#### Scenario: Нет baseline
- **WHEN** вызов только с `--input current.yaml`
- **THEN** в лог пишется skipped message, success=true, skipped=true

---

### Requirement: Приоритет compare-with над git
Когда указаны оба `--compare-with` и `--git`, baseline MUST загружаться из compare-with; git ref MUST игнорироваться с informational log.

#### Scenario: Оба источника
- **WHEN** `--compare-with old.yaml --git HEAD~1`
- **THEN** old spec читается из old.yaml, в лог — что git overridden

---

### Requirement: Unified diff report schema
JSON-отчёт MUST содержать schemaVersion, metadata (base, target, hashes), semantic block (changes, governance, recommendation, summary) и structural адаптацию.

#### Scenario: Успешный diff
- **WHEN** обе спеки загружены и diff выполнен
- **THEN** отчёт записывается с timestamp и MD5 hashes base/target specs

---

### Requirement: Ignore rules фильтруют semantic changes
Ignore rules из openapi config MUST фильтровать semantic changes до построения miracles; количество ignored MUST логироваться.

#### Scenario: Ignored changes present
- **WHEN** ignore rule совпадает с change entry
- **THEN** change исключается из report, ignored count > 0 в логе

---

### Requirement: CI mode и governance errors
При `--ci` и governance.summary.errors > 0 analyze-diff MUST вернуть success=false (exit 1).

#### Scenario: CI failure on governance
- **WHEN** `--ci` и в отчёте governance errors > 0
- **THEN** success=false, error содержит CI failure message

---

### Requirement: Plugin hooks в semantic diff pipeline
Загруженные generator plugins MUST получить возможность модифицировать report через semantic diff hooks; при strictPluginMode ошибка hook MUST прерывать run.

#### Scenario: strictPluginMode
- **WHEN** plugin hook throws и strictPluginMode true
- **THEN** analyze-diff завершается с ошибкой

#### Scenario: Non-strict plugin error
- **WHEN** plugin hook throws и strictPluginMode false
- **THEN** ошибка логируется как diagnostic, pipeline продолжается

---

### Requirement: Miracles из semantic changes
Отчёт MUST включать miracles array, построенный из semantic changes для downstream analyze-usage validation.

#### Scenario: Rename detected
- **WHEN** semantic diff находит property rename
- **THEN** miracles содержит entry с old/new paths или properties
