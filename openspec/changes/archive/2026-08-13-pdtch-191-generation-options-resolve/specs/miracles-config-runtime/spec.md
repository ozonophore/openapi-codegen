## MODIFIED Requirements

### Requirement: miracles config inherited root to items
`resolveGenerationOptions` MUST наследовать блок `miracles` с корня конфига на items, если item не задаёт свой блок (та же модель, что у `useHistory` / `modelsMode`).

#### Scenario: root miracles applies to item
- **WHEN** root задаёт `miracles.enabled: false`, а item не переопределяет `miracles`
- **THEN** эффективные опции item содержат `miracles.enabled === false`
