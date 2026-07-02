import leven from 'leven';

import type { SemanticDiffChange } from '../semanticDiff/analyzeOpenApiDiff';
import { computeConfidence, descriptionSimilarityBonus, getTypeSignature, normalizeName, normalizeScalarType } from '../semanticDiff/miracleHeuristics';
import type { MiracleEntry } from '../types/shared/Miracle.model';
import { semanticPointerToJsonPath } from './semanticPointerToJsonPath';

type SemanticPropertyChange = {
    schemaPath: string;
    schemaName: string;
    propertyName: string;
    jsonPath: string;
    payload: Record<string, unknown>;
    typeSignature?: string;
    description?: string;
};

const SCHEMA_PROPERTY_POINTER_REGEX = /^#\/components\/schemas\/([^/]+)\/properties\/([^/]+)$/;

/**
 * Разбирает JSON Pointer свойства схемы в метаданные изменения.
 * @param path JSON Pointer путь к свойству
 * @returns метаданные изменения или null, если путь не относится к свойству схемы
 */
export function parseSchemaPropertyPointer(path: string): Omit<SemanticPropertyChange, 'payload' | 'typeSignature' | 'description'> | null {
    const match = path.match(SCHEMA_PROPERTY_POINTER_REGEX);
    if (!match) {
        return null;
    }

    const schemaName = match[1];
    const propertyName = match[2];

    return {
        schemaPath: `components.schemas.${schemaName}`,
        schemaName,
        propertyName,
        jsonPath: semanticPointerToJsonPath(path),
    };
}

const toPayload = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === 'object') {
        return value as Record<string, unknown>;
    }

    if (typeof value === 'string') {
        return { type: value };
    }

    return {};
};

const extractSemanticPropertyChange = (change: SemanticDiffChange, action: 'removed' | 'added'): SemanticPropertyChange | null => {
    const parsed = parseSchemaPropertyPointer(change.path);
    if (!parsed) {
        return null;
    }

    const payload = toPayload(action === 'removed' ? change.from : change.to);
    const typeSignature = getTypeSignature(payload) ?? (typeof change.from === 'string' ? change.from : typeof change.to === 'string' ? change.to : undefined);

    return {
        ...parsed,
        payload,
        typeSignature,
    };
};

const isSimilarityCandidate = (removed: SemanticPropertyChange, added: SemanticPropertyChange): boolean => {
    if (removed.schemaPath !== added.schemaPath) {
        return false;
    }

    if (removed.typeSignature && added.typeSignature) {
        return removed.typeSignature === added.typeSignature;
    }

    return true;
};

/**
 * Строит miracles типов RENAME и TYPE_COERCION из семантических изменений.
 * @param changes список семантических изменений
 * @returns список miracles
 */
export function buildMiraclesFromSemanticChanges(changes: SemanticDiffChange[]): MiracleEntry[] {
    const removedProps: SemanticPropertyChange[] = [];
    const addedProps: SemanticPropertyChange[] = [];
    const miracles: MiracleEntry[] = [];

    for (const change of changes) {
        if (change.type === 'model.property.removed') {
            const removed = extractSemanticPropertyChange(change, 'removed');
            if (removed) {
                removedProps.push(removed);
            }
            continue;
        }

        if (change.type === 'model.property.added') {
            const added = extractSemanticPropertyChange(change, 'added');
            if (added) {
                addedProps.push(added);
            }
            continue;
        }

        if (change.type !== 'model.property.type.changed') {
            continue;
        }

        const parsed = parseSchemaPropertyPointer(change.path);
        if (!parsed) {
            continue;
        }

        const fromType = normalizeScalarType(typeof change.from === 'string' ? change.from : undefined);
        const toType = normalizeScalarType(typeof change.to === 'string' ? change.to : undefined);
        if (!fromType || !toType || fromType === toType) {
            continue;
        }

        miracles.push({
            oldPath: parsed.jsonPath,
            newPath: parsed.jsonPath,
            type: 'TYPE_COERCION',
            confidence: 1,
            status: 'auto-generated',
        });
    }

    for (const removed of removedProps) {
        const candidates = addedProps.filter(added => isSimilarityCandidate(removed, added));
        if (candidates.length === 0) {
            continue;
        }

        const removedName = normalizeName(removed.propertyName);
        if (!removedName) {
            continue;
        }

        let best: { candidate: SemanticPropertyChange; ratio: number } | null = null;
        for (const candidate of candidates) {
            const addedName = normalizeName(candidate.propertyName);
            if (!addedName) {
                continue;
            }

            const distance = leven(removedName, addedName);
            const ratio = distance / Math.max(removedName.length, addedName.length);
            if (!best || ratio < best.ratio) {
                best = { candidate, ratio };
            }
        }

        if (!best || best.ratio > 0.2) {
            continue;
        }

        const sameType = !!removed.typeSignature && !!best.candidate.typeSignature && removed.typeSignature === best.candidate.typeSignature;
        const onlyCandidate = candidates.length === 1;
        const descBonus = descriptionSimilarityBonus(removed.description, best.candidate.description);
        const confidence = computeConfidence(best.ratio, sameType, onlyCandidate, descBonus);

        miracles.push({
            oldPath: removed.jsonPath,
            newPath: best.candidate.jsonPath,
            type: 'RENAME',
            confidence,
            status: 'auto-generated',
            modelName: removed.schemaName,
            oldProperty: removed.propertyName,
            newProperty: best.candidate.propertyName,
        });
    }

    return miracles;
}
