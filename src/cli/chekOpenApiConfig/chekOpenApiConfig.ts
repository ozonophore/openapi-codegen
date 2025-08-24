import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { convertArrayToObject, loadConfigIfExists } from '../../common/Utils';
import { multiOptionsVersionedSchema } from '../../common/VersionedSchema/MultiOptionsVersionedSchemas';
import { optionsVersionedSchemas } from '../../common/VersionedSchema/OptionsVersionedSchemas';
import { isInstanceOfMultioptions } from '../../core/utils/isInstanceOfMultiOptions';

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
            logger.error("Данные конфигурационного файла указаны неправильно")
        }
    } catch (error: any) {
        logger.error(error.message);
    }
}