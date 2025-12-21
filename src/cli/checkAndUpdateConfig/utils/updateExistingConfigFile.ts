import fs from 'fs';

import { APP_LOGGER } from '../../../common/Consts';
import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";
import { resolveHelper } from "../../../common/utils/pathHelpers";

/**
 * Обновляет существующий файл конфигурации
 * @internal
 */
export async function updateExistingConfigFile(configPath: string, data: string): Promise<void> {
    const configFilePath = resolveHelper(process.cwd(), configPath);

    if (!fs.existsSync(configFilePath)) {
        throw new Error(`Configuration file not found at "${configPath}"`);
    }

    await fileSystemHelpers.writeFile(configFilePath, data);
    APP_LOGGER.forceInfo(`Configuration file "${configPath}" has been updated`);
}