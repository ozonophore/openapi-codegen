import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TRawOptions } from '../../common/TRawOptions';
import { validateZodOptions } from '../../common/Validation';
import * as OpenAPI from '../../core';
import { executeAutoSelection } from '../../core/autoSelect';
import { GenerateOptions, generateOptionsSchema } from '../schemas';
import { CLICommandResult } from '../types';
import { resolveGenerateCliToRawOptions } from './generateCliOptionsAdapter';

/**
 * Runs OpenAPI client generation and returns a process exit code.
 * Does not call `process.exit` — safe for in-process unit tests.
 */
export async function generateOpenApiClient(options: OptionValues): Promise<CLICommandResult> {
    const { openapiConfig, ...clientOptions } = options;

    try {
        const validationResult = validateZodOptions(generateOptionsSchema, {
            openapiConfig,
            ...clientOptions,
        });

        if (!validationResult.success) {
            APP_LOGGER.errorWithHint({
                code: 'NO_OPTIONS_PROVIDED',
                message: LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')),
            });
            await APP_LOGGER.shutdownLoggerAsync();
            return { success: false, error: validationResult.errors.join('\n') };
        }

        const validatedOptions = validationResult.data as GenerateOptions;
        const resolved = resolveGenerateCliToRawOptions({ clientOptions, validated: validatedOptions });

        if (!resolved.ok) {
            if (resolved.kind === 'direct_validation') {
                APP_LOGGER.errorWithHint({
                    code: 'NO_OPTIONS_PROVIDED',
                    message: LOGGER_MESSAGES.ERROR.GENERIC(resolved.errors.join('\n')),
                });
                await APP_LOGGER.shutdownLoggerAsync();
                return { success: false, error: resolved.errors.join('\n') };
            }
            if (resolved.kind === 'config_missing') {
                APP_LOGGER.errorWithHint({
                    code: resolved.hasExplicitPath ? 'CONFIG_FILE_NOT_FOUND_AT' : 'CONFIG_FILE_MISSING',
                    message: `${LOGGER_MESSAGES.CONFIG.FILE_MISSING}\n${LOGGER_MESSAGES.CONFIG.FILE_MISSING_HINT}`,
                });
                await APP_LOGGER.shutdownLoggerAsync();
                return { success: false, error: LOGGER_MESSAGES.CONFIG.FILE_MISSING };
            }
            APP_LOGGER.errorWithHint({
                code: 'NO_VALID_SPEC_FILES_FOUND',
                message: LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            return { success: false, error: LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED };
        }

        if (resolved.deprecatedArrayConfig) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED);
        }

        const autoSelectResult = executeAutoSelection(resolved.raw, APP_LOGGER);
        const finalOptions: TRawOptions = autoSelectResult.items ? { ...resolved.raw, items: autoSelectResult.items } : { ...resolved.raw, ...autoSelectResult };

        await OpenAPI.generate(finalOptions);
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: 'CONFIG_VALIDATION_FAILED',
            message: LOGGER_MESSAGES.ERROR.GENERIC(message),
            error,
        });
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: message };
    }
}
