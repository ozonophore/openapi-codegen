import { getFileName } from 'core/utils/getFileName';

import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersioned/OptionsVersionedSchemas';
import { getErrorFieldsFromValidation } from '../../common/VersionedSchema/Utils/getErrorFieldsFromValidation';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

/**
 * The function checks whether the configuration file data is filled in correctly
 */
export function chekOpenApiConfig(configPath?: string) {
    const logger = new Logger({
        level: ELogLevel.INFO,
        instanceId: 'check-openapi-config',
        logOutput: ELogOutput.CONSOLE,
    });

    try {
        const configData = loadConfigIfExists(configPath);
        if (!configData) {
            logger.error('The configuration file is missing');
        }
        const preparedOptions = convertArrayToObject(configData);
        const isMultiOptions = isInstanceOfMultioptions(preparedOptions);
        const currentMigrationPlan = isMultiOptions ? multiOptionsVersionedSchema : optionsVersionedSchemas;

        const currentSchema = currentMigrationPlan.map((sch, idx) => ({ ...sch, index: idx + 1 })).reduce((prev, curr) => (curr.index > prev.index ? curr : prev));

        const { error } = currentSchema.schema.validate(preparedOptions);
        if (error) {
            const details = getErrorFieldsFromValidation(error)
                .map(e => `${e.path}: ${e.type}`)
                .join(',');
            logger.error(`The configuration file data is specified incorrectly: ${details}`);
        } else {
            const fileName = getFileName(configPath);
            logger.forceInfo(`The parameters in the file are valid: ${fileName}`);
        }
    } catch (error: any) {
        logger.error(error.message);
    }
}
