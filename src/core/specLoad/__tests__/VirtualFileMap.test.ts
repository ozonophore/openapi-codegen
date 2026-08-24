import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { getOutputPaths } from '../../utils/getOutputPaths';
import { RefLookup } from '../../utils/refLookup';
import { buildVirtualFileMap } from '../VirtualFileMap';

const ENTRY = '/proj/api.yaml';
const SCHEMA = '/proj/schemas/Pet.yaml';
const POINTER = '#/definitions/Pet';

function makeRefs(paths: string[], getImpl: (key: string) => unknown = () => ({})) {
    return { paths: () => paths, get: getImpl };
}

describe('@unit: VirtualFileMap', () => {
    test('resolve returns outputFile for known canonical ref', () => {
        const refLookup = new RefLookup([ENTRY, SCHEMA], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([ENTRY, SCHEMA]), refLookup, ENTRY, output);

        const result = map.resolve(SCHEMA);
        assert.ok(result, 'expected resolve result');
        assert.ok(result!.outputFile.endsWith('.ts'), 'outputFile should end with .ts');
        assert.equal(result!.fragment, undefined);
    });

    test('resolve returns undefined for unknown canonical ref', () => {
        const refLookup = new RefLookup([ENTRY], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([ENTRY]), refLookup, ENTRY, output);

        const result = map.resolve('/proj/unknown.yaml');
        assert.equal(result, undefined);
    });

    test('resolve returns undefined for remote ref', () => {
        const refLookup = new RefLookup([ENTRY], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([ENTRY]), refLookup, ENTRY, output);

        const result = map.resolve('https://example.com/schema.yaml');
        assert.equal(result, undefined);
    });

    test('resolve with pointer returns fragment', () => {
        const refLookup = new RefLookup([ENTRY, SCHEMA], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([ENTRY, SCHEMA]), refLookup, ENTRY, output);

        const result = map.resolve(`${SCHEMA}${POINTER}`);
        assert.ok(result, 'expected resolve result');
        assert.equal(result!.fragment, POINTER);
    });

    test('getCanonicalRefs returns collected refs after walkSchemaForFragments', () => {
        const schemaDoc = {
            $ref: `${SCHEMA}${POINTER}`,
        };
        const refLookup = new RefLookup([ENTRY, SCHEMA], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(
            makeRefs([ENTRY, SCHEMA], (key: string) => (key.includes('schemas') ? {} : schemaDoc)),
            refLookup,
            ENTRY,
            output
        );

        const refs = map.getCanonicalRefs();
        assert.ok(
            refs.some(r => r.includes('Pet.yaml')),
            `expected Pet.yaml ref, got ${JSON.stringify(refs)}`
        );
    });

    test('output property matches what was passed to buildVirtualFileMap', () => {
        const refLookup = new RefLookup([ENTRY], ENTRY);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([ENTRY]), refLookup, ENTRY, output);

        assert.strictEqual(map.output, output);
    });

    test('entry file always present in map', () => {
        const refLookup = new RefLookup([ENTRY], ENTRY);
        const output = getOutputPaths({ output: path.resolve('./out') });
        const map = buildVirtualFileMap(makeRefs([ENTRY]), refLookup, ENTRY, output);

        const result = map.resolve(ENTRY);
        assert.ok(result, 'entry file should be resolvable');
        assert.ok(result!.outputFile.endsWith('.ts'));
    });

    test('remote entry file skipped', () => {
        const remoteEntry = 'https://example.com/api.yaml';
        const refLookup = new RefLookup([], remoteEntry);
        const output = getOutputPaths({ output: './generated' });
        const map = buildVirtualFileMap(makeRefs([]), refLookup, remoteEntry, output);

        const result = map.resolve(remoteEntry);
        assert.equal(result, undefined);
    });
});
