import { z } from 'zod';

import { emptyStringToUndefined } from './base';

export const healSchema = z.object({
    specUrl: z.string().min(1, 'specUrl is required'),
    localSpec: z.string().min(1, 'localSpec is required'),
    output: emptyStringToUndefined,
    monitorInterval: z.union([z.string(), z.number()]).optional(),
    logFile: emptyStringToUndefined,
    once: z.boolean().optional(),
    autoApplyNonBreaking: z.boolean().optional(),
    notifyOnBreaking: z.boolean().optional(),
    createBackupBeforeApply: z.boolean().optional(),
});

export type THealOptions = z.infer<typeof healSchema>;
