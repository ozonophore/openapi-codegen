import { normalizeMarauderBoolean } from './createBooleanToObjectSchema';

/**
 * Applies Marauder boolean normalization on root and per-item blocks for v5→v6 migration.
 */
export function normalizeMarauderConfigBlocks(data: Record<string, any>): Record<string, any> {
    const result = { ...data };

    if ('autoSelect' in result) {
        result.autoSelect = normalizeMarauderBoolean(result.autoSelect);
    }
    if ('specAnalysis' in result) {
        result.specAnalysis = normalizeMarauderBoolean(result.specAnalysis);
    }
    if ('anomalyDetection' in result) {
        result.anomalyDetection = normalizeMarauderBoolean(result.anomalyDetection);
    }

    if (Array.isArray(result.items)) {
        result.items = result.items.map((item: Record<string, any>) => {
            if (!item || typeof item !== 'object') {
                return item;
            }

            const normalizedItem = { ...item };
            if ('specAnalysis' in normalizedItem) {
                normalizedItem.specAnalysis = normalizeMarauderBoolean(normalizedItem.specAnalysis);
            }
            if ('anomalyDetection' in normalizedItem) {
                normalizedItem.anomalyDetection = normalizeMarauderBoolean(normalizedItem.anomalyDetection);
            }
            return normalizedItem;
        });
    }

    return result;
}
