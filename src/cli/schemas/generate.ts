import { z } from 'zod';

import { ModelsMode } from '../../core/types/enums/ModelsMode.enum';
import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const generateOptionsSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        input: emptyStringToUndefined,
        output: emptyStringToUndefined,
        useHistory: z.boolean().optional(),
        diffReport: emptyStringToUndefined,
        modelsMode: z.enum(ModelsMode).optional(),
        strictOpenapi: z.boolean().optional(),
        reportFile: emptyStringToUndefined,
        useProjectPrettier: z.boolean().optional(),
        useEslintFix: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        const hasInput = !!data.input;
        const hasCongigPath = !!data.openapiConfig;

        if (hasInput && hasCongigPath) {
            ctx.addIssue({
                code: 'custom',
                message: 'Use either openapiConfig or input/output, but not both options.',
                path: ['openapiConfig'],
            });
        }

        if (!hasInput && !hasCongigPath) {
            ctx.addIssue({
                code: 'custom',
                message: 'You must specify either openapiConfig or input/output',
                path: ['input'],
            });
        }

        if (hasInput && !hasCongigPath) {
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

export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
