import { z } from 'zod';

import {
    anomalyDetectionConfigSchemaOrBoolean,
    autoSelectConfigSchemaOrBoolean,
    specAnalysisConfigSchemaOrBoolean,
    swarmConfigSchemaOrBoolean,
    trafficSplitterConfigSchemaOrBoolean,
    workspaceReportConfigSchemaOrBoolean,
} from '../../common/VersionedSchema/CommonSchemas';
import { ModelsLayout } from '../../core/types/enums/ModelsLayout.enum';
import { ModelsMode } from '../../core/types/enums/ModelsMode.enum';
import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

const generateOptionsBaseSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        input: emptyStringToUndefined,
        output: emptyStringToUndefined,
        useHistory: z.boolean().optional(),
        diffReport: emptyStringToUndefined,
        modelsMode: z.enum(ModelsMode).optional(),
        modelsLayout: z.enum(ModelsLayout).optional(),
        strictOpenapi: z.boolean().optional(),
        reportFile: emptyStringToUndefined,
        failOnGovernanceErrors: z.boolean().optional(),
        prettierConfigPath: emptyStringToUndefined,
        tsconfigPath: emptyStringToUndefined,
        eslintConfigPath: emptyStringToUndefined,
        governanceConfig: emptyStringToUndefined,
        cache: z.boolean().optional(),
        cachePath: emptyStringToUndefined,
        cacheStrategy: z.enum(['content', 'entity', 'reuse']).optional(),
        cacheDebug: z.boolean().optional(),
        reuseOnConflict: z.enum(['fail', 'namespace']).optional(),
        autoSelect: autoSelectConfigSchemaOrBoolean.optional(),
        specAnalysis: specAnalysisConfigSchemaOrBoolean.optional(),
        /** @deprecated Use specAnalysis instead. */
        anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
        workspaceReport: workspaceReportConfigSchemaOrBoolean.optional(),
        trafficSplitter: trafficSplitterConfigSchemaOrBoolean.optional(),
        swarm: swarmConfigSchemaOrBoolean.optional(),
        preAnalyze: z.boolean().optional(),
        reuseMode: z.enum(['copy', 'auto-group']).optional(),
    })
    .superRefine((data, ctx) => {
        const hasDirectMode = !!(data.input?.trim() && data.output?.trim());
        const hasInput = !!data.input?.trim();
        const hasConfigPath = !hasDirectMode && !!data.openapiConfig;

        if (hasInput && hasConfigPath) {
            ctx.addIssue({
                code: 'custom',
                message: 'Use either openapiConfig or input/output, but not both options.',
                path: ['openapiConfig'],
            });
        }

        if (!hasInput && !hasConfigPath) {
            ctx.addIssue({
                code: 'custom',
                message: 'You must specify either openapiConfig or input/output',
                path: ['input'],
            });
        }

        if (hasInput && !hasConfigPath) {
            if (!data.input || data.input.trim() === '') {
                ctx.addIssue({
                    code: 'custom',
                    message: '"--input" is required when no valid config file is provided',
                    path: ['input'],
                });
            }

            if (!data.output || data.output.trim() === '') {
                ctx.addIssue({
                    code: 'custom',
                    message: '"--output" is required when no valid config file is provided',
                    path: ['output'],
                });
            }
        }
    });

export const generateOptionsSchema = generateOptionsBaseSchema;

export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
