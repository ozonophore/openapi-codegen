import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOperationPath } from '../getOperationPath';

describe('@unit: getOperationPath', () => {
    test('should produce correct result', () => {
        assert.strictEqual(getOperationPath('/api/v{api-version}/list/{id}/{type}'), '/api/v{api-version}/list/${id}/${type}');
        assert.strictEqual(getOperationPath('/api/v{api-version}/list/{id}'), '/api/v{api-version}/list/${id}');
        assert.strictEqual(getOperationPath('/api/v1/list/{id}'), '/api/v1/list/${id}');
        assert.strictEqual(getOperationPath('/api/{foobar}'), '/api/${foobar}');
        assert.strictEqual(getOperationPath('/api/{fooBar}'), '/api/${fooBar}');
        assert.strictEqual(getOperationPath('/api/{foo-bar}'), '/api/${fooBar}');
        assert.strictEqual(getOperationPath('/api/{foo_bar}'), '/api/${fooBar}');
        assert.strictEqual(getOperationPath('/api/{foo.bar}'), '/api/${fooBar}');
        assert.strictEqual(getOperationPath('/api/{Foo-Bar}'), '/api/${fooBar}');
        assert.strictEqual(getOperationPath('/api/{FOO-BAR}'), '/api/${fooBar}');
    });
});
