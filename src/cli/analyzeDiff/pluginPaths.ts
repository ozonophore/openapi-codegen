import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';

/**
 * Reads plugin paths from openapi config for semantic diff hooks.
 */
export function resolvePluginPaths(openapiConfig?: string): string[] {
    const configData = loadConfigIfExists(openapiConfig);
    const config = convertArrayToObject(configData) as { plugins?: unknown };
    return Array.isArray(config.plugins) ? config.plugins.filter((item): item is string => typeof item === 'string' && !!item.trim()) : [];
}
