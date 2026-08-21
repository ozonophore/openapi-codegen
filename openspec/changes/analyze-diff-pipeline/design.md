## Context

Analyze-diff CLI после enrich/produce всё ещё оркестрирует success-path в try-блоке. Листья deep; порядок и CI gate — shallow. Grill зафиксировал: один module `runAnalyzeDiffPipeline` в `diffReport/`.

## Goals / Non-Goals

**Goals:**
- Один seam для analyze → enrich → produce → write → CI governance gate
- CLI = adapter (Zod, Spec load, load policy, logs, exit map)
- Bit-identical CLI behavior (exit codes, report on disk before CI fail)
- Thin unit + preserve CLI/fixture suites

**Non-Goals:**
- Plugin entry resolve в core
- Unified-direct apply / schema collapse
- Spec-load git в core
- Public export из `core/index`
- Смена analyze/enrich/produce semantics
- `timestamp` на pipeline input
- Перенос CI markdown / INFO логов в pipeline

## Decisions

1. **Home:** `src/core/diffReport/runAnalyzeDiffPipeline.ts`, export из `diffReport/index` only  
   - Alt: отдельный `analyzeDiff/` package — rejected (один caller; листья уже в diffReport)

2. **Policy loads снаружи:** caller передаёт loaded specs + plugins + ignore + governance  
   - Alt: pipeline грузит сам — rejected (раздувает interface путями; enrich уже так)

3. **CI-fail = `ciFailed: true`, не throw:** отчёт уже записан; unexpected errors throw  
   - Alt: throw на CI-fail — rejected (ожидаемый исход после write)

4. **Логи в CLI; `onDiagnostic?` на pipeline** (проброс в enrich)  
   - Alt: duck-logger на pipeline — rejected (лишний interface)

5. **Return bag:** `{ reportPath, ignored, semanticReport, report, ciFailed }` — CLI мапит в `AnalyzeDiffResult` + markdown

## Risks / Trade-offs

- [Fixture tests still call CLI] → Mitigation: behavioral preserve; unit covers gate/order
- [Double governance evaluate path drift] → Mitigation: pipeline only calls existing enrich; no re-implement
- [CLI forgets to map `ciFailed`] → Mitigation: CLI suite ci mode + unit on `ciFailed`

## Migration Plan

1. Add module + export
2. Wire `analyzeDiff.ts`
3. Unit + run analyze-diff tests
4. Update CONTEXT OpenSpec id

Rollback: revert CLI to inline orchestration; delete module.
