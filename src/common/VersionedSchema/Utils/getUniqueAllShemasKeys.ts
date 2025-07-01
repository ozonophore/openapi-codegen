import { VersionedSchema } from "../Types";
import { joiDescHandler, joiSchemaHandler } from "./joiHandlers";
import { traverseGeneric } from "./traverseGeneric";

/**
 * Get all the unique parameter keys of all Joi schemes in the array
 * @param schemas array of joi schemes
 * @returns All the unique parameter keys of all Joi schemes in the array
 */
export function getUniqueAllShemasKeys(schemas: VersionedSchema<Record<string, any>>[]) {
    const result = new Set<string>();

    traverseGeneric(schemas, [joiSchemaHandler, joiDescHandler], result);

    return result;
}