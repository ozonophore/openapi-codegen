import { z } from 'zod';

function collectKeys(schema: z.ZodTypeAny, result: Set<string>) {
    if (!(schema instanceof z.ZodObject)) {
        return;
    }

    const shape = schema.shape;

    for (const key of Object.keys(shape)) {
        result.add(key);

        const fieldSchema = shape[key];

        // если поле — вложенный объект, идём глубже
        if (fieldSchema instanceof z.ZodObject) {
            collectKeys(fieldSchema, result);
        }
    }
}

/**
 * Get all the unique parameter keys of all Joi schemes in the array
 * @param schemas array of joi schemes
 * @returns All the unique parameter keys of all Joi schemes in the array
 */
export function getUniqueKeysFromSchemas(schemas: z.ZodTypeAny[]): Set<string> {
    const result = new Set<string>();

    for (const schema of schemas) {
        collectKeys(schema, result);
    }

    return result;
}
