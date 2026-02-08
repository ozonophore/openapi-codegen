import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { CheckConfigOptions, checkConfigOptionsSchema } from '../schemas';
import { ACTION_FOR_CONFIG_DATA_OPTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { selectConfigAction } from './utils/selectConfigAction';
import { validateAndMigrateConfigData } from './utils/validateAndMigrateConfigData';

/**
 * Проверяет конфигурационный файл на корректность и актуальность.
 * Если обнаружены проблемы, предлагает действия для их исправления.
 *
 * @param configPath - Путь к файлу конфигурации
 * @throws Перебрасывает ошибки валидации и работы с файлами
 *
 * @example
 * await checkConfig('./openapi-config.json');
 */
export async function checkConfig(options: OptionValues): Promise<void> {
    const validationResult = validateZodOptions(checkConfigOptionsSchema, options);

    if (!validationResult.success) {
        APP_LOGGER.error(validationResult.errors.join('\n'));
        process.exit(1);
    }

    const validatedOptions = validationResult.data as CheckConfigOptions;
    const configData = loadConfigIfExists(validatedOptions.openapiConfig);

    if (!configData) {
        APP_LOGGER.error(`${ERROR_MESSAGES.FILE_NOT_FOUND} ${validatedOptions.openapiConfig || ''}`);
        return;
    }

    try {
        const { isActualConfigVersion, hasDefaultValues, migratedData } = validateAndMigrateConfigData(configData);

        APP_LOGGER.info(SUCCESS_MESSAGES.CONFIG_VALID(validatedOptions.openapiConfig || ''));

        // Если версия не актуальна, предложить обновление
        if (!isActualConfigVersion) {
            await selectConfigAction({
                migratedData,
                configPath: validatedOptions.openapiConfig || '',
                warningMessage: 'Ваша версия конфигурации устарела и нуждается в обновлении.',
                actionChoices: ACTION_FOR_CONFIG_DATA_OPTIONS,
            });
            return;
        }

        // Если есть значения по умолчанию, предложить их удаление
        if (hasDefaultValues) {
            await selectConfigAction({
                migratedData,
                configPath: validatedOptions.openapiConfig || '',
                warningMessage: 'В вашей конфигурации есть значения по умолчанию, которые можно удалить.',
                actionChoices: ACTION_FOR_CONFIG_DATA_OPTIONS,
            });
        }
    } catch (error) {
        handleConfigError(ERROR_MESSAGES.CHECKING_FAILED, error);
    }
}

/**
 * Обрабатывает ошибки при работе с конфигурацией
 * @internal
 */
function handleConfigError(baseMessage: string, error: unknown): void {
    if (error instanceof Error && error.message) {
        APP_LOGGER.error(`${baseMessage}: ${error.message}`);
    } else if (error) {
        APP_LOGGER.error(baseMessage, error);
    } else {
        APP_LOGGER.error(baseMessage);
    }
}