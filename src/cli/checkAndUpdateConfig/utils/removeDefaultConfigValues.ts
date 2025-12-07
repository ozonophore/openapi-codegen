import { COMMON_DEFAULT_OPTIONS_VALUES } from "../../../common/Consts";

/**
 * Удаляет из конфигурации значения, которые совпадают с значениями по умолчанию.
 * Это очищает конфиг от излишних ключей и делает его более читаемым.
 *
 * @param configData - Данные конфигурации
 * @returns Конфигурация без значений по умолчанию
 *
 * @example
 * const cleaned = removeDefaultConfigValues({ 
 *   input: './spec.json',
 *   httpClient: 'fetch', // Удалится, это значение по умолчанию
 *   output: './generated'
 * });
 * // Returns { input: './spec.json', output: './generated' }
 */
export function removeDefaultConfigValues(
    configData: Record<string, any>
): Record<string, any> {
    return Object.entries(configData).reduce<Record<string, any>>((cleaned, [key, value]) => {
        const defaultValue = COMMON_DEFAULT_OPTIONS_VALUES?.[key as keyof typeof COMMON_DEFAULT_OPTIONS_VALUES];

        // Добавить значение только если оно отличается от дефолтного
        if (value !== defaultValue) {
            cleaned[key] = value;
        }

        return cleaned;
    }, {});
}