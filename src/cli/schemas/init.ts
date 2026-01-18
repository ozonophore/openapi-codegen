import { z } from 'zod';

import { DEFAULT_CUSTOM_REQUEST_PATH, DEFAULT_SPECS_DIR } from '../../common/Consts';
import { baseCLIOptionsSchema } from './base';

export const initOptionsSchema = baseCLIOptionsSchema.extend({
    specsDir: z.string().min(1).optional().default(DEFAULT_SPECS_DIR),
    request: z.string().min(1).optional().default(DEFAULT_CUSTOM_REQUEST_PATH),
    useCancelableRequest: z.boolean().optional().default(false),
    useInteractiveMode: z.boolean().optional().default(false),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
