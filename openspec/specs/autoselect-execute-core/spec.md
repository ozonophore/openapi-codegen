## ADDED Requirements

### Requirement: AutoSelect execute orchestration in core
Система MUST выполнять AutoSelect probe fan-out / mismatch merge / option patch через `executeAutoSelection` в `src/core/autoSelect/`. MUST принимать logger duck `{ info; warn }`. `core/index` MUST экспортировать `executeAutoSelection`. CLI generate MUST NOT владеть probe orchestration (только вызов). Probe helpers MAY экспортироваться из файла для тестов и MUST NOT быть required public surface `core/index`.

#### Scenario: CLI generate calls core execute
- **WHEN** generate path имеет `autoSelect.enabled`
- **THEN** CLI вызывает `executeAutoSelection(raw, logger)` из core и merge'ит результат перед `OpenAPI.generate`

#### Scenario: Multi-output mismatch patches items
- **WHEN** разные output dirs дают разные recommendations
- **THEN** execute возвращает per-item `validationLibrary` / `httpClient` и warn'ит через logger duck
