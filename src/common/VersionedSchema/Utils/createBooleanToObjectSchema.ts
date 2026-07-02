import { z } from 'zod';

/**
 * Consolidates boolean → { enabled: boolean } normalization pattern
 * Used for Marauder parameters: autoSelect, anomalyDetection, anomalyExploitation
 *
 * Eliminates duplication across:
 * - 3× normalizeAutoSelectConfig/anomalyDetectionConfig/anomalyExploitationConfig
 * - booleanShorthandToEnabledObject in CommonSchemas
 * - normalizeMarauderConfigBlocks in migration utils
 */

/**
 * Creates a Zod schema that accepts both boolean shorthand and full object configuration
 * Boolean values are normalized to { enabled: boolean }
 * Objects are passed through unchanged
 *
 * @param configSchema - The base configuration schema (e.g., autoSelectConfigSchema)
 * @returns Zod schema accepting boolean | object, outputting object shape
 *
 * @example
 * // Before (duplicated 3+ times):
 * export const booleanShorthandToEnabledObject = <T extends z.ZodTypeAny>(schema: T) =>
 *     z.preprocess(value => (typeof value === 'boolean' ? { enabled: value } : value), schema);
 *
 * export const autoSelectConfigSchemaOrBoolean = booleanShorthandToEnabledObject(autoSelectConfigSchema);
 * export const anomalyDetectionConfigSchemaOrBoolean = booleanShorthandToEnabledObject(anomalyDetectionConfigSchema);
 *
 * // After (single utility):
 * export const autoSelectConfigSchemaOrBoolean = createBooleanToObjectSchema(autoSelectConfigSchema);
 * export const anomalyDetectionConfigSchemaOrBoolean = createBooleanToObjectSchema(anomalyDetectionConfigSchema);
 */
export function createBooleanToObjectSchema<T extends z.ZodTypeAny>(configSchema: T): z.ZodType<z.infer<T>> {
    return z.preprocess(value => {
        // Transform boolean → { enabled: boolean }
        if (typeof value === 'boolean') {
            return { enabled: value };
        }
        // Pass through object or undefined unchanged
        return value;
    }, configSchema) as z.ZodType<z.infer<T>>;
}

/**
 * Same as createBooleanToObjectSchema but returns .optional()
 * Used when the Marauder parameter is optional in the schema
 *
 * @example
 * export const autoSelectConfigSchemaOrBoolean =
 *     createOptionalBooleanToObjectSchema(autoSelectConfigSchema);
 */
export function createOptionalBooleanToObjectSchema<T extends z.ZodTypeAny>(configSchema: T): z.ZodOptional<z.ZodType<z.infer<T>>> {
    return createBooleanToObjectSchema(configSchema).optional();
}

/**
 * Runtime normalization helper (used outside of Zod)
 * Transforms boolean → { enabled: boolean }
 * Used in:
 * - CLI merge logic (mergeAutoSelectConfig, etc.)
 * - Config migration paths
 * - Runtime type coercion
 *
 * @example
 * const config = { autoSelect: true };
 * const normalized = normalizeMarauderBoolean(config.autoSelect);
 * // → { enabled: true }
 */
export function normalizeMarauderBoolean<T extends Record<string, any>>(value: T | boolean | undefined): T | undefined {
    if (value === true) {
        return { enabled: true } as unknown as T;
    }
    if (value === false) {
        return { enabled: false } as unknown as T;
    }
    return value as T | undefined;
}
