import { z } from 'zod';

import { strictModeParametersSchema } from '../CommonSchemas';
import { unifiedOptionsSchemaV4 } from './UnifiedOptionsSchemaV4';

export const unifiedOptionsSchemaV5 = unifiedOptionsSchemaV4.extend({
    ...strictModeParametersSchema.shape,
    prettierConfigPath: z.string().optional(),
    tsconfigPath: z.string().optional(),
    eslintConfigPath: z.string().optional(),
    cache: z.boolean().optional(),
    cachePath: z.string().optional(),
    cacheStrategy: z.enum(['content', 'entity', 'reuse']).optional(),
    cacheDebug: z.boolean().optional(),
    reuseOnConflict: z.enum(['fail', 'namespace']).optional(),
});

/*
type TUnifiedV5 = TUnifiedV4 & {
    strictOpenapi: boolean | undefined;
    reportFile: string | undefined;
    prettierConfigPath: string | undefined;
    tsconfigPath: string | undefined;
    eslintConfigPath: string | undefined;
    cache: boolean | undefined;
    cachePath: string | undefined;
    cacheStrategy: 'content' | 'entity' | undefined;
    cacheDebug: boolean | undefined;
}
*/
