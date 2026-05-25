import { z } from 'zod'

import { strictModeParametersSchema } from '../CommonSchemas';
import { unifiedOptionsSchemaV4 } from './UnifiedOptionsSchemaV4';

export const unifiedOptionsSchemaV5 = unifiedOptionsSchemaV4.extend({
    ...strictModeParametersSchema.shape,
    useProjectPrettier: z.boolean().optional(),
    useEslintFix: z.boolean().optional(),
    cache: z.boolean().optional(),
    cachePath: z.string().optional(),
    cacheStrategy: z.enum(['content', 'entity']).optional(),
    cacheDebug: z.boolean().optional(),
});

/*
type TUnifiedV5 = TUnifiedV4 & {
    strictOpenapi: boolean | undefined;
    reportFile: string | undefined;
    useProjectPrettier: boolean | undefined;
    useEslintFix: boolean | undefined;
}
*/
