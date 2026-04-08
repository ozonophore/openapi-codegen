import camelCase from 'camelcase';
import leven from 'leven';

import { parseJsonPath, toJsonPath } from '../../common/utils/jsonPath';
import type { DiffEntry, JsonValue, MiracleEntry } from './types';

type PropertyChange = {
    schemaPath: string;
    schemaName: string;
    propertyName: string;
    entry: DiffEntry;
    payload: Record<string, unknown>;
    typeSignature?: string;
    description?: string;
    scalarType?: string;
};

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
 * Извлекает и тримит описание свойства, если оно присутствует.
 * @param payload объект описания свойства
 * @returns описание или undefined
 */
export const getDescription = (payload: Record<string, unknown>): string | undefined => {
    if (typeof payload.description === 'string') {
        return payload.description.trim();
    }
    return undefined;
};

/**
 * Пытается извлечь подробную информацию об изменении свойства схемы из записи diff.
 * Возвращает null если запись не представляет изменение свойства.
 * @param entry запись diff
 * @returns объект PropertyChange или null
 */
export const extractPropertyChange = (entry: DiffEntry): PropertyChange | null => {
    const segments = parseJsonPath(entry.path);
    const propertiesIndex = segments.indexOf('properties');
    if (propertiesIndex === -1 || propertiesIndex + 1 !== segments.length - 1) {
        return null;
    }

    const schemaPath = segments.slice(0, propertiesIndex).join('.');
    const schemaName = segments[propertiesIndex - 1] ?? '';
    const propertyName = segments[propertiesIndex + 1];
    if (!schemaName || !propertyName) return null;

    const payload = (entry.action === 'removed' ? entry.from : entry.to) as Record<string, unknown> | undefined;
    if (!payload || typeof payload !== 'object') return null;

    return {
        schemaPath,
        schemaName,
        propertyName,
        entry,
        payload,
        typeSignature: getTypeSignature(payload),
        description: getDescription(payload),
        scalarType: normalizeScalarType(getTypeSignature(payload)),
    };
};

/**
 * Определяет, указывает ли путь записи на свойство в схеме (содержит 'properties').
 * @param entry запись diff
 * @returns true если путь относится к свойству схемы
 */
export const isSchemaPropertyPath = (entry: DiffEntry): boolean => {
    const segments = parseJsonPath(entry.path);
    return segments.includes('properties');
};

/**
 * Оценивает, могут ли два изменения (удаление и добавление) являться кандидатами на совпадение (rename).
 * Сравнивает путь схемы и, при наличии, сигнатуры типов.
 * @param removed информация об удалённом свойстве
 * @param added информация о добавленном свойстве
 * @returns true если кандидаты совместимы
 */
