import { OptionValues } from 'commander';
import * as Handlebars from 'handlebars/runtime';
import { format } from 'prettier';

import { APP_LOGGER, DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../common/Consts';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { fileSystem } from '../../core/utils/fileSystem';
import { getFileName } from '../../core/utils/getFileName';
import openApiCongigTemplate from '../../templatesCompiled/cli/openApiConfig';
import { EOptionType } from './Enums';
import { TInitOpenApiConfigParams } from './Types';

export async function runInitOpenapiConfig(params: OptionValues) {
    const {openapiConfig, type: optionType} = params as TInitOpenApiConfigParams

    try {
        const configData = loadConfigIfExists(openapiConfig);
        if (!configData) {
            const configFilePath = openapiConfig ?? DEFAULT_OPENAPI_CONFIG_FILENAME;
            const file = resolveHelper(process.cwd(), configFilePath);
            const configTemplate = Handlebars.template(openApiCongigTemplate);
            const templateResult = configTemplate({ useMultyOptions: optionType === EOptionType.MULTIOPTION });
            const formattedValue = await format(templateResult, { parser: 'json' });
            await fileSystem.writeFile(file, formattedValue);
            APP_LOGGER.info(`File recording completed: ${file}`);
        } else {
            const fileName = getFileName(openapiConfig);
            APP_LOGGER.info(`The configuration file already exists: ${fileName}`);
        }
    } catch (error: any) {
        APP_LOGGER.error(error.message);
    }
}
