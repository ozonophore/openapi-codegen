import Joi from 'joi';

import { handleJoiDescription, handleJoiSchema } from './joiHandlers';
import { traverseObjectStructure } from './traverseObjectStructure';

/**
 * Get all the unique parameter keys of all Joi schemes in the array
 * @param schemas array of joi schemes
 * @returns All the unique parameter keys of all Joi schemes in the array
 */
export function getUniqueKeysFromSchemas(schemas: Joi.Schema[]) {
    const result = new Set<string>();

    for (const schema of schemas) {
        traverseObjectStructure(schema, [handleJoiSchema, handleJoiDescription], result);
    }

    return result;
}
