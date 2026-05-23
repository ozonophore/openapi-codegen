import { z } from 'zod';

import { DEFAULT_OUTPUT_API_DIR } from '../../common/Consts';
import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

const failOnCategorySchema = z.enum(['unusedExports', 'unresolvedImports', 'structuralChanges', 'typingIssues']);

export const analyzeUsageOptionsSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        apiRoot: emptyStringToUndefined.default(DEFAULT_OUTPUT_API_DIR),
        projectRoot: emptyStringToUndefined,
        tsconfig: emptyStringToUndefined,
        reportFile: emptyStringToUndefined,
        mdReport: emptyStringToUndefined,
        failOn: emptyStringToUndefined,
        generatedEntry: emptyStringToUndefined,
    })
    .superRefine((data, ctx) => {
        if (!data.apiRoot) {
            ctx.addIssue({
                code: 'custom',
                message: '"--api-root" is required for analyze-usage command',
                path: ['apiRoot'],
            });
        }

        if (data.failOn && data.failOn !== 'none') {
            for (const category of data.failOn.split(',').map(item => item.trim()).filter(Boolean)) {
                if (!failOnCategorySchema.safeParse(category).success) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `Unsupported --fail-on category: ${category}`,
                        path: ['failOn'],
                    });
                }
            }
        }
    });

export type AnalyzeUsageOptions = z.infer<typeof analyzeUsageOptionsSchema>;
