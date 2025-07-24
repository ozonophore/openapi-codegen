import Joi from "joi";

import { joiDescHandler, joiSchemaHandler } from "./joiHandlers";
import { traverseGeneric } from "./traverseGeneric";

/**
 * Get all the unique parameter keys of all Joi schemes in the array
 * @param schemas array of joi schemes
 * @returns All the unique parameter keys of all Joi schemes in the array
 */
export function getUniqueAllShemasKeys(schemas: Joi.Schema[]) {
    const result = new Set<string>();

    for (const schema of schemas) {
        traverseGeneric(schema, [joiSchemaHandler, joiDescHandler], result);
    }

    return result;
}