import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { extractPluginPaths, mergePluginPaths, normalizePluginEntry } from '../pluginEntries';

describe('@unit: mergePluginPaths / pluginEntries', () => {
    test('normalizePluginEntry trims string paths', () => {
        assert.deepEqual(normalizePluginEntry('  ./a.cjs  '), { path: './a.cjs', config: {} });
        assert.equal(normalizePluginEntry(''), null);
        assert.equal(normalizePluginEntry('   '), null);
    });

    test('normalizePluginEntry accepts object entries', () => {
        assert.deepEqual(normalizePluginEntry({ path: './p.cjs', name: 'my-plugin', config: { mode: 'a' } }), {
            path: './p.cjs',
            name: 'my-plugin',
            config: { mode: 'a' },
        });
        assert.equal(normalizePluginEntry({ path: '' }), null);
    });

    test('mergePluginPaths is config-first then CLI with path dedupe', () => {
        const merged = mergePluginPaths(['./a.cjs', { path: './b.cjs', config: { x: 1 } }], ['./a.cjs', './c.cjs']);
        assert.deepEqual(
            merged.map(e => e.path),
            ['./a.cjs', './b.cjs', './c.cjs']
        );
        assert.deepEqual(merged[1]?.config, { x: 1 });
    });

    test('mergePluginPaths dedupes equivalent paths after resolve', () => {
        const merged = mergePluginPaths(['./a.cjs'], ['a.cjs', './a.cjs']);
        assert.deepEqual(merged, [{ path: './a.cjs', config: {} }]);
    });

    test('mergePluginPaths with CLI only', () => {
        const merged = mergePluginPaths(undefined, ['./p.cjs']);
        assert.deepEqual(merged, [{ path: './p.cjs', config: {} }]);
    });

    test('extractPluginPaths reads path from objects', () => {
        assert.deepEqual(extractPluginPaths([{ path: './p.cjs', config: { mode: 'a' } }, './q.cjs']), ['./p.cjs', './q.cjs']);
    });
});
