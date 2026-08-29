/** Diff report lifecycle: adapt, load, apply, enrich, produce, write, pipeline, types. */

export { adaptSemanticToStructural, type SemanticDiffLike } from './adapters/semanticToStructural';
export { applyHistoryDiffToClient, type ApplyHistoryDiffToClientInput } from './applyHistoryDiffToClient';
export type { DiffReport, DiffReportEntry, DiffReportMetadata, DiffReportStats, StructuralDiffPart, UnifiedDiffReport } from './DiffReport.model';
export type { DiffInfo, MiracleEntry } from './DiffReport.model';
export { UNIFIED_DIFF_REPORT_SCHEMA_VERSION } from './DiffReport.model';
export type { IgnoreRule } from './ignoreRule.model';
export { loadDiffReport } from './loadDiffReport';
export { runAnalyzeDiffPipeline, type RunAnalyzeDiffPipelineInput, type RunAnalyzeDiffPipelineResult } from './runAnalyzeDiffPipeline';
