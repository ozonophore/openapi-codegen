import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { convertArrayToObject, loadConfigIfExists } from '../../common/Utils';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersionedSchemas';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersionedSchemas';
import { getErrorFieldsFromValidation } from '../../common/VersionedSchema/Utils/getErrorFieldsFromValidation';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

/**
 * The function checks whether the configuration file data is filled in correctly
 */
export function chekOpenApiConfig () {
    const logger = new Logger({
        level: ELogLevel.INFO,
        instanceId: 'check-openapi-config',
        logOutput: ELogOutput.CONSOLE,
    });

    try {
        const configData = loadConfigIfExists();
        if (!configData) {
            logger.error('The configuration file is missing');
        }
        const preparedOptions = convertArrayToObject(configData);
        const isMultiOptions = isInstanceOfMultioptions(preparedOptions);
        const currentMigrationPlan = isMultiOptions ? multiOptionsVersionedSchema : optionsVersionedSchemas;

        const currentSchema = currentMigrationPlan
            .map((sch, idx) => ({...sch, index: idx + 1}))
            .reduce((prev, curr) => (curr.index > prev.index ? curr : prev));

        const { error } = currentSchema.schema.validate(preparedOptions);
        if (error) {
            const details = getErrorFieldsFromValidation(error).map((e) => `${e.path}: ${e.type}`).join(',');
            logger.error(`The configuration file data is specified incorrectly: ${details}`)
        }
    } catch (error: any) {
        logger.error(error.message);
    }
}