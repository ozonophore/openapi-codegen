import { existsSync, readFileSync } from 'fs';
import path from 'path';

type ExecutorConfigItem = Record<string, unknown>;

const collectConfigItems = (configData: Record<string, unknown>): ExecutorConfigItem[] => {
    if (Array.isArray(configData.items)) {
        return configData.items as ExecutorConfigItem[];
    }

    return [configData];
};

/**
 * Validates request/customExecutorPath semantics after schema migration.
 * Returns human-readable warnings (non-fatal).
 */
export function validateExecutorSetup(configData: Record<string, unknown>, cwd: string = process.cwd()): string[] {
    const warnings: string[] = [];
    const rootRequest = typeof configData.request === 'string' ? configData.request : undefined;
    const rootCustomExecutorPath = typeof configData.customExecutorPath === 'string' ? configData.customExecutorPath : undefined;

    const validatePath = (field: 'request' | 'customExecutorPath', value: string, itemLabel?: string) => {
        const prefix = itemLabel ? `${itemLabel}: ` : '';
        const resolved = path.resolve(cwd, value);

        if (!existsSync(resolved)) {
            warnings.push(`${prefix}${field} file not found: ${value}`);
            return;
        }

        if (field === 'customExecutorPath') {
            const content = readFileSync(resolved, 'utf8');
            if (!/\bexport\s+function\s+createExecutorAdapter\b/.test(content)) {
                warnings.push(`${prefix}customExecutorPath should export function createExecutorAdapter`);
            }
        }
    };

    if (rootRequest) {
        validatePath('request', rootRequest);
    }

    if (rootCustomExecutorPath) {
        validatePath('customExecutorPath', rootCustomExecutorPath);
    }

    collectConfigItems(configData).forEach((item, index) => {
        const itemRequest = typeof item.request === 'string' ? item.request : undefined;
        const itemCustomExecutorPath = typeof item.customExecutorPath === 'string' ? item.customExecutorPath : undefined;
        const label = `items[${index}]`;

        if (itemRequest && itemRequest !== rootRequest) {
            validatePath('request', itemRequest, label);
        }

        if (itemCustomExecutorPath && itemCustomExecutorPath !== rootCustomExecutorPath) {
            validatePath('customExecutorPath', itemCustomExecutorPath, label);
        }
    });

    return warnings;
}
