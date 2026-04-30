import { z } from 'zod';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const analyzeDiffOptionsSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        input: emptyStringToUndefined,
        compareWith: emptyStringToUndefined,
        git: emptyStringToUndefined,
        outputReport: emptyStringToUndefined.default(DEFAULT_ANALYZE_DIFF_REPORT_PATH),
        governanceConfig: emptyStringToUndefined,
        strictPluginMode: z.boolean().optional(),
        ci: z.boolean().optional(),
        allowBreaking: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.input) {
            ctx.addIssue({
                code: 'custom',
                message: '"--input" is required for analyze-diff command',
                path: ['input'],
            });
        }

        // Old spec source is resolved as compareWith ?? git at runtime.
    });

export type AnalyzeDiffOptions = z.infer<typeof analyzeDiffOptionsSchema>;
