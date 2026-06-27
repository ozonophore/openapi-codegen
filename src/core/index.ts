import { TRawOptions } from '../common/TRawOptions';
import { OpenApiClient } from './OpenApiClient';
import { validateRawOptions } from './utils/validateRawOptions';

export type { OpenApiGeneratorPlugin, SchemaTypeOverrideContext, SchemaTypeOverrideInput, TOpenApiVersion } from './plugins';
export type { ApplySemanticDiffPluginHooksResult, PluginHookDiagnostic, PluginHookName } from './plugins';
export { applySemanticDiffPluginHooks } from './plugins';
export { HttpClient } from './types/enums/HttpClient.enum';
export { ValidationLibrary } from './types/enums/ValidationLibrary.enum';

// Phase 1: Auto-selection and anomaly detection
export type { Anomaly, AnomalyDetectionConfig, AnomalyExploitationConfig, AnomalyReport, ExploitationResult, OptimizationOpportunity } from './analysis';
export { AnomalyDetector, AnomalyExploiter, runAnomalyDetection, runAnomalyExploitation } from './analysis';
export type { AutoSelectConfig, AutoSelectResult, ProjectAnalysis, Recommendation } from './autoSelect';
export { AutoSelector } from './autoSelect';
export type { ConsumerProjectInfo, ProbeOptions, ProjectContextOptions, UnifiedProjectProfile } from './projectProbe';
export { ProjectContext, ProjectProbe } from './projectProbe';

// Phase 2: Gradual migration, self-healing, and anomaly exploitation
export type { ChangeDetectionResult, HealingEvent, MigrationConfig, MigrationPhase, MigrationPlan, SelfHealingConfig, SpecChange, TrafficSplitterConfig, TrafficSplittingResult } from './migration';
export { ChangeDetector, generateMigrationRuntimeHelper, GradualMigrationPlanner, TrafficSplitter } from './migration';
export { generateTrafficSplitterModule } from './migration/generateTrafficSplitterModule';
export { SelfHealingClient } from './monitoring';

// Phase 3: Avatar Swarm microservices
export * from './microservices';

export async function generate(rawOptions: TRawOptions): Promise<void> {
    await validateRawOptions(rawOptions);

    const openApiClient = new OpenApiClient();
    await openApiClient.generate(rawOptions);
}
