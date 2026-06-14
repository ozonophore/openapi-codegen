import { z } from 'zod';

import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const requestScaffoldFormatSchema = z.enum(['transport', 'executor', 'adapter']);

export const initOptionsSchema = baseCLIOptionsSchema.extend({
    specsDir: emptyStringToUndefined,
    request: emptyStringToUndefined,
    requestFormat: requestScaffoldFormatSchema.optional(),
    useCancelableRequest: z.boolean().optional(),
    useInteractiveMode: z.boolean().optional(),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
