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
            assert.strictEqual(plugins[0]?.apiVersion, '3');
            assert.ok(plugins.some(plugin => plugin.name === 'x-typescript-type'));
            assert.strictEqual(plugins.find(plugin => plugin.name === 'x-typescript-type')?.apiVersion, '3');
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

    test('loads v3 factory plugin (module shape) and maps hooks', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-v3-module-'));
        const pluginPath = join(tempDir, 'factory-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                meta: {
                    name: 'factory-module',
                    version: '1.0.0',
                    apiVersion: '3'
                },
                createPlugin: (api) => {
                    api.onSchemaTypeOverride(({ schema }) => schema['x-factory-type']);
                    api.onMapRecommendation(({ recommendation }) => ({
                        ...recommendation,
                        confidence: 'high'
                    }));
                }
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            const plugin = plugins.find(item => item.name === 'factory-module');
            assert.ok(plugin);
            assert.strictEqual(plugin?.apiVersion, '3');
            assert.strictEqual(
                plugin?.resolveSchemaTypeOverride?.(
                    {
                        schema: { 'x-factory-type': 'MyType' },
                        context: { openApiVersion: 'v3', parentRef: '#/components/schemas/User' },
                    },
                    { cwd: process.cwd(), executionMode: 'generate' }
                ),
                'MyType'
            );
            const recommendation = await plugin?.mapRecommendation?.(
                {
                    recommendation: {
                        semver: 'minor',
                        confidence: 'low',
                        reason: 'test',
                        reasons: [],
                    },
                    summary: { breaking: 0, nonBreaking: 1, informational: 0 },
                    governance: { summary: { errors: 0, warnings: 0, info: 0 }, violations: [] },
                },
                { cwd: process.cwd(), executionMode: 'analyze-diff' }
            );
            assert.strictEqual(recommendation?.confidence, 'high');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('loads v3 factory plugin (function export with meta)', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-v3-function-'));
        const pluginPath = join(tempDir, 'factory-fn-plugin.cjs');

        writeFileSync(
            pluginPath,
            `const pluginFactory = (api) => {
                api.onSchemaTypeOverride(({ schema }) => schema['x-factory-fn-type']);
            };
            pluginFactory.meta = {
                name: 'factory-function',
                apiVersion: '3'
            };
            module.exports = pluginFactory;`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            const plugin = plugins.find(item => item.name === 'factory-function');
            assert.ok(plugin);
            assert.strictEqual(
                plugin?.resolveSchemaTypeOverride?.(
                    {
                        schema: { 'x-factory-fn-type': 'FactoryFnType' },
                        context: { openApiVersion: 'v3', parentRef: '#/components/schemas/Factory' },
                    },
                    { cwd: process.cwd(), executionMode: 'generate' }
                ),
                'FactoryFnType'
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('normalizes legacy v2 plugin object to v3 runtime shape', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-v2-legacy-'));
        const pluginPath = join(tempDir, 'legacy-v2-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'legacy-v2',
                apiVersion: '2',
                mapRecommendation: ({ recommendation }) => ({
                    ...recommendation,
                    confidence: 'high'
                })
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath]);
            const plugin = plugins.find(item => item.name === 'legacy-v2');
            assert.ok(plugin);
            assert.strictEqual(plugin?.apiVersion, '3');
            const recommendation = await plugin?.mapRecommendation?.(
                {
                    recommendation: {
                        semver: 'minor',
                        confidence: 'low',
                        reason: 'test',
                        reasons: [],
                    },
                    summary: { breaking: 0, nonBreaking: 1, informational: 0 },
                    governance: { summary: { errors: 0, warnings: 0, info: 0 }, violations: [] },
                },
                { cwd: process.cwd(), executionMode: 'analyze-diff' }
            );
            assert.strictEqual(recommendation?.confidence, 'high');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('rejects legacy object that conflicts with v3 factory export shape', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-conflict-'));
        const pluginPath = join(tempDir, 'conflict-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'conflict-plugin',
                createPlugin: (api) => {
                    api.onSchemaTypeOverride(() => 'ConflictType');
                }
            };`
        );

        try {
            await assert.rejects(
                () => loadGeneratorPlugins([pluginPath]),
                (error: unknown) => error instanceof Error && error.message.includes('both legacy "name" and "createPlugin"')
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
