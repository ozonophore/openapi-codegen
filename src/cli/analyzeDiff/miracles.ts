import camelCase from 'camelcase';
import leven from 'leven';

/**
 * Нормализует строковое имя (удаляет спецсимволы, приводит к camelCase и lower-case).
 * @param value исходная строка
 * @returns нормализованное имя
 */
export const normalizeName = (value: string): string => {
    const clean = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    if (!clean) {
        return value.toLowerCase();
    }
    return camelCase(clean).toLowerCase();
};

/**
 * Получает сигнатуру типа из описания свойства схемы (учитывает $ref, type, oneOf/anyOf/allOf).
 * @param payload объект описания свойства
 * @returns строковая сигнатура типа или undefined
 */
export const getTypeSignature = (payload: Record<string, unknown>): string | undefined => {
    if (typeof payload.$ref === 'string') {
        return `ref:${payload.$ref}`;
    }
    if (typeof payload.type === 'string') {
        return String(payload.type);
    }
    if (Array.isArray(payload.oneOf)) {
        return 'oneOf';
    }
    if (Array.isArray(payload.anyOf)) {
        return 'anyOf';
    }
    if (Array.isArray(payload.allOf)) {
        return 'allOf';
    }
    return undefined;
};

/**
 * Приводит разные обозначения скалярных типов к общим (number/string/boolean).
 * @param value строковая сигнатура типа
 * @returns нормализованный скалярный тип или undefined
 */
export const normalizeScalarType = (value?: string): string | undefined => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized === 'int' || normalized === 'integer') return 'number';
    if (normalized === 'float' || normalized === 'double') return 'number';
    if (normalized === 'string') return 'string';
    if (normalized === 'number') return 'number';
    if (normalized === 'boolean') return 'boolean';
    return undefined;
};

/**
 * Вычисляет бонус к confidence на основе схожести описаний свойств.
 * @param removed описание для удалённого свойства
 * @param added описание для добавленного свойства
 * @returns числовой бонус (0..0.05)
 */
export const descriptionSimilarityBonus = (removed?: string, added?: string): number => {
    if (!removed || !added) return 0;
    const a = normalizeName(removed);
    const b = normalizeName(added);
    if (!a || !b) return 0;
    const distance = leven(a, b);
    const ratio = distance / Math.max(a.length, b.length);
    return ratio <= 0.4 ? 0.05 : 0;
};

/**
 * Комбинирует факторы в итоговую confidence (0..1) для RENAME эвристики.
 * @param nameRatio нормализованное расстояние имён
 * @param sameType флаг совпадения сигнатур типов
 * @param onlyCandidate флаг единственного кандидата
 * @param descBonus бонус от схожести описаний
 * @returns итоговое confidence
 */
export const computeConfidence = (nameRatio: number, sameType: boolean, onlyCandidate: boolean, descBonus: number): number => {
    let confidence = 1 - nameRatio;
    if (sameType) confidence += 0.1;
    if (onlyCandidate) confidence += 0.05;
    confidence += descBonus;
    if (confidence > 1) confidence = 1;
    if (confidence < 0) confidence = 0;
    return Number(confidence.toFixed(3));
};
