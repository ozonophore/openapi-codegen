import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import type { DiffEntry, IgnoreRule } from './types';

/**
 * Проверяет, активно ли правило игнорирования по полю `until`.
 * @param rule правило игнорирования
 * @returns true если правило активно или не содержит валидной даты
 */
const isRuleActive = (rule: IgnoreRule): boolean => {
    if (!rule.until) return true;
    const timestamp = Date.parse(rule.until);
    if (Number.isNaN(timestamp)) return true;
    return Date.now() <= timestamp;
};

/**
 * Проверяет, соответствует ли запись diff правилу игнорирования.
 * Совмещает полное совпадение пути, префикс и регулярные выражения.
 * @param entry запись отличия
 * @param rule правило игнорирования
 * @returns true если правило применимо к записи
 */
export const matchesIgnoreRule = (entry: DiffEntry, rule: IgnoreRule): boolean => {
    if (!isRuleActive(rule)) return false;
    if (rule.path) {
        if (entry.path === rule.path) return true;
        if (entry.path.startsWith(`${rule.path}.`)) return true;
        if (entry.path.startsWith(`${rule.path}[`)) return true;
        if (entry.path.startsWith(`${rule.path}/`)) return true;
    }
    if (rule.pattern) {
        try {
            const regex = new RegExp(rule.pattern);
            return regex.test(entry.path);
        } catch (err) {
            APP_LOGGER.warn(LOGGER_MESSAGES.ANALYZE_DIFF.INVALID_IGNORE_PATTERN(rule.pattern, String(err)));
            return false;
        }
    }
    return false;
};

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
