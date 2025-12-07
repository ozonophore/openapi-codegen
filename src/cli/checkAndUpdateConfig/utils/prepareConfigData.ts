import { format } from "../../../common/utils/format";

/**
 * Подготавливает данные конфигурационного файла к записи.
 * Выполняет сериализацию в JSON и форматирование через Prettier.
 *
 * @param configData - Данные конфигурации для форматирования
 * @returns Отформатированные данные, готовые к записи в файл
 * @throws {Error} Если форматирование не удалось
 *
 * @example
 * const formatted = await prepareConfigData({ input: './spec.json', output: './generated' });
 * // Returns JSON string formatted with Prettier
 */
export async function prepareConfigData(configData: Record<string, any>): Promise<string> {
    try {
        const jsonString = JSON.stringify(configData);
        const formattedData = await format(jsonString, 'json-stringify');

        if (!formattedData) {
            throw new Error('Failed to format configuration data');
        }

        return formattedData;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Configuration data preparation failed: ${errorMessage}`);
    }
}