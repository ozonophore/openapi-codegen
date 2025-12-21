import { prepareConfigData } from "./prepareConfigData";
import { updateExistingConfigFile } from "./updateExistingConfigFile";
import { writeExampleConfigFile } from "./writeExampleConfigFile";

interface IWriteConfigFileOptions {
    /** Данные для записи */
    data: Record<string, any>;
    /** Путь к файлу конфигурации */
    configPath: string;
    /** Если true - обновить существующий файл, иначе создать пример */
    isUpdating: boolean;
}

/**
 * Записывает или обновляет файл конфигурации.
 * Поддерживает как обновление существующего файла, так и создание примера.
 *
 * @param options - Опции записи файла
 * @throws {Error} Если путь не найден или ошибка при записи
 *
 * @example
 * // Обновить существующий конфиг
 * await writeConfigFile({
 *   data: migratedData,
 *   configPath: './openapi-config.json',
 *   isUpdating: true,
 * });
 *
 * @example
 * // Создать файл с примером
 * await writeConfigFile({
 *   data: migratedData,
 *   configPath: './openapi-config.json',
 *   isUpdating: false,
 * });
 */
export async function writeConfigFile({
    data,
    configPath,
    isUpdating,
}: IWriteConfigFileOptions): Promise<void> {
    const preparedData = await prepareConfigData(data);

    if (!preparedData) {
        throw new Error('Failed to prepare configuration data for writing');
    }

    if (isUpdating) {
        await updateExistingConfigFile(configPath, preparedData);
    } else {
        await writeExampleConfigFile(configPath, preparedData);
    }
}