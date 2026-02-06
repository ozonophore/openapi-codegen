import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { multiOptionsVersionedSchema } from '../MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsVersionedSchemas } from '../OptionsVersioned/OptionsVersionedSchemas';
import { VersionedSchema } from '../Types';
import { unifiedVersionedSchemas } from './UnifiedVersionedSchemas';

/**
 * Adds a prefix to all version strings in a versioned schema array.
 */
function addVersionPrefix<TSchema extends z.ZodTypeAny>(
    schemas: VersionedSchema<TSchema>[],
    prefix: string
): VersionedSchema<TSchema>[] {
    return schemas.map(schema => ({
        ...schema,
        version: `${prefix}_${schema.version}`,
    }));
}

/**
 * Unified array of all versioned schemas with prefixed versions.
 * This allows migration from any old schema version to the latest unified schema.
 * Reuses existing schema arrays to avoid code duplication.
 * 
 * ВАЖНО!
 * После обновления allVersionedSchemas необходимо обновить файл compatibilityCases
 * src/common/VersionedSchema/Utils/__mocks__/compatibilityCases.ts
 */
export const allVersionedSchemas: VersionedSchema<z.ZodTypeAny>[] = [
    // OPTIONS schemas with prefix
    ...addVersionPrefix(optionsVersionedSchemas, EVersionedSchemaType.OPTIONS),
    
    // MULTI_OPTIONS schemas with prefix
    ...addVersionPrefix(multiOptionsVersionedSchema, EVersionedSchemaType.MULTI_OPTIONS),
    
    // UNIFIED_OPTIONS schemas (latest)
    ...addVersionPrefix(unifiedVersionedSchemas, EVersionedSchemaType.UNIFIED_OPTIONS)
];