import { Diff, diff as deepDiff } from 'deep-diff';
import equal from 'fast-deep-equal';

import { parseJsonPath, toJsonPath } from '../../common/utils/jsonPath';
import { normalizeObject } from '../../common/utils/normalizeObject';
import { getTypeSignature } from './miracles';
import type { DiffAction, DiffEntry, JsonValue } from './types';

/**
 * Проверяет, содержит ли путь сегменты, указывающие на полиморфную схему (oneOf/anyOf).
 * @param segments сегменты json-path
 * @returns true если встречены полиморфные сегменты
 */
export const hasPolymorphicSegment = (segments: (string | number)[]): boolean => {
    return segments.includes('oneOf') || segments.includes('anyOf');
};

/**
 * Классифицирует серьёзность изменения по действию (added/removed/changed).
 * @param action действие изменения
 * @returns уровень серьёзности
 */
export const classifySeverity = (action: DiffAction) => {
    if (action === 'removed') {
        return 'breaking';
    }

    if (action === 'changed') {
        return 'warning';
    }

    return 'info';
};

/**
 * Строит единичную запись отличия из набора сегментов пути и значений.
 * Добавляет заметку при полиморфных изменениях.
 * @param action действие изменения
 * @param segments сегменты пути
 * @param from предыдущее значение
 * @param to новое значение
 * @returns готовая запись DiffEntry
 */
export const buildDiffEntry = (action: DiffAction, segments: (string | number)[], from?: JsonValue, to?: JsonValue): DiffEntry => {
    const path = toJsonPath(segments);
    if (hasPolymorphicSegment(segments)) {
        return {
            action: 'changed',
            path,
            from,
            to,
            severity: 'warning',
            note: 'Manual review required: polymorphic schema change',
            type: 'POLYMORPHIC_CHANGE',
        };
    }
    return {
        action,
        path,
        from,
        to,
        severity: classifySeverity(action),
    };
};

/**
 * Возвращает имя корневой схемы из сегментов пути, если путь указывает на components.schemas или definitions.
 * @param segments сегменты json-path
 * @returns имя схемы или null
 */
const getSchemaRootName = (segments: (string | number)[]): string | null => {
    const s = segments.map(String);
    if (s[0] === 'components' && s[1] === 'schemas') return s[2] ?? null;
    if (s[0] === 'definitions') return s[1] ?? null;
    return null;
};

/**
 * Извлекает имя свойства из сегментов пути (ищет 'properties' и следующий сегмент).
 * @param segments сегменты json-path
 * @returns имя свойства или null
 */
const getPropertyNameFromSegments = (segments: (string | number)[]): string | null => {
    const s = segments.map(String);
    const propsIndex = s.indexOf('properties');
    if (propsIndex === -1) return null;
    return s[propsIndex + 1] ?? null;
};

/**
 * Пытается классифицировать тип изменения по структуре json-path и самой записи.
 * Возвращает семантические коды типа изменения (METHOD_REMOVED, PROPERTY_ADDED и т.д.).
 * @param entry запись diff
 * @returns код типа изменения или undefined
 */
export const classifyDiffType = (entry: DiffEntry): string | undefined => {
    const segments = parseJsonPath(entry.path);
    const s = segments.map(String);

    if (s[0] === 'paths') {
        const hasMethod = s.length >= 3;
        const isMethodRoot = s.length === 3;
        if (hasMethod && isMethodRoot) {
            if (entry.action === 'removed') return 'METHOD_REMOVED';
            if (entry.action === 'added') return 'METHOD_ADDED';
            return 'METHOD_CHANGED';
        }
        return 'PATH_CHANGED';
    }

    const schemaName = getSchemaRootName(s);
    if (schemaName) {
        const isSchemaRoot = s.length <= 3;
        if (isSchemaRoot) {
            if (entry.action === 'removed') return 'SCHEMA_REMOVED';
            if (entry.action === 'added') return 'SCHEMA_ADDED';
            return 'SCHEMA_CHANGED';
        }

        const propertyName = getPropertyNameFromSegments(s);
        if (propertyName) {
            const fromType = getTypeSignature((entry.from ?? {}) as Record<string, unknown>);
            const toType = getTypeSignature((entry.to ?? {}) as Record<string, unknown>);
            if (entry.action === 'changed' && fromType && toType && fromType !== toType) {
                return 'TYPE_CHANGED';
            }
            if (entry.action === 'removed') return 'PROPERTY_REMOVED';
            if (entry.action === 'added') return 'PROPERTY_ADDED';
            return 'PROPERTY_CHANGED';
        }

        return 'SCHEMA_CHANGED';
    }

    return undefined;
};

/**
 * Добавляет поле type к каждой записи diff, вычисленное через classifyDiffType, если отсутствует.
 * @param entries массив записей diff
 * @returns массив записей с полем type
 */
export const withDiffType = (entries: DiffEntry[]): DiffEntry[] => {
    return entries.map(entry => ({
        ...entry,
        type: entry.type ?? classifyDiffType(entry),
    }));
};

/**
 * Преобразует единичный объект отличия из deep-diff в один или несколько DiffEntry.
 * Обрабатывает массивные/индексные отличия (kind 'A') рекурсивно.
 * @param difference объект отличия от deep-diff
 * @returns массив DiffEntry
 */
export const diffToEntries = (difference: Diff<unknown, unknown>): DiffEntry[] => {
    if (difference.kind === 'A') {
        const segments = [...(difference.path ?? []), difference.index];
        const item = difference.item;
        if (item.kind === 'A') {
            return diffToEntries({ ...item, path: segments } as Diff<unknown, unknown>);
        }
        if (item.kind === 'N') {
            return [buildDiffEntry('added', segments, undefined, item.rhs)];
        }
        if (item.kind === 'D') {
            return [buildDiffEntry('removed', segments, item.lhs, undefined)];
        }
        if (item.kind === 'E') {
            return [buildDiffEntry('changed', segments, item.lhs, item.rhs)];
        }
        return [];
    }

    const segments = difference.path ?? [];
    if (difference.kind === 'N') {
        return [buildDiffEntry('added', segments, undefined, difference.rhs)];
    }
    if (difference.kind === 'D') {
        return [buildDiffEntry('removed', segments, difference.lhs, undefined)];
    }
    if (difference.kind === 'E') {
        return [buildDiffEntry('changed', segments, difference.lhs, difference.rhs)];
    }
    return [];
};

/**
 * Собирает все записи отличий между двумя JSON-структурами: старой и новой.
 * Выполняет глубокое сравнение и маппинг на DiffEntry.
 * @param oldValue старая версия спецификации
 * @param newValue новая версия спецификации
 * @returns массив DiffEntry
 */
export const collectDiffEntries = (oldValue: JsonValue, newValue: JsonValue): DiffEntry[] => {
    if (equal(oldValue, newValue)) {
        return [];
    }
    const differences = deepDiff(oldValue as Record<string, unknown>, newValue as Record<string, unknown>) ?? [];
    return differences.flatMap(diffToEntries);
};

export const normalizeForDiff = (value: JsonValue): JsonValue => {
    // обёртка вокруг normalizeObject, если нужно
    return normalizeObject(value);
};
