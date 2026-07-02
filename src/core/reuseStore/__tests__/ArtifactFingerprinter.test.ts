import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildArtifactKey, buildOptionsSliceHash, hashFingerprint, hashSchema, stableStringify } from '../ArtifactFingerprinter';
import type { OptionsSlice } from '../types';

describe('@unit: ArtifactFingerprinter', () => {
    test('hashFingerprint returns 32-char hex MD5 digest', () => {
        assert.match(hashFingerprint('test'), /^[a-f0-9]{32}$/);
    });

    test('stableStringify sorts object keys', () => {
        const value = stableStringify({ b: 1, a: 2, nested: { z: 1, y: 2 } });
        assert.equal(value, '{"a":2,"b":1,"nested":{"y":2,"z":1}}');
    });

    test('hashSchema is stable for equivalent schemas with different key order', () => {
        const schemaA = {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
            },
            required: ['id'],
        };
        const schemaB = {
            required: ['id'],
            properties: {
                name: { type: 'string' },
                id: { type: 'string' },
            },
            type: 'object',
        };

        assert.equal(hashSchema(schemaA), hashSchema(schemaB));
    });

    test('hashSchema changes when description changes', () => {
        const base = { type: 'string' };
        const withDescription = { type: 'string', description: 'updated' };
        assert.notEqual(hashSchema(base), hashSchema(withDescription));
    });

    test('buildArtifactKey is deterministic', () => {
        const optionsSlice: OptionsSlice = {
            validationLibrary: 'none' as OptionsSlice['validationLibrary'],
            useUnionTypes: false,
            interfacePrefix: 'I',
            enumPrefix: 'E',
            typePrefix: 'T',
            modelsMode: 'interfaces' as OptionsSlice['modelsMode'],
            sortByRequired: false,
            emptySchemaStrategy: 'keep' as OptionsSlice['emptySchemaStrategy'],
            useSeparatedIndexes: false,
            httpClient: 'fetch' as OptionsSlice['httpClient'],
            prettierConfigPath: '',
            pluginsHash: 'abc',
        };
        const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
        const schemaHash = hashSchema({ type: 'object' });
        const keyA = buildArtifactKey('User', 'model', schemaHash, optionsSliceHash);
        const keyB = buildArtifactKey('User', 'model', schemaHash, optionsSliceHash);
        assert.equal(keyA, keyB);
        assert.notEqual(keyA, buildArtifactKey('User', 'schema', schemaHash, optionsSliceHash));
    });
});
