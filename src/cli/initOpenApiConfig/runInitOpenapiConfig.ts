import { OptionValues } from 'commander';
import * as Handlebars from 'handlebars/runtime';
import { format } from 'prettier';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../common/Consts';
import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { fileSystem } from '../../core/utils/fileSystem';
import { getFileName } from '../../core/utils/getFileName';
import { resolve } from '../../core/utils/pathHelpers';
import openApiCongigTemplate from '../../templatesCompiled/cli/openApiConfig';
import { EOptionType } from './Enums';
import { TInitOpenApiConfigParams } from './Types';

export async function runInitOpenapiConfig(params: OptionValues) {
    const {openapiConfig, type: optionType} = params as TInitOpenApiConfigParams
    
    const logger = new Logger({
        level: ELogLevel.INFO,
        instanceId: 'init-openapi-config',
        logOutput: ELogOutput.CONSOLE,
    });

    try {
        const configData = loadConfigIfExists(openapiConfig);
        if (!configData) {
            const configFilePath = openapiConfig ?? DEFAULT_OPENAPI_CONFIG_FILENAME;
            const file = resolve(process.cwd(), configFilePath);
            const configTemplate = Handlebars.template(openApiCongigTemplate);
            const templateResult = configTemplate({ useMultyOptions: optionType === EOptionType.MULTIOPTION });
            const formattedValue = await format(templateResult, { parser: 'json' });
            await fileSystem.writeFile(file, formattedValue);
            logger.info(`File recording completed: ${file}`);
        } else {
            const fileName = getFileName(openapiConfig);
            logger.info(`The configuration file already exists: ${fileName}`);
        }
    } catch (error: any) {
        logger.error(error.message);
    }
}
