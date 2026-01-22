import path from 'path';

import { APP_LOGGER } from '../../../common/Consts';
import { TRawOptions } from '../../../common/TRawOptions';
import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { format } from '../../../common/utils/format';
import { resolveHelper } from '../../../common/utils/pathHelpers';
import { CLITemplates } from '../Types';

/**
 * Записывает конфигурацию в файл
 * @param configPath - Путь к файлу конфигурации
 * @param config - Объект конфигурации для записи
 * @param templates
 * @throws {Error} Если не удалось записать файл
 */
export async function writeConfigFile(configPath: string, config: TRawOptions, templates: CLITemplates): Promise<void> {
    const resolvedPath = resolveHelper(process.cwd(), configPath);
    const configDir = path.dirname(resolvedPath);
    
    // Создаем директорию, если она не существует
    const dirExists = await fileSystemHelpers.exists(configDir);
    if (!dirExists) {
        await fileSystemHelpers.mkdir(configDir);
    }

    const templateResult = templates.config(config);
    const formattedValue = await format(templateResult, 'json');
    
    await fileSystemHelpers.writeFile(resolvedPath, formattedValue);
    APP_LOGGER.info(`Configuration file created: ${resolvedPath}`);
}