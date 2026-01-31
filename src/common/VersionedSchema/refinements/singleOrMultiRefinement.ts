import { z } from 'zod';

import { unifiedOptionsShape } from '../AllVersionedSchemas/UnifiedBase';

export function singleOrMultiRefinement(data: z.infer<typeof unifiedOptionsShape>, ctx: z.RefinementCtx) {
    const hasItems = !!data.items?.length;
    const hasSingle = !!data.input;

    if (hasItems && hasSingle) {
        ctx.addIssue({
            code: 'custom',
            message: 'Используй либо items, либо input/output, но не оба варианта',
            path: ['items'],
        });
    }

    if (!hasItems && !hasSingle) {
        ctx.addIssue({
            code: 'custom',
            message: 'Необходимо указать либо items, либо input/output',
            path: ['input'],
        });
    }
}
