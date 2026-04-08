import fs from 'fs';

import { APP_LOGGER } from '../../../common/Consts';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";
import { resolveHelper } from "../../../common/utils/pathHelpers";

/**
 * Обновляет существующий файл конфигурации
 * @internal
 */
export async function updateExistingConfigFile(configPath: string, data: string): Promise<void> {
    const configFilePath = resolveHelper(process.cwd(), configPath);

    if (!fs.existsSync(configFilePath)) {
        throw new Error(LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND_AT(configPath));
    }

    await fileSystemHelpers.writeFile(configFilePath, data);
    APP_LOGGER.forceInfo(LOGGER_MESSAGES.CONFIG.FILE_UPDATED(configPath));
}
