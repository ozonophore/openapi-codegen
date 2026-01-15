import { z } from 'zod';

import { EOptionType } from '../initOpenApiConfig/Enums';
import { baseCLIOptionsSchema } from './base';

export const initOptionsSchema = baseCLIOptionsSchema.extend({
    type: z.nativeEnum(EOptionType).optional().default(EOptionType.OPTION),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