export const isSimilarityCandidate = (removed: PropertyChange, added: PropertyChange): boolean => {
    if (removed.schemaPath !== added.schemaPath) return false;

    if (removed.typeSignature && added.typeSignature) {
        return removed.typeSignature === added.typeSignature;
    }

    return true;
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

/**
 * Собирает карту путей свойств → нормализованный скалярный тип из спецификации.
 * @param spec спецификация OpenAPI
 * @returns Map с json-path как ключом и скалярным типом как значением
 */
export const collectPropertyScalarTypes = (spec: JsonValue): Map<string, string> => {
    const result = new Map<string, string>();
    if (!spec || typeof spec !== 'object') return result;

    const record = spec as Record<string, unknown>;
    const schemas = (record.components && typeof record.components === 'object' ? (record.components as Record<string, unknown>).schemas : undefined) ?? record.definitions;

    if (!schemas || typeof schemas !== 'object') return result;

    for (const [schemaName, schemaValue] of Object.entries(schemas as Record<string, unknown>)) {
        if (!schemaValue || typeof schemaValue !== 'object') continue;
        const schema = schemaValue as Record<string, unknown>;
        const properties = schema.properties as Record<string, unknown> | undefined;
        if (!properties || typeof properties !== 'object') continue;

        for (const [propertyName, propertyValue] of Object.entries(properties)) {
            if (!propertyValue || typeof propertyValue !== 'object') continue;
            const property = propertyValue as Record<string, unknown>;
            const typeSignature = getTypeSignature(property);
            const scalar = normalizeScalarType(typeSignature);
            if (!scalar) continue;

            const baseSegments = record.components ? ['components', 'schemas', schemaName] : ['definitions', schemaName];
            const path = toJsonPath([...baseSegments, 'properties', propertyName]);
            result.set(path, scalar);
        }
    }

    return result;
};

/**
 * Формирует список эвристических находок (miracles): переименования и коэрцирования типов.
 * Сравнивает удалённые/добавленные свойства и изменения типов, добавляет записи с confidence.
 * @param entries все собранные записи diff
 * @param oldSpec нормализованная старая спецификация
 * @param newSpec нормализованная новая спецификация
 * @returns массив MiracleEntry
 */
export const buildMiracles = (entries: DiffEntry[], oldSpec: JsonValue, newSpec: JsonValue): MiracleEntry[] => {
    const removedProps: PropertyChange[] = [];
    const addedProps: PropertyChange[] = [];
    const changedTypeProps: Array<{ path: string; fromType?: string; toType?: string }> = [];

    for (const entry of entries) {
        if (!isSchemaPropertyPath(entry)) continue;
        if (entry.action === 'removed' || entry.action === 'added') {
            const change = extractPropertyChange(entry);
            if (!change) continue;
            if (entry.action === 'removed') {
                removedProps.push(change);
            } else {
                addedProps.push(change);
            }
            continue;
        }

        if (entry.action === 'changed') {
            const segments = parseJsonPath(entry.path);
            if (segments[segments.length - 1] !== 'type') continue;
            const propertyPath = toJsonPath(segments.slice(0, -1));
            const fromTypeRaw = typeof entry.from === 'string' ? entry.from : getTypeSignature((entry.from ?? {}) as Record<string, unknown>);
            const toTypeRaw = typeof entry.to === 'string' ? entry.to : getTypeSignature((entry.to ?? {}) as Record<string, unknown>);
            const fromType = normalizeScalarType(fromTypeRaw);
            const toType = normalizeScalarType(toTypeRaw);
            if (!fromType || !toType || fromType === toType) continue;
            changedTypeProps.push({
                path: propertyPath,
                fromType,
                toType,
            });
        }
    }

    const miracles: MiracleEntry[] = [];

    for (const removed of removedProps) {
        const candidates = addedProps.filter(added => isSimilarityCandidate(removed, added));
        if (candidates.length === 0) continue;

        const removedName = normalizeName(removed.propertyName);
        if (!removedName) continue;

        let best: { candidate: PropertyChange; ratio: number } | null = null;
        for (const candidate of candidates) {
            const addedName = normalizeName(candidate.propertyName);
            if (!addedName) continue;
            const distance = leven(removedName, addedName);
            const ratio = distance / Math.max(removedName.length, addedName.length);
            if (!best || ratio < best.ratio) {
                best = { candidate, ratio };
            }
        }

        if (!best) continue;
        if (best.ratio > 0.2) continue;

        const sameType = !!removed.typeSignature && !!best.candidate.typeSignature && removed.typeSignature === best.candidate.typeSignature;
        const onlyCandidate = candidates.length === 1;
        const descBonus = descriptionSimilarityBonus(removed.description, best.candidate.description);
        const confidence = computeConfidence(best.ratio, sameType, onlyCandidate, descBonus);

        miracles.push({
            oldPath: removed.entry.path,
            newPath: best.candidate.entry.path,
            type: 'RENAME',
            confidence,
            status: 'auto-generated',
        });
    }

    const typeCoercionPaths = new Set<string>();

    for (const change of changedTypeProps) {
        typeCoercionPaths.add(change.path);
        miracles.push({
            oldPath: change.path,
            newPath: change.path,
            type: 'TYPE_COERCION',
            confidence: 1,
            status: 'auto-generated',
        });
    }

    const oldTypes = collectPropertyScalarTypes(oldSpec);
    const newTypes = collectPropertyScalarTypes(newSpec);
    for (const [path, oldType] of oldTypes.entries()) {
        const newType = newTypes.get(path);
        if (!newType || newType === oldType) continue;
        if (typeCoercionPaths.has(path)) continue;
        typeCoercionPaths.add(path);
        miracles.push({
            oldPath: path,
            newPath: path,
            type: 'TYPE_COERCION',
            confidence: 1,
            status: 'auto-generated',
        });
    }

    return miracles;
};
