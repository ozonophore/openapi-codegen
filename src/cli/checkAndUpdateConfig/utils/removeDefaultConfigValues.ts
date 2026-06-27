import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Структурное сравнение значений (примитивы, массивы, plain objects).
 * @param a первое значение
 * @param b второе значение
 * @returns true, если значения эквивалентны по структуре
 */
function isDeepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }

        return a.every((item, index) => isDeepEqual(item, b[index]));
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        return keysA.every(key => isDeepEqual(a[key], b[key]));
    }

    return false;
}

function removeDefaultValue(value: unknown, defaultValue: unknown): unknown | undefined {
    if (Array.isArray(value)) {
        const cleanedItems = value.map(item => (isPlainObject(item) ? removeDefaultConfigValues(item as Record<string, unknown>) : item));
        if (cleanedItems.length === 0) {
            return undefined;
        }
        if (defaultValue === undefined) {
            return cleanedItems;
        }
        return isDeepEqual(cleanedItems, defaultValue) ? undefined : cleanedItems;
    }

    if (defaultValue === undefined) {
        return value;
    }

    if (isPlainObject(value) && isPlainObject(defaultValue)) {
        const cleanedObject = removeDefaultConfigValues(value as Record<string, unknown>, defaultValue as Record<string, unknown>);
        return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
    }

    return isDeepEqual(value, defaultValue) ? undefined : value;
}

/**
 * Удаляет из конфигурации значения, совпадающие с дефолтами (включая вложенные объекты и `items[]`).
 * @param configData данные конфигурации после миграции
 * @param [defaults] эталон дефолтов; по умолчанию `COMMON_DEFAULT_OPTIONS_VALUES`
 * @returns конфигурация без избыточных ключей
 *
 * @example
 * const cleaned = removeDefaultConfigValues({
 *   input: './spec.json',
 *   httpClient: 'fetch',
 *   output: './generated',
 * });
 * // { input: './spec.json', output: './generated' }
 */
export function removeDefaultConfigValues(configData: Record<string, unknown>, defaults: Record<string, unknown> = COMMON_DEFAULT_OPTIONS_VALUES): Record<string, unknown> {
    return Object.entries(configData).reduce<Record<string, unknown>>((cleaned, [key, value]) => {
        const defaultValue = defaults[key];
        const cleanedValue = removeDefaultValue(value, defaultValue);

        if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
        }

        return cleaned;
    }, {});
}

export { isDeepEqual };
