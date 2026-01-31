import { z } from 'zod';

import { validateZodOptionsRaw } from '../../Validation/validateZodOptions';
import { VersionedSchema, VersionMatchResult } from '../Types';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from './getUniqueObjectKeys';

// Determining the most appropriate schema version
export function determineBestMatchingSchemaVersion(inputData: Record<string, any>, versionedSchemas: VersionedSchema<z.ZodTypeAny>[]): VersionMatchResult {
    if (!versionedSchemas.length) {
        throw new Error('The list of schemes cannot be empty');
    }

    const inputKeys = getUniqueObjectKeys(inputData);

    const matchingSchemas = versionedSchemas
        .map(({ schema, version }, idx) => {
            const validationResult = validateZodOptionsRaw(schema, inputData);
            const errorFields = !validationResult.success ? validationResult.error.issues.filter(err => err.code !== 'invalid_value') : [];

            return errorFields.length === 0 ? { version, index: idx } : null;
        })
        .filter((match): match is { version: string; index: number } => match !== null);

    if (matchingSchemas.length > 0) {
        const latestMatch = matchingSchemas.reduce((prev, curr) => (curr.index > prev.index ? curr : prev));
        return {
            lastVersionIndex: latestMatch.index,
            latestVersion: latestMatch.version,
            firstVersion: matchingSchemas[0].version,
        };
    }

    const schemaMatches = versionedSchemas.map(({ schema, version }, idx) => {
        const schemaKeys = getUniqueKeysFromSchemas([schema]);
        const validationResult = validateZodOptionsRaw(schema, inputData);
        const errorFields = !validationResult.success ? validationResult.error.issues.filter(err => err.code !== 'invalid_value') : [];
        const matchingKeys = inputKeys.filter(key => schemaKeys.has(key));

        return { index: idx, version, errorFields, matchingKeys };
    });

    const bestMatch = schemaMatches.reduce((best, current) => {
        const isBetterMatch = current.matchingKeys.length >= best.matchingKeys.length && current.errorFields.length <= best.errorFields.length;
        return isBetterMatch ? current : best;
    }, schemaMatches[0]);

    return {
        lastVersionIndex: bestMatch.index,
        latestVersion: bestMatch.version,
        firstVersion: bestMatch.version,
    };
}
