import Joi from 'joi';

import { multiOptionsSchemaV4 } from './MultiOptionsSchemaV4';
import { mergeObjectSchemas } from './Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (v5)
 */
export const multiOptionsSchemaV5 = mergeObjectSchemas(multiOptionsSchemaV4, Joi.object({
    useSeparatedIndexes: Joi.boolean().optional(),
}))
