import { APP_LOGGER } from "../../../common/Consts";
import { LOGGER_MESSAGES } from "../../../common/LoggerMessages";
import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";

/**
 * Создает файл с примером конфигурации
 * @internal
 */
export async function writeExampleConfigFile(configPath: string, data: string): Promise<void> {
    const pathParts = configPath.split('/');
    const fileName = pathParts.pop();
    const exampleFileName = `example-config-${fileName}`;
    const examplePath = [...pathParts, exampleFileName].join('/');

    await fileSystemHelpers.writeFile(examplePath, data);
    APP_LOGGER.forceInfo(LOGGER_MESSAGES.CONFIG.EXAMPLE_CONFIG_CREATED(examplePath));
}
