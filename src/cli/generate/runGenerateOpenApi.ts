import { OptionValues } from 'commander';

import { defaultOptions } from '../../common/defaultOptions';
import { MultiOptions, Options } from '../../common/Options';
import { loadConfigIfExists } from '../../common/Utils';
import { multiOptionsMigrationPlan } from '../../common/VersionedSchema/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersionedSchemas';
import { optionsMigrationPlans } from '../../common/VersionedSchema/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersionedSchemas';
import { migrateToLatestVersion } from '../../common/VersionedSchema/Utils/migrateToLatestVersion';
import * as OpenAPI from '../../core';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

/**
 * The function starts code generation.
 * @param options Options for starting generation.
 */
export async function runGenerateOpenApi(options: OptionValues) {
    const hasMinimumRequiredOptions = !!options.input && !!options.output;
    if (hasMinimumRequiredOptions) {
        const { error: defaultValuesError, value } = defaultOptions.validate(options);

        if (defaultValuesError) {
            await OpenAPI.generate(value);
            return;
        }
    }

    const configData = loadConfigIfExists();
    if (!configData) {
        throw new Error('Error: The configuration file is missing');
    }

    const isMultiOptions = isInstanceOfMultioptions(configData);

    const migratedOptions = isMultiOptions
        ? migrateToLatestVersion({
              rawInput: configData,
              migrationPlans: multiOptionsMigrationPlan,
              versionedSchemas: multiOptionsVersionedSchema,
          })
        : migrateToLatestVersion({
              rawInput: configData,
              migrationPlans: optionsMigrationPlans,
              versionedSchemas: optionsVersionedSchemas,
          });

    if (!migratedOptions) {
        throw new Error('Error: Couldn\'t convert the set of options to the current version');
    }
    const { value } = migratedOptions;

    if (isMultiOptions) {
        await OpenAPI.generate(value as MultiOptions);
    } else {
        await OpenAPI.generate(value as Options);
    }
}
