## Purpose

Strict OpenAPI diagnostics и governance policy при generate и analyze-diff.

## Requirements

### Requirement: Strict mode прерывает generate при errors
Когда strictOpenapi включён и strict report summary.errors > 0, generation MUST throw до записи client files.

#### Scenario: Strict validation failure
- **WHEN** strictOpenapi true и unresolved refs найдены
- **THEN** ошибка содержит error count и path к report file

---

### Requirement: failOnGovernanceErrors отдельно от strict errors
Governance errors MUST fail generation только при failOnGovernanceErrors=true; strict parser errors и governance errors — разные пороги.

#### Scenario: Governance errors only
- **WHEN** strict report summary.errors=0 но governance.summary.errors>0 и failOnGovernanceErrors true
- **THEN** generation прерывается с governance failure message

#### Scenario: Governance warnings without fail flag
- **WHEN** governance violations severity warning и failOnGovernanceErrors false
- **THEN** generation продолжается, report записан

---

### Requirement: Governance rule NO_BREAKING_WITHOUT_FLAG
При analyze-diff governance MUST регистрировать violation когда breaking changes > 0 и allowBreaking=false.

#### Scenario: Breaking without flag
- **WHEN** semantic diff summary.breaking > 0 и allowBreaking false
- **THEN** governance report содержит NO_BREAKING_WITHOUT_FLAG violation

#### Scenario: Breaking allowed
- **WHEN** allowBreaking true
- **THEN** NO_BREAKING_WITHOUT_FLAG violation не генерируется

---

### Requirement: Operation-level governance rules
Rules REQUIRE_OPERATION_ID и NO_DEFAULT_WITHOUT_2XX MUST применяться к каждой operation с учётом allowList из governance config.

#### Scenario: Missing operationId
- **WHEN** rule REQUIRE_OPERATION_ID enabled и operation без operationId не в allowList
- **THEN** violation с path к operation

---

### Requirement: Strict report always written when strict enabled
При strictOpenapi=true diagnostics report MUST записываться на disk до decision fail/continue независимо от наличия errors.

#### Scenario: Report path
- **WHEN** strictOpenapi true с custom reportFile
- **THEN** JSON report создаётся по указанному path, лог содержит created message

---

### Requirement: Swagger parser pre-validation
Strict pipeline MUST включать parser validation issues из external OpenAPI parser как preIssues до custom strict checks.

#### Scenario: Invalid OpenAPI syntax
- **WHEN** spec не проходит swagger parser validation
- **THEN** preIssues содержат OPENAPI_PARSER_VALIDATION_FAILED entries
