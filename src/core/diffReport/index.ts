/** Diff report lifecycle: adapt, load, apply, produce, write, types. */

export { adaptSemanticToStructural, type SemanticDiffLike } from './adapters/semanticToStructural';
export { applyDiffReportToClient } from './applyDiffReportToClient';
export { buildMiraclesFromSemanticChanges } from './buildMiraclesFromSemanticChanges';
export type { DiffReport, DiffReportEntry, DiffReportMetadata, DiffReportStats, StructuralDiffPart, UnifiedDiffReport } from './DiffReport.model';
export type { DiffInfo, MiracleEntry } from './DiffReport.model';
export { UNIFIED_DIFF_REPORT_SCHEMA_VERSION } from './DiffReport.model';
export { loadDiffReport } from './loadDiffReport';
export { produceUnifiedDiffReport, type ProduceUnifiedDiffReportInput } from './produceUnifiedDiffReport';
export { writeDiffReport } from './writeDiffReport';
