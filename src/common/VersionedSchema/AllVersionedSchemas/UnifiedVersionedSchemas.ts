import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema } from '../Types';
import { buildVersionedSchema } from '../Utils/buildVersionedSchema';
import { unifiedOptionsSchemaV1 } from './UnifiedOptionsSchemaV1';
import { unifiedOptionsSchemaV2 } from './UnifiedOptionsSchemaV2';
import { unifiedOptionsSchemaV3 } from './UnifiedOptionsSchemaV3';
import { unifiedOptionsSchemaV4 } from './UnifiedOptionsSchemaV4';
import { unifiedOptionsSchemaV5 } from './UnifiedOptionsSchemaV5';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends readonly unknown[]> = T extends readonly [...infer _, infer L] ? L : never;

const unifiedSchemaDefinitions = [
    { version: 'v1', base: unifiedOptionsSchemaV1 },
    { version: 'v2', base: unifiedOptionsSchemaV2 },
    { version: 'v3', base: unifiedOptionsSchemaV3 },
    { version: 'v4', base: unifiedOptionsSchemaV4 },
    { version: 'v5', base: unifiedOptionsSchemaV5 }
] as const;

type UnifiedSchemaDefinitions = typeof unifiedSchemaDefinitions;
type LatestUnifiedDefinition = Last<UnifiedSchemaDefinitions>;

export const unifiedVersionedSchemas: VersionedSchema<z.ZodTypeAny>[] = unifiedSchemaDefinitions.map(({ version, base }) =>
    buildVersionedSchema({
        version,
        base,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    })
);

const latestUnifiedDefinition = unifiedSchemaDefinitions[unifiedSchemaDefinitions.length - 1] as LatestUnifiedDefinition;

export const rawOptionsSchema: LatestUnifiedDefinition['base'] = latestUnifiedDefinition.base;

export const flatOptionsSchema = rawOptionsSchema.omit({ items: true }).extend({
    input: z.string().min(1, 'Input is required'),
    output: z.string().min(1, 'Output is required'),
});
