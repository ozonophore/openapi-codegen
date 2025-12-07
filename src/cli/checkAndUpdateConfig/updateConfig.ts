import { APP_LOGGER } from '../../common/Consts';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
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
export async function updateConfig(configPath: string): Promise<void> {
    const configData = loadConfigIfExists(configPath);

    if (!configData) {
        APP_LOGGER.error(`${ERROR_MESSAGES.FILE_NOT_FOUND} ${configPath}`);
        return;
    }

    try {
        const { isActualConfigVersion, migratedData } = validateAndMigrateConfigData(configData);

        if (isActualConfigVersion) {
            APP_LOGGER.info(SUCCESS_MESSAGES.CONFIG_UP_TO_DATE(configPath));
        } else {
            await writeConfigFile({
                data: migratedData,
                configPath,
                isUpdating: true,
            });
        }
    } catch (error) {
        handleUpdateError(ERROR_MESSAGES.UPDATING_FAILED, error);
    }
}

/**
 * Обрабатывает ошибки при обновлении конфигурации
 * @internal
 */
function handleUpdateError(baseMessage: string, error: unknown): void {
    if (error instanceof Error && error.message) {
        APP_LOGGER.error(`${baseMessage}: ${error.message}`);
    } else if (error) {
        APP_LOGGER.error(baseMessage, error);
    } else {
        APP_LOGGER.error(baseMessage);
    }
}
