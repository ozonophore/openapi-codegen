import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema } from '../Types';
import { buildVersionedSchema } from '../Utils/buildVersionedSchema';
import { unifiedOptionsSchemaV1 } from './UnifiedOptionsSchemaV1';
import { unifiedOptionsSchemaV2 } from './UnifiedOptionsSchemaV2';
import { unifiedOptionsSchemaV3 } from './UnifiedOptionsSchemaV3';

export const unifiedVersionedSchemas: VersionedSchema<z.ZodTypeAny>[] = [
    buildVersionedSchema({
        version: 'v1',
        base: unifiedOptionsSchemaV1,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    }),
    buildVersionedSchema({
        version: 'v2',
        base: unifiedOptionsSchemaV2,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    }),
    buildVersionedSchema({
        version: 'v3',
        base: unifiedOptionsSchemaV3,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    }),
];

export const rawOptionsSchema = unifiedOptionsSchemaV3;

export const flatOptionsSchema = rawOptionsSchema.omit({ items: true }).extend({
    input: z.string().min(1, 'Input is required'),
    output: z.string().min(1, 'Output is required'),
});
