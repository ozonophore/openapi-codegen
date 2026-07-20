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

    test('load() with corrupted JSON starts with empty cache and does not throw', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-cache-'));
        try {
            const cachePath = path.join(tmpDir, 'cache.json');
            fs.writeFileSync(cachePath, '{ not valid json !!!');

            const cache = new GenerationCache(cachePath);
            await assert.doesNotReject(() => cache.load());

            assert.equal(cache.get('anything'), undefined);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('load() with valid JSON but unknown version starts with empty cache', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-cache-'));
        try {
            const cachePath = path.join(tmpDir, 'cache.json');
            fs.writeFileSync(cachePath, JSON.stringify({ version: 99, entries: { k: { key: 'k' } } }));

            const cache = new GenerationCache(cachePath);
            await cache.load();

            assert.equal(cache.get('k'), undefined);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('GC prunes keys not accessed in current batch', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-cache-'));
        try {
            const cachePath = path.join(tmpDir, 'cache.json');

            const cacheA = new GenerationCache(cachePath);
            cacheA.set({ key: 'active', fingerprint: 'f1', files: [], updatedAt: 0 });
            cacheA.set({ key: 'stale', fingerprint: 'f2', files: [], updatedAt: 0 });
            await cacheA.save();

            const cacheB = new GenerationCache(cachePath);
            await cacheB.load();
            cacheB.get('active');
            await cacheB.save();

            const cacheC = new GenerationCache(cachePath);
            await cacheC.load();
            assert.ok(cacheC.get('active'), 'active key should survive');
            assert.equal(cacheC.get('stale'), undefined, 'stale key should be pruned');
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
