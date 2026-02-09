import assert from 'node:assert';
import { describe, test } from 'node:test';

import { RefType } from '../parseRef';
import { resolveRefPath } from '../resolveRefPath';

describe('@unit: resolveRefPath', () => {
    test('should keep repeated folder names in absolute path', () => {
        const parsedRef = {
            type: RefType.EXTERNAL_FILE,
            originalRef: 'schemas/base/ModelWithString.yml',
            filePath: 'schemas/base/ModelWithString.yml',
            fragment: undefined,
        };

        const parentFilePath = '/home/runner/work/openapi-codegen/openapi-codegen/test/spec/v3.withDifferentRefs.yml';
        const result = resolveRefPath(parsedRef, parentFilePath);

        assert.strictEqual(result, '/home/runner/work/openapi-codegen/openapi-codegen/test/spec/schemas/base/ModelWithString.yml');
    });
});
