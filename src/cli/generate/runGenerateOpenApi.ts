import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { defaultOptions } from '../../common/defaultOptions';
import { EMigrationMode } from '../../common/Enums';
import { TMultiOptions, TOptions } from '../../common/Options';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { multiOptionsMigrationPlan } from '../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsMigrationPlans } from '../../common/VersionedSchema/OptionsVersioned/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersioned/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

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

        const isMultiOptions = isInstanceOfMultioptions(preparedOptions);

        const migratedOptions = isMultiOptions
            ? migrateDataToLatestSchemaVersion({
                  rawInput: preparedOptions,
                  migrationPlans: multiOptionsMigrationPlan,
                  versionedSchemas: multiOptionsVersionedSchema,
                  migrationMode: EMigrationMode.GENERATE_OPENAPI,
              })
            : migrateDataToLatestSchemaVersion({
                  rawInput: preparedOptions,
                  migrationPlans: optionsMigrationPlans,
                  versionedSchemas: optionsVersionedSchemas,
                  migrationMode:EMigrationMode.GENERATE_OPENAPI,
              });

        if (!migratedOptions) {
            APP_LOGGER.error("Couldn't convert the set of options to the current version");
        } else {
            const { value } = migratedOptions;

            if (isMultiOptions) {
                await OpenAPI.generate(value as TMultiOptions);
            } else {
                await OpenAPI.generate(value as TOptions);
            }
        }
        process.exit(0);
    } catch (error: any) {
        APP_LOGGER.error(error.message);
    }
}
