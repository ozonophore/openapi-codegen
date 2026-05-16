import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { GenerationCache } from '../GenerationCache';

describe('@unit: GenerationCache', () => {
    test('saves and loads entries', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-cache-'));
        try {
            const reportPath = path.join(tmpDir, 'report.json');
            const cacheA = new GenerationCache(reportPath);
            await cacheA.load();
            cacheA.set({
                key: 'k1',
                fingerprint: 'f1',
                files: ['/tmp/a.ts'],
                updatedAt: Date.now(),
            });
            await cacheA.save();

            const cacheB = new GenerationCache(reportPath);
            await cacheB.load();
            const entry = cacheB.get('k1');

            assert.ok(entry);
            assert.equal(entry?.fingerprint, 'f1');
            assert.deepEqual(entry?.files, ['/tmp/a.ts']);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
