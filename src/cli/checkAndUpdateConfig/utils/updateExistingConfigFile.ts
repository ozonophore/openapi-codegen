import fs from 'fs';

import { APP_LOGGER } from '../../../common/Consts';
import { resolveHelper } from "../../../common/utils/pathHelpers";
import { fileSystem } from "../../../core/utils/fileSystem";

/**
 * Обновляет существующий файл конфигурации
 * @internal
 */
export async function updateExistingConfigFile(configPath: string, data: string): Promise<void> {
    const configFilePath = resolveHelper(process.cwd(), configPath);

    if (!fs.existsSync(configFilePath)) {
        throw new Error(`Configuration file not found at "${configPath}"`);
    }

    await fileSystem.writeFile(configFilePath, data);
    APP_LOGGER.forceInfo(`Configuration file "${configPath}" has been updated`);
}