import { z } from 'zod';

import { unifiedOptionsShape } from '../AllVersionedSchemas/UnifiedBase';

export function singleOrMultiRefinement(data: z.infer<typeof unifiedOptionsShape>, ctx: z.RefinementCtx) {
    const hasItems = !!data.items?.length;
    const hasSingle = !!data.input;

    if (hasItems && hasSingle) {
        ctx.addIssue({
            code: 'custom',
            message: 'Use either items or input/output, but not both options.',
            path: ['items'],
        });
    }

    if (!hasItems && !hasSingle) {
        ctx.addIssue({
            code: 'custom',
            message: 'You must specify either items or input/output',
            path: ['input'],
        });
    }
}
