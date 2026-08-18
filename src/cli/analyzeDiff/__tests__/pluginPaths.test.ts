import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { analyzeDiffOptionsSchema } from '../../schemas/analyzeDiff';
import { generateOptionsSchema } from '../../schemas/generate';
import { resolvePluginEntries } from '../pluginPaths';

describe('@unit: analyze-diff / generate plugin CLI schemas', () => {
    test('generateOptionsSchema accepts plugins array', () => {
        const parsed = generateOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
            plugins: ['./a.cjs', './b.cjs'],
            strictPluginMode: true,
        });
        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.deepEqual(parsed.data.plugins, ['./a.cjs', './b.cjs']);
            assert.equal(parsed.data.strictPluginMode, true);
        }
    });

    test('analyzeDiffOptionsSchema accepts plugins array and strictPluginMode', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './spec.yaml',
            compareWith: './old.yaml',
            plugins: ['./hooks.cjs'],
            strictPluginMode: true,
        });
        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.deepEqual(parsed.data.plugins, ['./hooks.cjs']);
            assert.equal(parsed.data.strictPluginMode, true);
        }
    });

    test('resolvePluginEntries merges config and CLI', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(configPath, JSON.stringify({ plugins: ['./from-config.cjs'] }));

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs', './from-config.cjs']);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./from-config.cjs', './from-cli.cjs']
            );
            assert.deepEqual(entries[0]?.config, {});
            assert.deepEqual(entries[1]?.config, {});
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries preserves object config', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-entries-config-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                plugins: [{ path: './hooks.cjs', name: 'hooks', config: { mode: 'strict' } }],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs']);
            assert.equal(entries.length, 2);
            assert.equal(entries[0]?.path, './hooks.cjs');
            assert.equal(entries[0]?.name, 'hooks');
            assert.deepEqual(entries[0]?.config, { mode: 'strict' });
            assert.equal(entries[1]?.path, './from-cli.cjs');
            assert.deepEqual(entries[1]?.config, {});
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries collects plugins from items', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-items-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                items: [
                    { input: './a.yaml', output: './out-a', plugins: ['./item-a.cjs'] },
                    { input: './b.yaml', output: './out-b', plugins: ['./item-b.cjs', './item-a.cjs'] },
                ],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs']);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./item-a.cjs', './item-b.cjs', './from-cli.cjs']
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
