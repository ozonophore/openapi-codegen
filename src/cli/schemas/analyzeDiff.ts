import { z } from 'zod';

import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const analyzeDiffOptionsSchema = z
    .object({
        ...baseCLIOptionsSchema.shape,
        input: emptyStringToUndefined,
        compareWith: emptyStringToUndefined,
        git: emptyStringToUndefined,
        outputReport: emptyStringToUndefined,
    })
    .superRefine((data, ctx) => {
        const hasInput = !!data.input;

        if (!hasInput) {
            ctx.addIssue({
                code: 'custom',
                message: '"--input" is required for analyze-diff command',
                path: ['input'],
            });
        }
    });

export type AnalyzeDiffOptions = z.infer<typeof analyzeDiffOptionsSchema>;
