import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getMappedType } from '../getMappedType';

describe('@unit: getMappedType', () => {
    test('should map types to the basics', () => {
        assert.strictEqual(getMappedType('File'), 'File');
        assert.strictEqual(getMappedType('file'), 'File');
        assert.strictEqual(getMappedType('string'), 'string');
        assert.strictEqual(getMappedType('date'), 'string');
        assert.strictEqual(getMappedType('date-time'), 'string');
        assert.strictEqual(getMappedType('float'), 'number');
        assert.strictEqual(getMappedType('double'), 'number');
        assert.strictEqual(getMappedType('short'), 'number');
        assert.strictEqual(getMappedType('int'), 'number');
        assert.strictEqual(getMappedType('boolean'), 'boolean');
        assert.strictEqual(getMappedType('any'), 'any');
        assert.strictEqual(getMappedType('object'), 'any');
        assert.strictEqual(getMappedType('void'), 'void');
        assert.strictEqual(getMappedType('null'), 'null');
        assert.strictEqual(getMappedType('unknown'), undefined);
        assert.strictEqual(getMappedType(''), undefined);
    });
});
