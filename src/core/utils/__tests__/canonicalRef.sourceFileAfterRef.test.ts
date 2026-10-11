import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { sourceFileAfterRef } from '../canonicalRef';

describe('@unit: sourceFileAfterRef', () => {
    test('uses the Canonical Ref source file', () => {
        assert.equal(sourceFileAfterRef('/abs/params.yaml#/components/parameters/Id', '/abs/paths.yaml'), '/abs/params.yaml');
        assert.equal(sourceFileAfterRef('/abs/id.yaml', '/abs/paths.yaml'), '/abs/id.yaml');
    });

    test('empty source file keeps the caller parent', () => {
        assert.equal(sourceFileAfterRef('#/components/schemas/Foo', '/abs/api.yaml'), '/abs/api.yaml');
        assert.equal(sourceFileAfterRef('', '/abs/api.yaml'), '/abs/api.yaml');
    });
});
