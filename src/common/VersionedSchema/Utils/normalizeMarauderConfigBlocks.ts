import { normalizeMarauderBoolean } from './createBooleanToObjectSchema';

/**
 * Applies Marauder boolean normalization on root and per-item blocks for v5→v6 migration.
 */
export function normalizeMarauderConfigBlocks(data: Record<string, any>): Record<string, any> {
    const result = { ...data };

    if ('autoSelect' in result) {
        result.autoSelect = normalizeMarauderBoolean(result.autoSelect);
    }
    if ('anomalyDetection' in result) {
        result.anomalyDetection = normalizeMarauderBoolean(result.anomalyDetection);
    }
    if ('anomalyExploitation' in result) {
        result.anomalyExploitation = normalizeMarauderBoolean(result.anomalyExploitation);
    }

    if (Array.isArray(result.items)) {
        result.items = result.items.map((item: Record<string, any>) => {
            if (!item || typeof item !== 'object') {
                return item;
            }

            const normalizedItem = { ...item };
            if ('anomalyDetection' in normalizedItem) {
                normalizedItem.anomalyDetection = normalizeMarauderBoolean(normalizedItem.anomalyDetection);
            }
            if ('anomalyExploitation' in normalizedItem) {
                normalizedItem.anomalyExploitation = normalizeMarauderBoolean(normalizedItem.anomalyExploitation);
            }
            return normalizedItem;
        });
    }

    return result;
}
