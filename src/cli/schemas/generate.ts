import { z } from 'zod';

import { anomalyDetectionConfigSchemaOrBoolean, autoSelectConfigSchemaOrBoolean } from '../../common/VersionedSchema/CommonSchemas';
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
        strictOpenapi: z.boolean().optional(),
        reportFile: emptyStringToUndefined,
        failOnGovernanceErrors: z.boolean().optional(),
        prettierConfigPath: emptyStringToUndefined,
        tsconfigPath: emptyStringToUndefined,
        eslintConfigPath: emptyStringToUndefined,
        governanceConfig: emptyStringToUndefined,
        cache: z.boolean().optional(),
        cachePath: emptyStringToUndefined,
        cacheStrategy: z.enum(['content', 'entity']).optional(),
        cacheDebug: z.boolean().optional(),
        autoSelect: autoSelectConfigSchemaOrBoolean.optional(),
        anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
        exploitAnomalies: z.boolean().optional(),
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

export const generateOptionsSchema = generateOptionsBaseSchema.transform(data => {
    const { exploitAnomalies, ...rest } = data;
    let anomalyDetection = rest.anomalyDetection;
    let anomalyExploitation: { enabled: boolean } | undefined;

    if (exploitAnomalies) {
        anomalyExploitation = { enabled: true };
        anomalyDetection = { ...(anomalyDetection ?? {}), enabled: true };
    }

    return {
        ...rest,
        anomalyDetection,
        ...(anomalyExploitation !== undefined ? { anomalyExploitation } : {}),
    };
});

export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
