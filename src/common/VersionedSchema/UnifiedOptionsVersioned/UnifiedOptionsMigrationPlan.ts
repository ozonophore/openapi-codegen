import { SchemaMigrationPlan } from "../Types";

export const unifiedOptionsMigrationPlan: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    // Migration from OPTIONS v4 to UNIFIED_OPTIONS v1
    // OPTIONS v4 already has input/output structure, so we just pass it through
    // Unified schema supports this format directly
    {
        fromVersion: 'OPTIONS_v4',
        toVersion: 'UNIFIED_v1',
        migrate: (oldVersion) => {
            // OPTIONS v4 structure is already compatible with unified schema
            // Just return as-is, unified schema will handle input/output
            return { ...oldVersion };
        },
    },
    // Migration from MULTI_OPTIONS v5 to UNIFIED_OPTIONS v1
    // MULTI_OPTIONS v5 has items array, which unified schema also supports
    {
        fromVersion: 'MULTI_OPTIONS_v5',
        toVersion: 'UNIFIED_v1',
        migrate: (oldVersion) => {
            // MULTI_OPTIONS v5 structure with items is already compatible
            // Just return as-is, unified schema will handle items
            return { ...oldVersion };
        },
    },
];