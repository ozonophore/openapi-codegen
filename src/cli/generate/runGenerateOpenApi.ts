import { OptionValues } from 'commander';

import { defaultOptions } from '../../common/defaultOptions';
import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { TMultiOptions, TOptions } from '../../common/Options';
import { convertArrayToObject, loadConfigIfExists } from '../../common/Utils';
import { multiOptionsMigrationPlan } from '../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsMigrationPlans } from '../../common/VersionedSchema/OptionsVersioned/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersioned/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

/**
 * The function starts code generation.
 * @param options Options for starting generation.
 */
export async function runGenerateOpenApi(options: OptionValues) {
    const logger = new Logger({
        level: ELogLevel.INFO,
        instanceId: 'openapi-cli',
        logOutput: ELogOutput.CONSOLE,
    });

    try {
        const hasMinimumRequiredOptions = !!options.input && !!options.output;
        if (hasMinimumRequiredOptions) {
            const { error: defaultValuesError, value } = defaultOptions.validate(options);

            if (defaultValuesError) {
                await OpenAPI.generate(value);
                process.exit(0);
            }
        }

        const configData = loadConfigIfExists();
        if (!configData) {
            logger.error('The configuration file is missing');
        }

        const preparedOptions = convertArrayToObject(configData);

        const isMultiOptions = isInstanceOfMultioptions(preparedOptions);

        const migratedOptions = isMultiOptions
            ? migrateDataToLatestSchemaVersion({
                  rawInput: preparedOptions,
                  migrationPlans: multiOptionsMigrationPlan,
                  versionedSchemas: multiOptionsVersionedSchema,
              })
            : migrateDataToLatestSchemaVersion({
                  rawInput: preparedOptions,
                  migrationPlans: optionsMigrationPlans,
                  versionedSchemas: optionsVersionedSchemas,
              });

        if (!migratedOptions) {
            logger.error("Couldn't convert the set of options to the current version");
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
        logger.error(error.message);
    }
}
