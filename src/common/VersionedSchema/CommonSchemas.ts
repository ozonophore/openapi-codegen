import { z } from 'zod';

import { EmptySchemaStrategy } from '../../core/types/enums/EmptySchemaStrategy.enum';
import { ModelsMode } from '../../core/types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../../core/types/enums/ValidationLibrary.enum';
import { IMPLEMENTED_ANOMALY_CATEGORIES } from './anomalyDetectorCategories';
import { createBooleanToObjectSchema } from './Utils/createBooleanToObjectSchema';

const anomalyCategorySchema = z.enum(IMPLEMENTED_ANOMALY_CATEGORIES);

/** Output paths */

export const outputPathsSchema = z.object({
    output: z.string().min(1),
    outputCore: z.string().optional(),
    outputServices: z.string().optional(),
    outputModels: z.string().optional(),
    outputSchemas: z.string().optional(),
});

/** Special parameters */

const baseSpecialParametersSchema = z.object({
    useOptions: z.boolean().optional(),
    useUnionTypes: z.boolean().optional(),
});

export const specialParametersSchemas = z.object({
    ...baseSpecialParametersSchema.shape,
    exportCore: z.boolean().optional(),
    exportServices: z.boolean().optional(),
    exportModels: z.boolean().optional(),
    exportSchemas: z.boolean().optional(),
});

export const specialParametersSchemasV2 = z.object({
    ...baseSpecialParametersSchema.shape,
    excludeCoreServiceFiles: z.boolean().optional(),
    includeSchemasFiles: z.boolean().optional(),
});

export const specialParametersSchemasV3 = z.object({
    ...baseSpecialParametersSchema.shape,
    excludeCoreServiceFiles: z.boolean().optional(),
    validationLibrary: z.enum(ValidationLibrary).optional(),
});

export const specialParametersSchemasV4 = z.object({
    ...specialParametersSchemasV3.shape,
    emptySchemaStrategy: z.enum(EmptySchemaStrategy).optional(),
    strictOpenapi: z.boolean().optional(),
    reportFile: z.string().optional(),
    governanceConfig: z.string().optional(),
});

export const strictModeParametersSchema = z.object({
    strictOpenapi: z.boolean().optional(),
    reportFile: z.string().optional(),
    failOnGovernanceErrors: z.boolean().optional(),
});

/** Additional parameters */

export const additionalParametersSchema = z.object({
    clean: z.boolean().optional(),
    request: z.string().optional(),
    plugins: z.array(z.string()).optional(),
    interfacePrefix: z.string().optional(),
    enumPrefix: z.string().optional(),
    typePrefix: z.string().optional(),
    useHistory: z.boolean().optional(),
    diffReport: z.string().optional(),
    modelsMode: z.enum(ModelsMode).optional(),
});

export const modelsConfigSchema = z.object({
    mode: z.enum(ModelsMode).optional(),
    corePath: z.string().optional(),
    modelsPath: z.string().optional(),
});

export const analyzeConfigSchema = z.object({
    reportPath: z.string().optional(),
    useHistory: z.boolean().optional(),
    ignore: z
        .array(
            z.object({
                path: z.string().optional(),
                pattern: z.string().optional(),
                reason: z.string().optional(),
                until: z.string().optional(),
            })
        )
        .optional(),
    failOnBreaking: z.boolean().optional(),
});

export const miraclesConfigSchema = z.object({
    enabled: z.boolean().optional(),
    confidence: z.number().min(0).max(1).optional(),
    types: z.array(z.enum(['RENAME', 'TYPE_COERCION'])).optional(),
});

export const additionalParametersSchemaV2 = additionalParametersSchema.omit({
    clean: true,
});

/** Experimental parameters */

export const experimentalParametersSchema = z.object({
    useCancelableRequest: z.boolean().optional(),
});

export const experimentalParametersSchemaV2 = z.object({
    ...experimentalParametersSchema.shape,
    sortByRequired: z.boolean().optional(),
    useSeparatedIndexes: z.boolean().optional(),
});

/** Phase 1: Auto-selection and anomaly detection */

const autoSelectConfigSchema = z.object({
    enabled: z.boolean().optional(),
    strict: z.boolean().optional(),
    preferSmallBundles: z.boolean().optional(),
    preferStandards: z.boolean().optional(),
});

const specAnalysisConfigSchema = z.object({
    enabled: z.boolean().optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
    reportFormat: z.enum(['json', 'markdown', 'html']).optional(),
    reportPath: z.string().optional(),
    failOnHigh: z.boolean().optional(),
    crossSpec: z.boolean().optional(),
    maxNestingDepth: z.number().int().positive().optional(),
    includeCategories: z.array(anomalyCategorySchema).optional(),
    excludeCategories: z.array(anomalyCategorySchema).optional(),
});

/** @deprecated Use specAnalysis instead. Kept for backward-compatible configs. */
const anomalyDetectionConfigSchema = specAnalysisConfigSchema.extend({
    failOnAnomalies: z.boolean().optional(),
});

/**
 * Boolean shorthand parity with CLI flags (`--auto-select`, etc.).
 * Internal parsed shape is always an object: true/false → { enabled: true/false }
 *
 * Consolidation: Uses createBooleanToObjectSchema utility instead of inline duplicated logic.
 * This eliminates the per-schema copy-paste pattern that was repeated 3 times here,
 * plus 3 more times in autoSelectHelpers and normalizeMarauderConfigBlocks.
 */
export const autoSelectConfigSchemaOrBoolean = createBooleanToObjectSchema(autoSelectConfigSchema);
export const specAnalysisConfigSchemaOrBoolean = createBooleanToObjectSchema(specAnalysisConfigSchema);
/** @deprecated Use specAnalysisConfigSchemaOrBoolean instead. */
export const anomalyDetectionConfigSchemaOrBoolean = createBooleanToObjectSchema(anomalyDetectionConfigSchema);

/** Phase 2: Workspace Report (Swarm-lite) */

const workspaceReportConfigSchema = z.object({
    enabled: z.boolean().optional(),
    path: z.string().optional(),
    format: z.enum(['json', 'markdown', 'both']).optional(),
});

export const workspaceReportConfigSchemaOrBoolean = createBooleanToObjectSchema(workspaceReportConfigSchema);

/** Phase 2: Traffic Splitter — canary migration helper */

const trafficSplitterConfigSchema = z.object({
    enabled: z.boolean().optional(),
    strategy: z.enum(['weighted', 'round-robin', 'header-based', 'header-and-weighted']).optional(),
    oldClientWeight: z.number().optional(),
    newClientWeight: z.number().optional(),
    stickySessions: z.boolean().optional(),
    sessionDuration: z.string().optional(),
    headerName: z.string().optional(),
    headerValues: z.object({ old: z.string(), new: z.string() }).optional(),
});

export const trafficSplitterConfigSchemaOrBoolean = createBooleanToObjectSchema(trafficSplitterConfigSchema);

/** Phase 2: AvatarSwarm manifest generator */

const swarmConfigSchema = z.object({
    enabled: z.boolean().optional(),
    output: z.string().optional(),
});

export const swarmConfigSchemaOrBoolean = createBooleanToObjectSchema(swarmConfigSchema);
