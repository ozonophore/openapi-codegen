import assert from 'node:assert/strict';
import test from 'node:test';

import { EMigrationMode } from '../../../Enums';
import { EVersionedSchemaType } from '../../Enums';
import { migrateLoadedConfigToLatest } from '../migrateLoadedConfigToLatest';

const minimalFlat = {
    input: './spec.json',
    output: './dist',
    httpClient: 'fetch',
};

test('@unit: migrateLoadedConfigToLatest wires default plans (VALIDATE_CONFIG)', () => {
    const result = migrateLoadedConfigToLatest(minimalFlat, EMigrationMode.VALIDATE_CONFIG);

    assert.ok(result);
    assert.equal(result.schemaType, EVersionedSchemaType.UNIFIED_OPTIONS);
    assert.equal(result.value.httpClient, 'fetch');
    assert.equal(result.value.input, './spec.json');
});

test('@unit: migrateLoadedConfigToLatest accepts GENERATE_OPENAPI mode', () => {
    const result = migrateLoadedConfigToLatest(minimalFlat, EMigrationMode.GENERATE_OPENAPI);

    assert.ok(result);
    assert.equal(result.schemaType, EVersionedSchemaType.UNIFIED_OPTIONS);
});

test('@unit: migrateLoadedConfigToLatest propagates engine validation failure', () => {
    assert.throws(() => migrateLoadedConfigToLatest({}, EMigrationMode.VALIDATE_CONFIG));
});
