import { APP_LOGGER } from "../../../common/Consts";
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
    APP_LOGGER.forceInfo(
        `Example configuration generated and written to: ${examplePath}\n` +
        `You can use it as a template for your actual configuration.`
    );
}