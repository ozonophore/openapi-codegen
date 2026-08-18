import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import type { IgnoreMatchEntry, IgnoreRule } from './ignoreRule.model';

/**
 * Проверяет, активно ли правило игнорирования по полю `until`.
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
 */
export const matchesIgnoreRule = (entry: IgnoreMatchEntry, rule: IgnoreRule): boolean => {
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
