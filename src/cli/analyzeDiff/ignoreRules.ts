import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import type { IgnoreRule } from '../../core/diffReport';

/**
 * Извлекает правила игнорирования из загруженной конфигурации openapi.
 * @param configData загруженные данные конфигурации
 * @returns список правил ignore
 */
const getIgnoreRulesFromConfig = (configData: Record<string, any> | Record<string, any>[] | null): IgnoreRule[] => {
    if (!configData) return [];
    if (Array.isArray(configData)) {
        const withAnalyze = configData.find(item => item?.analyze?.ignore);
        return (withAnalyze?.analyze?.ignore as IgnoreRule[]) ?? [];
    }
    return (configData.analyze?.ignore as IgnoreRule[]) ?? [];
};

export const loadIgnoreRules = (openapiConfigPath?: string): IgnoreRule[] => {
    const configData = loadConfigIfExists(openapiConfigPath);
    return getIgnoreRulesFromConfig(configData);
};
