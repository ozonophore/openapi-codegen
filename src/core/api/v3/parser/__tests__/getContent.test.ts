import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getContent } from '../getContent';

describe('@unit: getContent', () => {
    test('should prefer application/json over other media types', () => {
        const content = getContent({
            'text/plain': {
                schema: { type: 'string' },
            },
            'application/json': {
                schema: { type: 'object' },
            },
        });

        assert.strictEqual(content?.mediaType, 'application/json');
        assert.strictEqual(content?.schema.type, 'object');
    });

    test('should prefer application/*+json when application/json is absent', () => {
        const content = getContent({
            'text/plain': {
                schema: { type: 'string' },
            },
            'application/problem+json': {
                schema: { type: 'object' },
            },
        });

        assert.strictEqual(content?.mediaType, 'application/problem+json');
        assert.strictEqual(content?.schema.type, 'object');
    });

    test('should prefer wildcard when no json media type exists', () => {
        const content = getContent({
            'text/plain': {
                schema: { type: 'string' },
            },
            '*/*': {
                schema: { type: 'number' },
            },
        });

        assert.strictEqual(content?.mediaType, '*/*');
        assert.strictEqual(content?.schema.type, 'number');
    });

    test('should fallback to the first media type with schema', () => {
        const content = getContent({
            'text/plain': {
                schema: { type: 'string' },
            },
            'application/xml': {
                schema: { type: 'object' },
            },
        });

        assert.strictEqual(content?.mediaType, 'text/plain');
        assert.strictEqual(content?.schema.type, 'string');
    });

    test('should ignore media types without schema and return null if none found', () => {
        const content = getContent({
            'application/json': {},
            'text/plain': {},
        });

        assert.strictEqual(content, null);
    });
});
