import { z } from 'zod';

import { baseCLIOptionsSchema, emptyStringToUndefined } from './base';

export const previewChangesSchema = z.object({
    ...baseCLIOptionsSchema.shape,
    generatedDir: emptyStringToUndefined,
    previewDir: emptyStringToUndefined,
    diffDir: emptyStringToUndefined,
});

export type TPreviewChangesOptions = z.infer<typeof previewChangesSchema>;
