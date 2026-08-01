import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { analyzeDiffOptionsSchema } from '../../schemas/analyzeDiff';
import { generateOptionsSchema } from '../../schemas/generate';
import { resolvePluginPaths } from '../pluginPaths';

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

    test('resolvePluginPaths merges config and CLI', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(configPath, JSON.stringify({ plugins: ['./from-config.cjs'] }));

        try {
            const paths = resolvePluginPaths(configPath, ['./from-cli.cjs', './from-config.cjs']);
            assert.deepEqual(paths, ['./from-config.cjs', './from-cli.cjs']);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginPaths collects plugins from items', () => {
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
            const paths = resolvePluginPaths(configPath, ['./from-cli.cjs']);
            assert.deepEqual(paths, ['./item-a.cjs', './item-b.cjs', './from-cli.cjs']);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
