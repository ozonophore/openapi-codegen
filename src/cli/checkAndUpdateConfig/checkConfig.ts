import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { CheckConfigOptions, checkConfigOptionsSchema } from '../schemas';
import { ACTION_FOR_CONFIG_DATA_OPTIONS } from './constants';
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
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')));
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }

    const validatedOptions = validationResult.data as CheckConfigOptions;
    const configData = loadConfigIfExists(validatedOptions.openapiConfig);

    if (!configData) {
        APP_LOGGER.error(LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND(validatedOptions.openapiConfig || ''));
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }

    try {
        const { isActualConfigVersion, hasDefaultValues, migratedData } = validateAndMigrateConfigData(configData);

        APP_LOGGER.info(LOGGER_MESSAGES.CONFIG.CONFIG_VALID(validatedOptions.openapiConfig || ''));

        // Если версия не актуальна, предложить обновление
        if (!isActualConfigVersion) {
            await selectConfigAction({
                migratedData,
                configPath: validatedOptions.openapiConfig || '',
                warningMessage: LOGGER_MESSAGES.CONFIG.WARNING_OUTDATED_CONFIG,
                actionChoices: ACTION_FOR_CONFIG_DATA_OPTIONS,
            });
            return;
        }

        // Если есть значения по умолчанию, предложить их удаление
        if (hasDefaultValues) {
            await selectConfigAction({
                migratedData,
                configPath: validatedOptions.openapiConfig || '',
                warningMessage: LOGGER_MESSAGES.CONFIG.WARNING_DEFAULT_VALUES,
                actionChoices: ACTION_FOR_CONFIG_DATA_OPTIONS,
            });
        }
    } catch (error) {
        handleConfigError(LOGGER_MESSAGES.CONFIG.CHECKING_FAILED, error);
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }
}

/**
 * Обрабатывает ошибки при работе с конфигурацией
 * @internal
 */
function handleConfigError(baseMessage: string, error: unknown): void {
    if (error instanceof Error && error.message) {
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.WITH_DETAILS(baseMessage, error.message));
    } else if (error) {
        APP_LOGGER.error(baseMessage, error);
    } else {
        APP_LOGGER.error(baseMessage);
    }
}
