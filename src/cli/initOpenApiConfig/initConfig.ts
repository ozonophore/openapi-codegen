import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { TRawOptions } from '../../common/TRawOptions';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { OPEN_API_CONFIG_SELECT_OPTIONS } from '../interactive/constants';
import { selectDialog } from '../interactive/selectDialog';
import { EConfigType } from '../interactive/types';
import { InitOptions, initOptionsSchema } from '../schemas';
import { validateCLIOptions } from '../validation';
import { buildConfig, buildExampleConfig } from './utils/buildConfig';
import { findSpecFiles } from './utils/findSpecFiles';
import { validateSpecFiles } from './utils/validateSpecFiles';
import { writeConfigFile } from './utils/writeConfigFile';

/**
 * Инициализирует файл конфигурации OpenAPI
 * @param openapiConfig - Путь к файлу конфигурации
 * @param specsDir - Путь к директории со спецификациями
 */
export async function initConfig(options: OptionValues): Promise<void> {
    let validatedOptions: InitOptions;
    try {
        // Валидация опций через Zod
        const validationResult = validateCLIOptions(initOptionsSchema, options);

        if (!validationResult.success) {
            APP_LOGGER.error(validationResult.error);
            process.exit(1);
        }

        validatedOptions = validationResult.data as InitOptions;
    } catch (error: any) {
        APP_LOGGER.error(error.message);
        process.exit(1);
    }

    const configPath = resolveHelper(process.cwd(), validatedOptions.openapiConfig);
    const configExists = await fileSystemHelpers.exists(configPath);

    // Шаг 3: Проверка существования файла конфигурации
    if (configExists) {
        const shouldRegenerate = await confirmDialog({
            message: 'Configuration file already exists. Do you want to regenerate it?',
            initial: false,
        });

        if (!shouldRegenerate) {
            APP_LOGGER.info('Configuration file left unchanged.');
            return;
        }
    }

    const currentSpecsDir = validatedOptions.specsDir;

    // Шаг 4: Формирование файла конфигурации
    // Поиск файлов спецификаций
    let specFiles: string[] = [];
    try {
        specFiles = await findSpecFiles(currentSpecsDir);
    } catch (error) {
        APP_LOGGER.warn(`Error finding spec files: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (specFiles.length === 0) {
        APP_LOGGER.warn(`No spec files found in directory: ${currentSpecsDir}`);
    }

    // Валидация файлов
    const validatedSpecs = await validateSpecFiles(specFiles);

    let config: TRawOptions;
    let useMultiOption = false;
    let customRequest: string | undefined;
    let perSpecRequest = false;

    if (validatedSpecs.length > 0) {
        // Если найдены валидные спецификации, спрашиваем о типе конфигурации
        useMultiOption = validatedSpecs.length > 1;

        // Спрашиваем про пользовательскую реализацию request
        const hasCustomRequest = await confirmDialog({
            message: 'Do you want to use a custom request implementation?',
            initial: false,
        });

        if (hasCustomRequest) {
            if (useMultiOption) {
                perSpecRequest = await confirmDialog({
                    message: 'Will each specification have its own request?',
                    initial: false,
                });
            }
            customRequest = validatedOptions.request;
        }

        config = await buildConfig(validatedSpecs, useMultiOption, customRequest, perSpecRequest);
    } else {
        // Если валидных спецификаций нет, предлагаем создать пример
        APP_LOGGER.warn('No valid OpenAPI specification files found.');

        const action = await selectDialog({
            message: 'What would you like to do?',
            choices: OPEN_API_CONFIG_SELECT_OPTIONS,
            initial: 0,
        });

        if (action === EConfigType.NONE) {
            APP_LOGGER.info('Configuration file generation cancelled.');
            return;
        }

        useMultiOption = action === EConfigType.MULTI;

        // Спрашиваем про пользовательскую реализацию request
        const hasCustomRequest = await confirmDialog({
            message: 'Do you want to use a custom request implementation?',
            initial: false,
        });

        if (hasCustomRequest) {
            if (useMultiOption) {
                perSpecRequest = await confirmDialog({
                    message: 'Will each specification have its own request?',
                    initial: false,
                });
            }
            customRequest = './custom-request.ts';
        }

        // Создаем пример конфигурации
        config = buildExampleConfig(useMultiOption, customRequest, perSpecRequest);
    }

    // Записываем конфигурацию на диск
    await writeConfigFile(validatedOptions.openapiConfig, config);
}
