import assert from 'node:assert';
import { describe, test } from 'node:test';

import { relativeHelper } from '../../../common/utils/pathHelpers';

describe('path', () => {
    test('@unit: should relative', () => {
        assert.strictEqual(relativeHelper('/test/server', '/test/model'), '../model');
        assert.strictEqual(relativeHelper('/test/server', '/test/server'), './');
        assert.strictEqual(relativeHelper('/test/server', '/test/server/model'), './model');
        assert.strictEqual(relativeHelper('/test/server', '/model'), '../../model');
        assert.strictEqual(relativeHelper('/test', '/test'), './');
        assert.strictEqual(relativeHelper('/test', '/test/model'), './model');
    });
});
