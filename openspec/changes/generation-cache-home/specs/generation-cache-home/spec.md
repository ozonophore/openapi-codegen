## ADDED Requirements

### Requirement: GenerationCache package locality
Система MUST хранить класс `GenerationCache` в `src/core/generationCache/GenerationCache.ts` рядом с EntitySkip. MUST NOT оставлять implementation в `src/core/utils/GenerationCache.ts` (без shim). On-disk cache format MUST остаться неизменным.

#### Scenario: Imports resolve from generationCache package
- **WHEN** batch setup / item session / finalize / EntitySkip импортируют GenerationCache
- **THEN** import path указывает на `generationCache/GenerationCache` (или relative внутри package)
