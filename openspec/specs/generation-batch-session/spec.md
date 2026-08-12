## Purpose

Multi-item Generation lifecycle owned by an internal `GenerationBatchSession` module (facade delegates via callback seam).

## Requirements

### Requirement: Generation batch session owns multi-item lifecycle
Система MUST выполнять multi-item Generation lifecycle через internal module **Generation batch session** (`GenerationBatchSession`), а не через разросшийся метод-мешок на фасаде. Session MUST владеть: cache/ReuseStore/SharedFolderWriter setup, warm preAnalyze entity-skip pass, per-item orchestration, index combine, post-generation steps, Spec analysis finalize, Reuse GC/save, Generation report finalize, stale cleanup, batch ESLint, success-path logger shutdown.

#### Scenario: Facade delegates batch run
- **WHEN** вызывается публичная генерация (`OpenApiClient.generate` / CLI generate)
- **THEN** после normalize/defaults фасад MUST запустить `GenerationBatchSession.run` для списка items

#### Scenario: Per-item generation stays outside session module
- **WHEN** session обрабатывает очередной Spec item
- **THEN** фактический parse→Client→Write MUST выполняться через injected callback `generateItem`, реализованный фасадом (`generateSingle`), а не кодом внутри session module

---

### Requirement: Callback seam and itemRunContext
Session MUST зависеть от явных deps: `writeClient`, `eslintFixOptions`, `generateItem`, `shouldEntitySkip`. Per-item callback MUST получать `itemRunContext`, включающий reuse fields и `specAnalysisAccumulator`. Spec analysis accumulator MUST создаваться и финализироваться в session, не как поле фасада.

#### Scenario: Warm skip uses shouldEntitySkip
- **WHEN** `preAnalyze=true` и item будет entity-skipped
- **THEN** session MUST вызвать `shouldEntitySkip` и исключить item из `runPreAnalyze` input set

#### Scenario: Accumulator passed into generateItem
- **WHEN** session создала Spec analysis accumulator для run
- **THEN** `generateItem` MUST получить тот же accumulator через `itemRunContext.specAnalysisAccumulator`

---

### Requirement: Session is not a public core export
`GenerationBatchSession` MUST NOT реэкспортироваться из `src/core/index.ts` (internal module, как `OpenApiClient`).

#### Scenario: Public core index omits session
- **WHEN** потребитель импортирует публичную поверхность `src/core/index.ts`
- **THEN** `GenerationBatchSession` отсутствует среди exports

---

### Requirement: Session test surface
Unit-тесты MUST покрывать session через её interface с fake `generateItem` / `shouldEntitySkip`, включая: финальный report после GC с phases при `cacheDebug`; early conflict dump; порядок post-batch шагов; warm skip wiring; `allEntitySkipped` gates (нет combine/ESLint); GC с накопленными referenced artifact keys.

#### Scenario: Fake callbacks drive ordering test
- **WHEN** unit-тест session подставляет fake `generateItem` и `shouldEntitySkip`
- **THEN** тест MAY проверить порядок side-effects (GC before final report, skip combine when all entity-skipped) без полного OpenAPI parse
