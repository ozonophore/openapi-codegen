import { z } from 'zod';

import { validateZodOptionsRaw } from '../../Validation/validateZodOptions';
import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema, VersionMatchResult } from '../Types';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from './getUniqueObjectKeys';

/**
 * Normalized score data used to compare version candidates.
 */
type SchemaMatchCandidate = {
    index: number;
    version: string;
    type: EVersionedSchemaType;
    structuralErrorCount: number;
    strictUnrecognizedKeyCount: number;
    matchingKeysCount: number;
};

/**
 * Counts unknown keys using a strict schema variant.
 * The strict check is used only for ranking candidates, not for final validation.
 */
function getStrictUnrecognizedKeyCount(schema: z.ZodObject<any>, inputData: Record<string, any>): number {
    const strictResult = validateZodOptionsRaw(schema.strict(), inputData);

    if (strictResult.success) {
        return 0;
    }

    return strictResult.error.issues.reduce((count, issue) => {
        if (issue.code !== 'unrecognized_keys' || !('keys' in issue)) {
            return count;
        }

        return count + issue.keys.length;
    }, 0);
}

/**
 * Compares two schema candidates and returns the better one.
 * Priority:
 * 1) fewer structural errors;
 * 2) fewer strict-mode unknown keys;
 * 3) more matching keys;
 * 4) newer version inside the same schema family;
 * 5) lower index when schema families differ.
 */
function compareCandidates(best: SchemaMatchCandidate, current: SchemaMatchCandidate): SchemaMatchCandidate {
    if (current.structuralErrorCount !== best.structuralErrorCount) {
        return current.structuralErrorCount < best.structuralErrorCount ? current : best;
    }

    if (current.strictUnrecognizedKeyCount !== best.strictUnrecognizedKeyCount) {
        return current.strictUnrecognizedKeyCount < best.strictUnrecognizedKeyCount ? current : best;
    }

    if (current.matchingKeysCount !== best.matchingKeysCount) {
        return current.matchingKeysCount > best.matchingKeysCount ? current : best;
    }

    if (current.type === best.type) {
        return current.index > best.index ? current : best;
    }

    return current.index < best.index ? current : best;
}

/**
 * Determines the best matching schema version for input data.
 * `invalid_value` issues are intentionally ignored to allow migration from older enum/value variants.
 */
export function determineBestMatchingSchemaVersion(inputData: Record<string, any>, versionedSchemas: VersionedSchema<z.ZodTypeAny>[]): VersionMatchResult {
    if (!versionedSchemas.length) {
        throw new Error('The list of schemes cannot be empty');
    }

    const inputKeys = getUniqueObjectKeys(inputData);

    const schemaMatches = versionedSchemas.map(({ schema, baseSchema, version, type }, idx) => {
        const schemaKeys = getUniqueKeysFromSchemas([schema]);
        const matchingKeysCount = inputKeys.filter(key => schemaKeys.has(key)).length;

        const strictUnrecognizedKeyCount = getStrictUnrecognizedKeyCount(baseSchema, inputData);

        const validationResult = validateZodOptionsRaw(schema, inputData);
        const structuralErrorCount = !validationResult.success
            ? validationResult.error.issues.filter(issue => issue.code !== 'invalid_value').length
            : 0;

        return {
            index: idx,
            version,
            type,
            structuralErrorCount,
            strictUnrecognizedKeyCount,
            matchingKeysCount,
        };
    });

    const structurallyValidMatches = schemaMatches.filter(match => match.structuralErrorCount === 0);

    if (structurallyValidMatches.length > 0) {
        const bestStructurallyValidMatch = structurallyValidMatches.reduce(compareCandidates);
        const firstVersion = structurallyValidMatches.reduce((earliest, current) => (current.index < earliest.index ? current : earliest)).version;

        return {
            lastVersionIndex: bestStructurallyValidMatch.index,
            latestVersion: bestStructurallyValidMatch.version,
            firstVersion,
        };
    }

    const bestMatch = schemaMatches.reduce(compareCandidates);

    return {
        lastVersionIndex: bestMatch.index,
        latestVersion: bestMatch.version,
        firstVersion: bestMatch.version,
    };
}
