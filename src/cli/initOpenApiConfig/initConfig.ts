import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TRawOptions } from '../../common/TRawOptions';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { OPEN_API_CONFIG_SELECT_OPTIONS } from '../interactive/constants';
import { selectDialog } from '../interactive/selectDialog';
import { EConfigType } from '../interactive/types';
import { InitOptions } from '../schemas';
import { CLITemplates } from './Types';
import { buildConfig, buildExampleConfig } from './utils/buildConfig';
import { findSpecFiles } from './utils/findSpecFiles';
import { validateSpecFiles } from './utils/validateSpecFiles';
import { writeConfigFile } from './utils/writeConfigFile';

type InitConfigParams = Pick<InitOptions, 'openapiConfig' | 'specsDir' | 'request'> & {
    templates: CLITemplates;
    useInteractiveMode?: boolean;
};

/**
 * Инициализирует файл конфигурации OpenAPI
 */
export async function initConfig(params: InitConfigParams): Promise<void> {
    const useInteractiveMode = params.useInteractiveMode === true;
    const configPath = resolveHelper(process.cwd(), params.openapiConfig || '');
    const configExists = await fileSystemHelpers.exists(configPath);

    // Шаг 3: Проверка существования файла конфигурации
    if (configExists) {
        if (!useInteractiveMode) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.CONFIG_EXISTS_INTERACTIVE_DISABLED(configPath));
            APP_LOGGER.info(LOGGER_MESSAGES.CONFIG.CONFIG_LEFT_UNCHANGED);
            return;
        }

        const shouldRegenerate = await confirmDialog({
            message: 'Configuration file already exists. Do you want to regenerate it?',
            initial: false,
        });

        if (!shouldRegenerate) {
            APP_LOGGER.info(LOGGER_MESSAGES.CONFIG.CONFIG_LEFT_UNCHANGED);
            return;
        }
    }

    const currentSpecsDir = params.specsDir || '';

    // Шаг 4: Формирование файла конфигурации
    // Поиск файлов спецификаций
    let specFiles: string[] = [];
    try {
        specFiles = await findSpecFiles(currentSpecsDir);
    } catch (error) {
        APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.SPEC_FILES_FIND_ERROR(error instanceof Error ? error.message : String(error)));
    }

    if (specFiles.length === 0) {
        APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.NO_SPEC_FILES_FOUND(currentSpecsDir));
    }

    // Валидация файлов
    const validatedSpecs = await validateSpecFiles(specFiles);

    let config: TRawOptions;
    let useMultiOption = false;
    let customRequest: string | undefined;
    let perSpecRequest = false;
    const hasCustomRequestPath = Boolean(params.request);

    if (validatedSpecs.length > 0) {
        // Если найдены валидные спецификации, спрашиваем о типе конфигурации
        useMultiOption = validatedSpecs.length > 1;

        // В неинтерактивном режиме признак кастомного request определяется наличием --request
        const hasCustomRequest = useInteractiveMode
            ? await confirmDialog({
                message: 'Do you want to use a custom request implementation?',
                initial: false,
            })
            : hasCustomRequestPath;

        if (hasCustomRequest) {
            if (useMultiOption && useInteractiveMode) {
                perSpecRequest = await confirmDialog({
                    message: 'Will each specification have its own request?',
                    initial: false,
                });
            }

            if (!hasCustomRequestPath) {
                APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.CUSTOM_REQUEST_MISSING_PATH);
            } else {
                customRequest = params.request;
            }
        }

        config = await buildConfig(validatedSpecs, useMultiOption, customRequest, perSpecRequest);
    } else {
        // Если валидных спецификаций нет, предлагаем создать пример
        APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.NO_VALID_SPEC_FILES_FOUND);

        const action = useInteractiveMode
            ? await selectDialog({
                message: 'What would you like to do?',
                choices: OPEN_API_CONFIG_SELECT_OPTIONS,
                initial: 0,
            })
            : EConfigType.FLAT;

        if (action === EConfigType.NONE) {
            APP_LOGGER.info(LOGGER_MESSAGES.CONFIG.CONFIG_GENERATION_CANCELLED);
            return;
        }

        useMultiOption = action === EConfigType.MULTI;

        const hasCustomRequest = useInteractiveMode
            ? await confirmDialog({
                message: 'Do you want to use a custom request implementation?',
                initial: false,
            })
            : hasCustomRequestPath;

        if (hasCustomRequest) {
            if (useMultiOption && useInteractiveMode) {
                perSpecRequest = await confirmDialog({
                    message: 'Will each specification have its own request?',
                    initial: false,
                });
            }

            if (!hasCustomRequestPath) {
                APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.CUSTOM_REQUEST_MISSING_PATH);
            } else {
                customRequest = params.request;
            }
        }

        // Создаем пример конфигурации
        config = buildExampleConfig(useMultiOption, customRequest, perSpecRequest);
    }

    // Записываем конфигурацию на диск
    await writeConfigFile(params.openapiConfig || '', config, params.templates);
}
