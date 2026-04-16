import { APP_LOGGER } from '../Consts';
import { LOGGER_ERROR_CODES, LOGGER_MESSAGES } from '../LoggerMessages';

interface ILintResult {
    filePath: string;
    output?: string;
    messages: unknown[];
}

interface IESLintConstructor {
    new (options?: Record<string, unknown>): {
        lintFiles(patterns: string[]): Promise<ILintResult[]>;
    };
    outputFixes(results: ILintResult[]): Promise<void>;
}

interface IESLintModule {
    ESLint: IESLintConstructor;
}

/**
 * Dynamically resolves the ESLint module from the user's project.
 * Returns null if ESLint is not installed.
 */
async function tryImportESLint(): Promise<IESLintModule | null> {
    try {
        const mod = await import('eslint');
        return mod as unknown as IESLintModule;
    } catch {
        return null;
    }
}

/**
 * Runs ESLint --fix on the given file using the user's project ESLint config.
 * Silently skips if ESLint is not installed.
 * Logs an error and re-throws if ESLint fails during the fix.
 */
export async function eslintFix(filePath: string): Promise<void> {
    const eslintModule = await tryImportESLint();

    if (!eslintModule) {
        APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_NOT_INSTALLED);
        return;
    }

    try {
        const eslint = new eslintModule.ESLint({ fix: true });
        const results = await eslint.lintFiles([filePath]);
        await eslintModule.ESLint.outputFixes(results);
        APP_LOGGER.info(LOGGER_MESSAGES.FORMATTING.ESLINT_FIX_APPLIED(filePath));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: LOGGER_ERROR_CODES.ESLINT_FIX_FAILED,
            message: LOGGER_MESSAGES.FORMATTING.ESLINT_FIX_FAILED(filePath, message),
            error,
        });
        throw error;
    }
}
