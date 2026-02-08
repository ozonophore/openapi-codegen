import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema } from '../Types';
import { buildVersionedSchema } from '../Utils/buildVersionedSchema';
import { optionsSchemaV1 } from './OptionsSchemaV1';
import { optionsSchemaV2 } from './OptionsSchemaV2';
import { optionsSchemaV3 } from './OptionsSchemaV3';
import { optionsSchemaV4 } from './OptionsSchemaV4';

export const optionsVersionedSchemas: VersionedSchema<z.ZodTypeAny>[] = [
    buildVersionedSchema({
        version: 'v1',
        base: optionsSchemaV1,
        type: EVersionedSchemaType.OPTIONS,
    }),
    buildVersionedSchema({
        version: 'v2',
        base: optionsSchemaV2,
        type: EVersionedSchemaType.OPTIONS,
    }),
    buildVersionedSchema({
        version: 'v3',
        base: optionsSchemaV3,
        type: EVersionedSchemaType.OPTIONS,
    }),
    buildVersionedSchema({
        version: 'v4',
        base: optionsSchemaV4,
        type: EVersionedSchemaType.OPTIONS,
    }),
];
