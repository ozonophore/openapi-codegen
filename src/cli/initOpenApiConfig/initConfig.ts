import { APP_LOGGER } from '../../common/Consts';
import { TRawOptions } from '../../common/TRawOptions';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { OPEN_API_CONFIG_SELECT_OPTIONS } from '../interactive/constants';
import { selectDialog } from '../interactive/selectDialog';
import { EConfigType } from '../interactive/types';
import { CLITemplates } from './Types';
import { buildConfig, buildExampleConfig } from './utils/buildConfig';
import { findSpecFiles } from './utils/findSpecFiles';
import { validateSpecFiles } from './utils/validateSpecFiles';
import { writeConfigFile } from './utils/writeConfigFile';

/**
 * Инициализирует файл конфигурации OpenAPI
 * @param openapiConfig - Путь к файлу конфигурации
 * @param specsDir - Путь к директории со спецификациями
 */
export async function initConfig(openapiConfig: string, specsDir: string, templates: CLITemplates): Promise<void> {
    const configPath = resolveHelper(process.cwd(), openapiConfig);
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

    // Шаг 4: Формирование файла конфигурации
    // Поиск файлов спецификаций
    let specFiles: string[] = [];
    try {
        specFiles = await findSpecFiles(specsDir);
    } catch (error) {
        APP_LOGGER.warn(`Error finding spec files: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (specFiles.length === 0) {
        APP_LOGGER.warn(`No spec files found in directory: ${specsDir}`);
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
            // Здесь можно добавить интерактивный ввод пути к request файлу
            // Для простоты оставляем пустым, пользователь может добавить вручную
            customRequest = './custom-request.ts';
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
    await writeConfigFile(openapiConfig, config);
}