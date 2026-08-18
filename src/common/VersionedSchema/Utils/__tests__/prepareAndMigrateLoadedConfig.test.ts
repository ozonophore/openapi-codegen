import assert from 'node:assert/strict';
import test from 'node:test';

import { EMigrationMode } from '../../../Enums';
import { EVersionedSchemaType } from '../../Enums';
import { prepareAndMigrateLoadedConfig } from '../prepareAndMigrateLoadedConfig';

test('@unit: prepareAndMigrateLoadedConfig converts array then migrates', () => {
    const result = prepareAndMigrateLoadedConfig(
        [
            { input: './a.yaml', output: './out-a', httpClient: 'fetch' },
            { input: './b.yaml', output: './out-b', httpClient: 'fetch' },
        ],
        EMigrationMode.VALIDATE_CONFIG
    );

    assert.ok(result);
    assert.equal(result.schemaType, EVersionedSchemaType.UNIFIED_OPTIONS);
    assert.ok(Array.isArray(result.value.items));
    assert.equal(result.value.items.length, 2);
});

test('@unit: prepareAndMigrateLoadedConfig omitUndefined before migrate', () => {
    const result = prepareAndMigrateLoadedConfig(
        {
            input: './spec.json',
            output: './dist',
            httpClient: 'fetch',
            request: undefined,
        } as Record<string, unknown>,
        EMigrationMode.VALIDATE_CONFIG,
        { omitUndefined: true }
    );

    assert.ok(result);
    assert.equal(result.value.httpClient, 'fetch');
});
