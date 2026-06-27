import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { EMigrationMode } from '../../common/Enums';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TFlatOptions, TRawOptions } from '../../common/TRawOptions';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation';
import { allMigrationPlans } from '../../common/VersionedSchema/AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { flatOptionsSchema } from '../../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { GenerateOptions, generateOptionsSchema } from '../schemas';
import { CLICommandResult } from '../types';
import { executeAutoSelection } from './autoSelectHelpers';
import { mergeGenerateCliOverrides, pickDirectFlatCliInput } from './generateCliOverrides';

const generateCliFlatSchema = flatOptionsSchema.strict().superRefine((data, ctx) => {
    if (data.excludeCoreServiceFiles === true && data.request) {
        ctx.addIssue({
            code: 'custom',
            message: '"request" can only be used when "excludeCoreServiceFiles" is false',
            path: ['request'],
        });
    }
});

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

        const hasMinimumRequiredOptions = !!validatedOptions.input && !!validatedOptions.output;
        if (hasMinimumRequiredOptions) {
            const directOptionsValidationResult = validateZodOptions(generateCliFlatSchema, pickDirectFlatCliInput(clientOptions, validatedOptions));

            if (!directOptionsValidationResult.success) {
                APP_LOGGER.errorWithHint({
                    code: 'NO_OPTIONS_PROVIDED',
                    message: LOGGER_MESSAGES.ERROR.GENERIC(directOptionsValidationResult.errors.join('\n')),
                });
                await APP_LOGGER.shutdownLoggerAsync();
                return { success: false, error: directOptionsValidationResult.errors.join('\n') };
            }

            const directOptions: TRawOptions = mergeGenerateCliOverrides(directOptionsValidationResult.data as TRawOptions, validatedOptions);
            const directAutoSelectResult = executeAutoSelection(directOptions as TFlatOptions, APP_LOGGER);
            await OpenAPI.generate({
                ...directOptions,
                ...directAutoSelectResult,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            return { success: true };
        }

        const configData = loadConfigIfExists(validatedOptions.openapiConfig);
        if (!configData) {
            APP_LOGGER.errorWithHint({
                code: validatedOptions.openapiConfig ? 'CONFIG_FILE_NOT_FOUND_AT' : 'CONFIG_FILE_MISSING',
                message: `${LOGGER_MESSAGES.CONFIG.FILE_MISSING}\n${LOGGER_MESSAGES.CONFIG.FILE_MISSING_HINT}`,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            return { success: false, error: LOGGER_MESSAGES.CONFIG.FILE_MISSING };
        }

        if (Array.isArray(configData)) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED);
        }

        const preparedOptions = convertArrayToObject(configData);

        const migratedOptions = migrateDataToLatestSchemaVersion({
            rawInput: preparedOptions,
            migrationPlans: allMigrationPlans,
            versionedSchemas: allVersionedSchemas,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });

        if (!migratedOptions) {
            APP_LOGGER.errorWithHint({
                code: 'NO_VALID_SPEC_FILES_FOUND',
                message: LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            return { success: false, error: LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED };
        }

        const { value } = migratedOptions;
        const mergedOptions: TRawOptions = mergeGenerateCliOverrides(value as TRawOptions, validatedOptions);

        const autoSelectResult = executeAutoSelection(mergedOptions as TFlatOptions, APP_LOGGER);
        const finalOptions: TRawOptions = {
            ...mergedOptions,
            ...autoSelectResult,
        };

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
