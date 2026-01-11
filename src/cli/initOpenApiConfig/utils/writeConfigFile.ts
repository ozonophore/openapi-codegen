import path from 'path';

import { APP_LOGGER } from '../../../common/Consts';
import { TRawOptions } from '../../../common/TRawOptions';
import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { format } from '../../../common/utils/format';
import { resolveHelper } from '../../../common/utils/pathHelpers';

/**
 * Записывает конфигурацию в файл
 * @param configPath - Путь к файлу конфигурации
 * @param config - Объект конфигурации для записи
 * @throws {Error} Если не удалось записать файл
 */
export async function writeConfigFile(configPath: string, config: TRawOptions): Promise<void> {
    const resolvedPath = resolveHelper(process.cwd(), configPath);
    const configDir = path.dirname(resolvedPath);
    
    // Создаем директорию, если она не существует
    const dirExists = await fileSystemHelpers.exists(configDir);
    if (!dirExists) {
        await fileSystemHelpers.mkdir(configDir);
    }

    const jsonString = JSON.stringify(config, null, 2);
    const formattedData = await format(jsonString, 'json');
    
    await fileSystemHelpers.writeFile(resolvedPath, formattedData);
    APP_LOGGER.info(`Configuration file created: ${resolvedPath}`);
}