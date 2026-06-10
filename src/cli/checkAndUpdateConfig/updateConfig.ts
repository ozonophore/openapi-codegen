import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation';
import { UpdateConfigOptions, updateConfigOptionsSchema } from '../schemas';
import { CLICommandResult } from '../types';
import { validateAndMigrateConfigData } from './utils/validateAndMigrateConfigData';
import { writeConfigFile } from './utils/writeConfigFile';

/**
 * Обновляет конфигурационный файл до актуальной версии.
 * Выполняет миграцию данных при необходимости.
 *
 * @param configPath - Путь к файлу конфигурации
 * @throws Перебрасывает ошибки валидации и работы с файлами
 *
 * @example
 * await updateConfig('./openapi-config.json');
 */
export async function updateConfig(options: OptionValues): Promise<CLICommandResult> {
    const validationResult = validateZodOptions(updateConfigOptionsSchema, options);

    if (!validationResult.success) {
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: validationResult.errors.join('\n') };
    }

    const validatedOptions = validationResult.data as UpdateConfigOptions;

    const configData = loadConfigIfExists(validatedOptions.openapiConfig);

    if (!configData) {
        APP_LOGGER.error(LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND(validatedOptions.openapiConfig || ''));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND(validatedOptions.openapiConfig || '') };
    }

    try {
        const { isActualConfigVersion, migratedData } = validateAndMigrateConfigData(configData);

        if (isActualConfigVersion) {
            APP_LOGGER.info(LOGGER_MESSAGES.CONFIG.CONFIG_UP_TO_DATE(validatedOptions.openapiConfig || ''));
        } else {
            await writeConfigFile({
                data: migratedData,
                configPath: validatedOptions.openapiConfig || '',
                isUpdating: true,
            });
        }
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: true };
    } catch (error) {
        handleUpdateError(LOGGER_MESSAGES.CONFIG.UPDATING_FAILED, error);
        await APP_LOGGER.shutdownLoggerAsync();
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
    }
}

/**
 * Обрабатывает ошибки при обновлении конфигурации
 * @internal
 */
function handleUpdateError(baseMessage: string, error: unknown): void {
    if (error instanceof Error && error.message) {
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.WITH_DETAILS(baseMessage, error.message));
    } else if (error) {
        APP_LOGGER.error(baseMessage, error);
    } else {
        APP_LOGGER.error(baseMessage);
    }
}
