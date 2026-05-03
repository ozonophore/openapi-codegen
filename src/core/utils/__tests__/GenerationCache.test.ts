import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { GenerationCache } from '../GenerationCache';

describe('@unit: GenerationCache', () => {
    test('saves and loads entries', async () => {
        const root = await mkdtemp(join(tmpdir(), 'openapi-codegen-cache-'));
        const cacheFile = join(root, '.openapi-codegen-cache.json');
        const cacheA = new GenerationCache(cacheFile);
        await cacheA.load();
        cacheA.set({
            key: 'k1',
            fingerprint: 'f1',
            files: ['/tmp/a.ts'],
            updatedAt: Date.now(),
        });
        await cacheA.save();

        const cacheB = new GenerationCache(cacheFile);
        await cacheB.load();
        const entry = cacheB.get('k1');

        assert.ok(entry);
        assert.equal(entry?.fingerprint, 'f1');
        assert.deepEqual(entry?.files, ['/tmp/a.ts']);
    });
});
