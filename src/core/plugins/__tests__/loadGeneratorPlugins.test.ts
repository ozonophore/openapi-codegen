import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { loadGeneratorPlugins } from '../loadGeneratorPlugins';

describe('@unit: loadGeneratorPlugins', () => {
    test('loads cjs plugin and keeps builtin fallback plugins', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-'));
        const pluginPath = join(tempDir, 'custom-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'custom-type-override',
                resolveSchemaTypeOverride: ({ schema }) => schema['x-custom-type']
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            assert.ok(plugins.length >= 2);
            assert.strictEqual(plugins[0]?.name, 'custom-type-override');
            assert.ok(plugins.some(plugin => plugin.name === 'x-typescript-type'));
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('loads esm plugin from .mjs', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-esm-'));
        const pluginPath = join(tempDir, 'custom-plugin.mjs');

        writeFileSync(
            pluginPath,
            `export default {
                name: 'esm-type-override',
                resolveSchemaTypeOverride: ({ schema }) => schema['x-esm-type']
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            assert.strictEqual(plugins[0]?.name, 'esm-type-override');
            assert.ok(plugins.some(plugin => plugin.name === 'x-typescript-type'));
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('loads typescript plugin when runtime supports ts imports', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-ts-'));
        const pluginPath = join(tempDir, 'custom-plugin.ts');

        writeFileSync(
            pluginPath,
            `export default {
                name: 'ts-type-override',
                resolveSchemaTypeOverride: ({ schema }: { schema: Record<string, unknown> }) => schema['x-ts-type']
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            assert.strictEqual(plugins[0]?.name, 'ts-type-override');
            assert.ok(plugins.some(plugin => plugin.name === 'x-typescript-type'));
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('disableBuiltins skips x-typescript-type', async () => {
        const plugins = await loadGeneratorPlugins([], { disableBuiltins: true });
        assert.strictEqual(plugins.length, 0);
    });

    test('warns but loads plugin with unsupported apiVersion', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-apiver-'));
        const pluginPath = join(tempDir, 'v3-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'future-v3',
                apiVersion: '3',
                resolveSchemaTypeOverride: () => undefined
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'future-v3');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('warns but loads v2 plugin without apiVersion', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-v2-no-apiver-'));
        const pluginPath = join(tempDir, 'v2-no-apiver.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'v2-no-apiver',
                afterSemanticDiff: ({ report }) => report
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'v2-no-apiver');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
