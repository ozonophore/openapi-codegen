import { z } from 'zod';

import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const initOptionsSchema = baseCLIOptionsSchema.extend({
    specsDir: emptyStringToUndefined,
    request: emptyStringToUndefined,
    useCancelableRequest: z.boolean().optional(),
    useInteractiveMode: z.boolean().optional(),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
