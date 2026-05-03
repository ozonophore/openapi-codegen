import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { EMigrationMode } from '../../common/Enums';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TRawOptions } from '../../common/TRawOptions';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { allMigrationPlans } from '../../common/VersionedSchema/AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { flatOptionsSchema } from '../../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { GenerateOptions, generateOptionsSchema } from '../schemas';

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
 * Запускает генерацию OpenAPI клиента
 * Поддерживает как конфиг-файл, так и параметры из CLI
 */
export async function generateOpenApiClient(options: OptionValues): Promise<void> {
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
            process.exit(1);
        }

        const validatedOptions = validationResult.data as GenerateOptions;

        // Если есть минимальные опции (input и output), используем их
        const hasMinimumRequiredOptions = !!validatedOptions.input && !!validatedOptions.output;
        if (hasMinimumRequiredOptions) {
            const directOptionsValidationResult = validateZodOptions(generateCliFlatSchema, {
                input: validatedOptions.input,
                output: validatedOptions.output,
                ...clientOptions,
            });

            if (!directOptionsValidationResult.success) {
                APP_LOGGER.errorWithHint({
                    code: 'NO_OPTIONS_PROVIDED',
                    message: LOGGER_MESSAGES.ERROR.GENERIC(directOptionsValidationResult.errors.join('\n')),
                });
                await APP_LOGGER.shutdownLoggerAsync();
                process.exit(1);
            }

            await OpenAPI.generate(directOptionsValidationResult.data as TRawOptions);
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(0);
        }

        const configData = loadConfigIfExists(validatedOptions.openapiConfig);
        if (!configData) {
            APP_LOGGER.errorWithHint({
                code: validatedOptions.openapiConfig ? 'CONFIG_FILE_NOT_FOUND_AT' : 'CONFIG_FILE_MISSING',
                message: `${LOGGER_MESSAGES.CONFIG.FILE_MISSING}\n${LOGGER_MESSAGES.CONFIG.FILE_MISSING_HINT}`,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(1);
        }

        if (Array.isArray(configData)) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED);
        }

        const preparedOptions = convertArrayToObject(configData);

        // Use unified migration system for all schema types
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
            process.exit(1);
        }

        const { value } = migratedOptions;
        const mergedOptions: TRawOptions = {
            ...(value as TRawOptions),
            strictOpenapi: validatedOptions.strictOpenapi ?? (value as TRawOptions).strictOpenapi,
            reportFile: validatedOptions.reportFile ?? (value as TRawOptions).reportFile,
            cache: validatedOptions.cache ?? (value as TRawOptions).cache,
            cachePath: validatedOptions.cachePath ?? (value as TRawOptions).cachePath,
            cacheStrategy: validatedOptions.cacheStrategy ?? (value as TRawOptions).cacheStrategy,
            cacheDebug: validatedOptions.cacheDebug ?? (value as TRawOptions).cacheDebug,
        };

        await OpenAPI.generate(mergedOptions);
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(0);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: 'SPEC_FILES_FIND_ERROR',
            message: LOGGER_MESSAGES.ERROR.GENERIC(message),
            error,
        });
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }
}
