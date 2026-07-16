import { TRawOptions } from '../common/TRawOptions';
import { OpenApiClient } from './OpenApiClient';
import { validateRawOptions } from './utils/validateRawOptions';

export type { Anomaly, AnomalyDetectionConfig, AnomalyReport, SpecAnalysisConfig } from './analysis';
export { runAnomalyDetection } from './analysis';
export type { AutoSelectConfig, AutoSelectResult, ProjectAnalysis, Recommendation } from './autoSelect';
export { AutoSelector } from './autoSelect';
export { AvatarSwarmGenerator } from './avatarSwarm/AvatarSwarmGenerator';
export type { AvatarDescriptor, SwarmConfig, SwarmManifest, SwarmSharedModel } from './avatarSwarm/types';
export { writeSwarmOutput } from './avatarSwarm/writeSwarmOutput';
export { generateTrafficSplitterModule } from './migration/generateTrafficSplitterModule';
export { TrafficSplitter } from './migration/TrafficSplitter';
export type { SessionStats, TrafficSplitterConfig, TrafficSplittingResult } from './migration/types';
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
export { buildWorkspaceReport } from './workspaceReport/buildWorkspaceReport';
export type { WorkspaceReport, WorkspaceReportConfig, WorkspaceSpecSummary } from './workspaceReport/types';
export { writeWorkspaceReport } from './workspaceReport/writeWorkspaceReport';

export async function generate(rawOptions: TRawOptions): Promise<void> {
    await validateRawOptions(rawOptions);

    const openApiClient = new OpenApiClient();
    await openApiClient.generate(rawOptions);
}
