import assert from 'node:assert';
import { describe, test } from 'node:test';

import { relative } from '../pathHelpers';

describe('path', () => {
    test('@unit: should relative', () => {
        assert.strictEqual(relative('/test/server', '/test/model'), '../model');
        assert.strictEqual(relative('/test/server', '/test/server'), './');
        assert.strictEqual(relative('/test/server', '/test/server/model'), './model');
        assert.strictEqual(relative('/test/server', '/model'), '../../model');
        assert.strictEqual(relative('/test', '/test'), './');
        assert.strictEqual(relative('/test', '/test/model'), './model');
    });
});
