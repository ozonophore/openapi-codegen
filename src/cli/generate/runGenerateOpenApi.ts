import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { defaultOptions } from '../../common/defaultOptions';
import { EMigrationMode } from '../../common/Enums';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { allMigrationPlans } from '../../common/VersionedSchema/AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { TRawOptions } from '../schemas/configSchemas';
import { generateOptionsSchema } from '../schemas/generate';
import { validateCLIOptions } from '../validation';

/**
 * Запускает генерацию OpenAPI клиента
 * Поддерживает как конфиг-файл, так и параметры из CLI
 */
export async function runGenerateOpenApi(options: OptionValues): Promise<void> {
    const { openapiConfig, ...clientOptions } = options;

    try {
        // Валидация опций через Zod
        const validationResult = validateCLIOptions(generateOptionsSchema, {
            openapiConfig,
            ...clientOptions,
        });

        if (!validationResult.success) {
            APP_LOGGER.error(validationResult.error);
            process.exit(1);
        }

        const validatedOptions = validationResult.data;

        // Если есть минимальные опции (input и output), используем их
        const hasMinimumRequiredOptions = !!validatedOptions.input && !!validatedOptions.output;
        if (hasMinimumRequiredOptions) {
            // Используем старую Joi валидацию для обратной совместимости
            // В будущем можно заменить на Zod
            const { error: defaultValuesError, value } = defaultOptions.validate({
                input: validatedOptions.input,
                output: validatedOptions.output,
                ...clientOptions,
            });

            if (!defaultValuesError) {
                await OpenAPI.generate(value);
                process.exit(0);
            }
        }

        const configData = loadConfigIfExists(validatedOptions.openapiConfig);
        if (!configData) {
            APP_LOGGER.error('The configuration file is missing');
            process.exit(1);
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
            APP_LOGGER.error("Couldn't convert the set of options to the current version");
            process.exit(1);
        }

        const { value } = migratedOptions;
        await OpenAPI.generate(value as TRawOptions);
        process.exit(0);
    } catch (error: any) {
        APP_LOGGER.error(error.message);
        process.exit(1);
    }
}
