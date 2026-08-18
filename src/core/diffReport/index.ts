/** Diff report lifecycle: adapt, load, apply, enrich, produce, write, pipeline, types. */

export { adaptSemanticToStructural, type SemanticDiffLike } from './adapters/semanticToStructural';
export { applyDiffReportToClient } from './applyDiffReportToClient';
export type { DiffReport, DiffReportEntry, DiffReportMetadata, DiffReportStats, StructuralDiffPart, UnifiedDiffReport } from './DiffReport.model';
export type { DiffInfo, MiracleEntry } from './DiffReport.model';
export { UNIFIED_DIFF_REPORT_SCHEMA_VERSION } from './DiffReport.model';
export { enrichSemanticDiffReport, type EnrichSemanticDiffReportInput, type EnrichSemanticDiffReportResult } from './enrichSemanticDiffReport';
export type { IgnoreRule } from './ignoreRule.model';
export { loadDiffReport } from './loadDiffReport';
export { produceUnifiedDiffReport, type ProduceUnifiedDiffReportInput } from './produceUnifiedDiffReport';
export { runAnalyzeDiffPipeline, type RunAnalyzeDiffPipelineInput, type RunAnalyzeDiffPipelineResult } from './runAnalyzeDiffPipeline';
export { writeDiffReport } from './writeDiffReport';
