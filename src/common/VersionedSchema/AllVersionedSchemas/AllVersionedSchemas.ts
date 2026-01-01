import { EVersionedSchemaType } from '../Enums';
import { multiOptionsVersionedSchema } from '../MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsVersionedSchemas } from '../OptionsVersioned/OptionsVersionedSchemas';
import { VersionedSchema } from '../Types';
import { unifiedOptionsSchemaV1 } from './UnifiedOptionsSchemaV1';
import { unifiedOptionsSchemaV2 } from './UnifiedOptionsSchemaV2';

/**
 * Adds a prefix to all version strings in a versioned schema array.
 */
function addVersionPrefix(
    schemas: VersionedSchema<Record<string, any>>[],
    prefix: string
): VersionedSchema<Record<string, any>>[] {
    return schemas.map(schema => ({
        ...schema,
        version: `${prefix}_${schema.version}`,
    }));
}

/**
 * Unified array of all versioned schemas with prefixed versions.
 * This allows migration from any old schema version to the latest unified schema.
 * Reuses existing schema arrays to avoid code duplication.
 */
export const allVersionedSchemas: VersionedSchema<Record<string, any>>[] = [
    // OPTIONS schemas with prefix
    ...addVersionPrefix(optionsVersionedSchemas, 'OPTIONS'),
    
    // MULTI_OPTIONS schemas with prefix
    ...addVersionPrefix(multiOptionsVersionedSchema, 'MULTI_OPTIONS'),
    
    // UNIFIED_OPTIONS schemas (latest)
    {
        version: 'UNIFIED_v1',
        schema: unifiedOptionsSchemaV1,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    },
    {
        version: 'UNIFIED_v2',
        schema: unifiedOptionsSchemaV2,
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
    }
];