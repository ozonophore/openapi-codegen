## ADDED Requirements

### Requirement: Spec-load package owns shared resolve and modes
Система MUST выполнять shared OpenAPI resolve prologue (path/empty/exists/`SwaggerParser.resolve`/root get) и mode-specific continuation через internal package `src/core/specLoad/`: **forContext** (Context attach + root) и **forSemantic** (expand clone for file and in-memory object).

#### Scenario: Generate still uses createResolvedContext facade
- **WHEN** Generation item session или preAnalyze загружает Spec
- **THEN** MUST вызывать `createResolvedContext`, который делегирует в Spec-load forContext без смены return shape `{ context, openApi }`

#### Scenario: Analyze-diff still uses semantic load facades
- **WHEN** analyze-diff загружает file или in-memory Spec для semantic compare
- **THEN** MUST вызывать `loadSemanticOpenApiSpec` / `loadSemanticOpenApiObject`, делегирующие в Spec-load forSemantic

---

### Requirement: Thin facades and internal barrel
`createResolvedContext` и `loadSemanticOpenApi*` MUST остаться thin facades на прежних путях. Spec-load barrel MUST NOT реэкспортироваться из `src/core/index.ts`. Git `parseContent` / `readSpecFromGit` MUST остаться в CLI adapter.

#### Scenario: Public core index omits specLoad
- **WHEN** потребитель импортирует `src/core/index.ts`
- **THEN** Spec-load package отсутствует среди exports

---

### Requirement: Behavioral preserve
Первый cut MUST сохранить Context lazy-ref / virtual-map semantics и semantic expand behavior. Entity-skip / Diff / options MUST NOT меняться этим change.

#### Scenario: Existing suites remain the gate
- **WHEN** change готов
- **THEN** `createResolvedContext` и expand/semantic load tests MUST проходить
