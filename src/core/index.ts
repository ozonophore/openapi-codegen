import { TRawOptions } from '../common/TRawOptions';
import { OpenApiClient } from './OpenApiClient';
import { validateRawOptions } from './utils/validateRawOptions';

export type { Anomaly, AnomalyDetectionConfig, AnomalyReport, SpecAnalysisConfig } from './analysis';
export { runAnomalyDetection } from './analysis';
export type { AutoSelectConfig, AutoSelectResult, ProjectAnalysis, Recommendation } from './autoSelect';
export { AutoSelector } from './autoSelect';
export type { OpenApiGeneratorPlugin, SchemaTypeOverrideContext, SchemaTypeOverrideInput, TOpenApiVersion } from './plugins';
export type { ApplySemanticDiffPluginHooksResult, PluginHookDiagnostic, PluginHookName } from './plugins';
export { applySemanticDiffPluginHooks } from './plugins';
export type { ConsumerProjectInfo, ProbeOptions, ProjectContextOptions, UnifiedProjectProfile } from './projectProbe';
export { ProjectContext, ProjectProbe } from './projectProbe';
export type { OptionsSlice, ReuseLookupResult, ReuseStoreManifest } from './reuseStore';
export { ReuseStore } from './reuseStore';
export { CodegenSpecAnalyzer, filterSpecFindings, runPerSpecAnalysis } from './specAnalysis/CodegenSpecAnalyzer';
export { runCrossSpecAnalysis } from './specAnalysis/CrossSpecAnalyzer';
export { createSpecAnalysisAccumulator, finalizeSpecAnalysis, mergeSpecAnalysisConfigAcrossItems, runSpecAnalysis } from './specAnalysis/runSpecAnalysis';
export type { SpecAnalysisReport, SpecFinding } from './specAnalysis/types';
export { HttpClient } from './types/enums/HttpClient.enum';
export { ValidationLibrary } from './types/enums/ValidationLibrary.enum';

export async function generate(rawOptions: TRawOptions): Promise<void> {
    await validateRawOptions(rawOptions);

    const openApiClient = new OpenApiClient();
    await openApiClient.generate(rawOptions);
}
