/* eslint-disable simple-import-sort/imports */
import test from 'node:test';
import assert from 'node:assert';
import { compareShapes } from '../compareShapes';
import { allVersionedSchemas } from '../../../VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { compatibilityCases } from '../__mocks__/compatibilityCases';

test('@unit: schema versions compatibility cases must cover all adjacent transitions', () => {
    const cases = new Set(
        compatibilityCases.map(testCase => `${testCase.type}:${testCase.from}->${testCase.to}`)
    );

    const transitions = new Set<string>();

    for (let idx = 0; idx < allVersionedSchemas.length - 1; idx++) {
        const current = allVersionedSchemas[idx];
        const next = allVersionedSchemas[idx + 1];
        if (current.type !== next.type) {
            continue;
        }

        const from = current.version.split('_').at(-1);
        const to = next.version.split('_').at(-1);
        if (!from || !to) {
            continue;
        }

        transitions.add(`${current.type}:${from}->${to}`);
    }

    assert.deepStrictEqual(
        [...cases].sort(),
        [...transitions].sort(),
        'compatibilityCases must include all adjacent schema transitions'
    );
});

test('@unit: schema versions compatibility', () => {
    for (const testCase of compatibilityCases) {
        const { type, from, to, expect } = testCase;

        const prev = allVersionedSchemas.find(vs => vs.type === type && vs.version === `${type}_${from}`)?.baseSchema;
        const next = allVersionedSchemas.find(vs => vs.type === type && vs.version === `${type}_${to}`)?.baseSchema;

        assert.ok(prev, `Previous schema was not found for ${type} ${from}`);
        assert.ok(next, `Next schema was not found for ${type} ${to}`);

        const issues = compareShapes(prev!, next!);

        assert.deepStrictEqual(issues, expect, `${type} ${from} → ${to} mismatch`);
    }
});
