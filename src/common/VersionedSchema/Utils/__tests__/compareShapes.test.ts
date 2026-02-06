/* eslint-disable simple-import-sort/imports */
import test from 'node:test';
import assert from 'node:assert';
import { compareShapes } from '../compareShapes';
import { allVersionedSchemas } from '../../../VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { compatibilityCases } from '../__mocks__/compatibilityCases';

test('@unit: schema versions compatibility', () => {
    for (const testCase of compatibilityCases) {
        const { type, from, to, expect } = testCase;

        const prev = allVersionedSchemas.find(vs => vs.type === type && vs.version === `${type}_${from}`)?.baseSchema;
        const next = allVersionedSchemas.find(vs => vs.type === type && vs.version === `${type}_${to}`)?.baseSchema;

        if (!prev || !next) {
            return;
        }

        const issues = compareShapes(prev, next);

        assert.deepStrictEqual(issues, expect, `${type} ${from} → ${to} mismatch`);
    }
});
