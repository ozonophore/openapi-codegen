import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema } from '../Types';
import { buildVersionedSchema } from '../Utils/buildVersionedSchema';
import { multiOptionsSchemaV1 } from './MultiOptionsSchemaV1';
import { multiOptionsSchemaV2 } from './MultiOptionsSchemaV2';
import { multiOptionsSchemaV3 } from './MultiOptionsSchemaV3';
import { multiOptionsSchemaV4 } from './MultiOptionsSchemaV4';
import { multiOptionsSchemaV5 } from './MultiOptionsSchemaV5';

export const multiOptionsVersionedSchema: VersionedSchema<z.ZodTypeAny>[] = [
    buildVersionedSchema({
        base: multiOptionsSchemaV1,
        version: 'v1',
        type: EVersionedSchemaType.MULTI_OPTIONS,
    }),
    buildVersionedSchema({
        base: multiOptionsSchemaV2,
        version: 'v2',
        type: EVersionedSchemaType.MULTI_OPTIONS,
    }),
    buildVersionedSchema({
        base: multiOptionsSchemaV3,
        version: 'v3',
        type: EVersionedSchemaType.MULTI_OPTIONS,
    }),
    buildVersionedSchema({
        base: multiOptionsSchemaV4,
        version: 'v4',
        type: EVersionedSchemaType.MULTI_OPTIONS,
    }),
    buildVersionedSchema({
        base: multiOptionsSchemaV5,
        version: 'v5',
        type: EVersionedSchemaType.MULTI_OPTIONS,
    }),
];
