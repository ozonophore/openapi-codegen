import assert from 'node:assert';
import { describe, test } from 'node:test';

import { relativeHelper } from '../pathHelpers';

describe('@unit: path', () => {
    test('should relative', () => {
        assert.strictEqual(relativeHelper('/test/server', '/test/model'), '../model');
        assert.strictEqual(relativeHelper('/test/server', '/test/server'), './');
        assert.strictEqual(relativeHelper('/test/server', '/test/server/model'), './model');
        assert.strictEqual(relativeHelper('/test/server', '/model'), '../../model');
        assert.strictEqual(relativeHelper('/test', '/test'), './');
        assert.strictEqual(relativeHelper('/test', '/test/model'), './model');
    });
});
