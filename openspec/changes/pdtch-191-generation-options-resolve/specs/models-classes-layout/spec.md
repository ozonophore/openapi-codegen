## MODIFIED Requirements

### Requirement: CLI generate does not override config modelsMode with Commander default
При `generate -ocn <config>` CLI MUST применять `--modelsMode` / `--modelsLayout` только если флаг реально передан в argv. Commander MUST NOT задавать `.default(interfaces)` (или эквивалент) для `--modelsMode` так, чтобы `mergeGenerateCliOverrides` всегда перетирал `models.mode` / `modelsMode` из конфига. Default `interfaces` MUST применяться только на этапе Generation options resolve (`resolveGenerationOptions`) / schema defaults, когда в merged options mode отсутствует.

#### Scenario: config classes survives -ocn without CLI flag
- **WHEN** конфиг содержит `models.mode: "classes"` (или `modelsMode: "classes"`) и команда `generate -ocn <config>` без `--modelsMode`
- **THEN** генерация идёт в `classes` (появляются BaseDto / `*Raw`+`*Dto`), а не в `interfaces`

#### Scenario: explicit CLI modelsMode still wins
- **WHEN** конфиг содержит `models.mode: "classes"` и CLI передаёт `--modelsMode interfaces`
- **THEN** итоговый mode = `interfaces`
