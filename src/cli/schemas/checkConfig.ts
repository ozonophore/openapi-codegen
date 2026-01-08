import { z } from 'zod';

import { baseCLIOptionsSchema } from './base';

export const checkConfigOptionsSchema = baseCLIOptionsSchema;

export type CheckConfigOptions = z.infer<typeof checkConfigOptionsSchema>;
