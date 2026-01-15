import { z } from 'zod';

import { baseCLIOptionsSchema } from './base';

export const updateConfigOptionsSchema = baseCLIOptionsSchema;

export type UpdateConfigOptions = z.infer<typeof updateConfigOptionsSchema>;
