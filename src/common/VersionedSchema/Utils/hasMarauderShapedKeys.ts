const ROOT_MARAUDER_KEYS = ['autoSelect', 'specAnalysis', 'anomalyDetection'] as const;
const ITEM_MARAUDER_KEYS = ['specAnalysis', 'anomalyDetection'] as const;

/**
 * Returns true when input contains Marauder config blocks at root or inside `items[]`.
 */
export function hasMarauderShapedKeys(data: Record<string, any>): boolean {
    if (ROOT_MARAUDER_KEYS.some(key => key in data)) {
        return true;
    }

    if (!Array.isArray(data.items)) {
        return false;
    }

    return data.items.some(item => item && typeof item === 'object' && ITEM_MARAUDER_KEYS.some(key => key in item));
}
