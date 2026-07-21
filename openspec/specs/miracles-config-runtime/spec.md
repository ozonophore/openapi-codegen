## Purpose

Runtime application of `miracles.{enabled,confidence,types}` (plus root→items inheritance)
when generating with history/diff reports.

## Requirements

### Requirement: miracles config inherited root to items
`normalizeOptions` MUST наследовать блок `miracles` с корня конфига на items, если item не задаёт свой блок (та же модель, что у `useHistory` / `modelsMode`).

#### Scenario: root miracles applies to item
- **WHEN** root задаёт `miracles.enabled: false`, а item не переопределяет `miracles`
- **THEN** эффективные опции item содержат `miracles.enabled === false`

---

### Requirement: Runtime filter respects miracles.enabled
При generate с `useHistory` и загруженным report, если эффективный `miracles.enabled === false`, генератор MUST НЕ применять miracles (RENAME getters, TYPE_COERCION miracles и прочие miracle-driven эффекты). Structural diff annotations вне miracles (в т.ч. ghosts от removed entries) MUST сохранять текущее поведение apply-path, если они не зависят от miracle list.

#### Scenario: enabled false skips deprecated getters
- **WHEN** `modelsMode: "classes"`, confirmed RENAME miracle в report, `miracles.enabled: false`
- **THEN** deprecated getter на DTO не эмитится

#### Scenario: omitted miracles block keeps HEAD filter
- **WHEN** блок `miracles` отсутствует
- **THEN** применяются miracles со `status === "confirmed"` или `confidence === 1` (поведение HEAD)

---

### Requirement: Runtime filter respects miracles.confidence and types
Если задан `miracles.confidence`, miracle без `status: confirmed` MUST применяться только при `confidence >=` порога. Если задан непустой `miracles.types`, MUST применяться только miracles с типом из allowlist. Confirmed miracles MUST НЕ отсекаться только из-за порога confidence.

#### Scenario: confidence threshold filters auto-generated
- **WHEN** `miracles.confidence: 1` и miracle RENAME имеет `status: auto-generated`, `confidence: 0.8`
- **THEN** miracle не применяется

#### Scenario: types allowlist
- **WHEN** `miracles.types: ["TYPE_COERCION"]` и в report есть RENAME и TYPE_COERCION
- **THEN** применяется только TYPE_COERCION (при прохождении status/confidence правил)
