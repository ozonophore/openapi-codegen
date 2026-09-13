import assert from 'node:assert';
import { describe, test } from 'node:test';

import { lookupAndFollow, type RefLookupHost } from '../lookupAndFollow';

type Node = { $ref?: string; in?: string; name?: string; schema?: { $ref: string } };

describe('@unit: lookupAndFollow', () => {
    test('no $ref keeps value and parent', () => {
        const lookup: RefLookupHost = {
            get() {
                throw new Error('get must not run');
            },
            toCanonicalRef() {
                throw new Error('toCanonicalRef must not run');
            },
        };
        const node: Node = { in: 'query', name: 'id' };
        assert.deepEqual(lookupAndFollow(lookup, node, '/abs/paths.yaml'), { value: node, parent: '/abs/paths.yaml' });
    });

    test('$ref uses get and Follow parent from Canonical Ref source file', () => {
        const lookup: RefLookupHost = {
            get(ref, parent) {
                assert.equal(ref, './params.yaml#/components/parameters/Id');
                assert.equal(parent, '/abs/paths.yaml');
                return { in: 'path', name: 'id', schema: { $ref: './id.yaml' } };
            },
            toCanonicalRef() {
                return '/abs/params.yaml#/components/parameters/Id';
            },
        };
        const followed = lookupAndFollow<Node>(lookup, { $ref: './params.yaml#/components/parameters/Id' }, '/abs/paths.yaml');
        assert.equal(followed.parent, '/abs/params.yaml');
        assert.equal(followed.value.name, 'id');
    });

    test('empty Canonical Ref source file keeps caller parent', () => {
        const lookup: RefLookupHost = {
            get() {
                return { in: 'query', name: 'q' };
            },
            toCanonicalRef() {
                return '#/components/parameters/Q';
            },
        };
        const followed = lookupAndFollow<Node>(lookup, { $ref: '#/components/parameters/Q' }, '/abs/api.yaml');
        assert.equal(followed.parent, '/abs/api.yaml');
    });
});
