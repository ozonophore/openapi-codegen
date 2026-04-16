import { ZodError } from 'zod';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { GovernancePolicyConfig } from './evaluateGovernanceRules';
import { governancePolicyConfigSchema } from './governanceConfigSchema';

/**
 * Formats Zod path for governance JSON config context.
 */
function formatGovernanceConfigPath(path: Array<string | number>): string {
    if (path.length === 0) {
        return 'root';
    }

    return path
        .map(segment => {
            if (typeof segment === 'number') {
                return `[${segment}]`;
            }
            return String(segment);
        })
        .join('.');
}

/**
 * Formats governance config validation errors as user-readable message.
 */
function formatGovernanceConfigValidationError(error: ZodError): string {
    if (!error.issues.length) {
        return 'Unknown governance config validation error';
    }

    return error.issues
        .map(issue => `${formatGovernanceConfigPath(issue.path as Array<string | number>)}: ${issue.message}`)
        .join('\n');
}

/**
 * Loads governance policy config JSON from file path.
 * Returns undefined when path is not provided.
 */
export async function loadGovernanceConfig(governanceConfigPath?: string): Promise<GovernancePolicyConfig | undefined> {
    if (!governanceConfigPath) {
        return undefined;
    }

    const resolvedPath = resolveHelper(process.cwd(), governanceConfigPath);
    const exists = await fileSystemHelpers.exists(resolvedPath);
    if (!exists) {
        throw new Error(`Governance config file does not exist: ${resolvedPath}`);
    }

    const rawContent = await fileSystemHelpers.readFile(resolvedPath, "utf8");
    let parsed: unknown;
    try {
        parsed = JSON.parse(rawContent);
    } catch (error) {
        throw new Error(
            `Failed to parse governance config JSON at "${resolvedPath}": ${error instanceof Error ? error.message : String(error)}`
        );
    }

    const validationResult = governancePolicyConfigSchema.safeParse(parsed);
    if (!validationResult.success) {
        throw new Error(
            `Invalid governance config at "${resolvedPath}":\n${formatGovernanceConfigValidationError(validationResult.error)}`
        );
    }

    return validationResult.data as GovernancePolicyConfig;
}
