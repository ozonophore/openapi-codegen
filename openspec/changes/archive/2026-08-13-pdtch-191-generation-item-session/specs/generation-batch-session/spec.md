## MODIFIED Requirements

### Requirement: Generation batch session owns multi-item lifecycle
Система MUST выполнять multi-item Generation lifecycle через internal module **Generation batch session** (`GenerationBatchSession`), а не через разросшийся метод-мешок на фасаде. Session MUST владеть: cache/ReuseStore/SharedFolderWriter setup, warm preAnalyze entity-skip pass, per-item orchestration, index combine, post-generation steps, Spec analysis finalize, Reuse GC/save, Generation report finalize, stale cleanup, batch ESLint, success-path logger shutdown.

#### Scenario: Facade delegates batch run
- **WHEN** вызывается публичная генерация (`OpenApiClient.generate` / CLI generate)
- **THEN** после normalize/defaults фасад MUST запустить `GenerationBatchSession.run` для списка items

#### Scenario: Per-item generation stays outside session module
- **WHEN** session обрабатывает очередной Spec item
- **THEN** фактический parse→Client→Write MUST выполняться через injected callback `generateItem`, реализованный фасадом как делегат в **Generation item session** (`itemSession.run`), а не кодом внутри batch session module и не методом `generateSingle` на фасаде
