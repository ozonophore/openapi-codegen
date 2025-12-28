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

/**
 * Запускает генерацию OpenAPI клиента
 * Поддерживает как конфиг-файл, так и параметры из CLI
 */
export async function runGenerateOpenApi(options: OptionValues): Promise<void> {
    const { openapiConfig, ...clientOptions } = options;

    try {
        const hasMinimumRequiredOptions = !!clientOptions.input && !!clientOptions.output;
        if (hasMinimumRequiredOptions) {
            const { error: defaultValuesError, value } = defaultOptions.validate(clientOptions);

            if (defaultValuesError) {
                await OpenAPI.generate(value);
                process.exit(0);
            }
        }

        const configData = loadConfigIfExists(openapiConfig);
        if (!configData) {
            APP_LOGGER.error('The configuration file is missing');
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
        } else {
            const { value } = migratedOptions;
            
            await OpenAPI.generate(value);
        }
        process.exit(0);
    } catch (error: any) {
        APP_LOGGER.error(error.message);
    }
}