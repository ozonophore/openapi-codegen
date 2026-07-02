import { z } from 'zod';

import { DEFAULT_ANALYZE_USAGE_REPORT_PATH } from '../../common/Consts';
import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const analyzeUsageOptionsSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        sourcePath: emptyStringToUndefined,
        projectPath: emptyStringToUndefined,
        tsconfigPath: emptyStringToUndefined,
        output: emptyStringToUndefined.default(DEFAULT_ANALYZE_USAGE_REPORT_PATH),
        check: z.boolean().optional(),
        diffReport: emptyStringToUndefined.describe('Path to analyze-diff report JSON for rename miracle validation'),
    })
    .superRefine((data, ctx) => {
        if (!data.sourcePath) {
            ctx.addIssue({
                code: 'custom',
                message: '"--sourcePath" (-s) is required for analyze-usage command',
                path: ['sourcePath'],
            });
        }

        if (!data.projectPath) {
            ctx.addIssue({
                code: 'custom',
                message: '"--projectPath" (-p) is required for analyze-usage command',
                path: ['projectPath'],
            });
        }
    });

export type AnalyzeUsageOptions = z.infer<typeof analyzeUsageOptionsSchema>;
