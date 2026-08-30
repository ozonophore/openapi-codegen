import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { loadGeneratorPlugins } from '../loadGeneratorPlugins';
import { wrapLegacyPlugin } from '../wrapLegacyPlugin';

describe('@unit: loadGeneratorPlugins', () => {
    test('загружает cjs-плагин и оставляет builtin fallback', async () => {
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
            const builtin = plugins.find(plugin => plugin.name === 'x-typescript-type');
            assert.ok(builtin);
            assert.strictEqual(builtin.apiVersion, '3');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('загружает esm-плагин из .mjs', async () => {
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

    test('загружает typescript-плагин, если runtime умеет ts import', async () => {
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

    test('disableBuiltins пропускает x-typescript-type', async () => {
        const plugins = await loadGeneratorPlugins([], { disableBuiltins: true });
        assert.strictEqual(plugins.length, 0);
    });

    test('предупреждает, но загружает плагин с неподдерживаемым apiVersion', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-apiver-'));
        const pluginPath = join(tempDir, 'v4-plugin.cjs');

        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'future-v4',
                apiVersion: '4',
                resolveSchemaTypeOverride: () => undefined
            };`
        );

        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'future-v4');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('отклоняет плоский объект apiVersion 3', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-flat-v3-'));
        const pluginPath = join(tempDir, 'flat-v3.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'future-v3',
                apiVersion: '3',
                resolveSchemaTypeOverride: () => undefined
            };`
        );
        try {
            await assert.rejects(() => loadGeneratorPlugins([pluginPath], { disableBuiltins: true }), /apiVersion "3" requires Plugin factory API/);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('отклоняет name плюс createPlugin без factory meta', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-ambiguous-'));
        const pluginPath = join(tempDir, 'ambiguous.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'x',
                createPlugin() {}
            };`
        );
        try {
            await assert.rejects(() => loadGeneratorPlugins([pluginPath], { disableBuiltins: true }), /both "name" and "createPlugin"/);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('загружает module factory и регистрирует override', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-factory-mod-'));
        const pluginPath = join(tempDir, 'factory.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                meta: { name: 'f', apiVersion: '3' },
                createPlugin(api) {
                    api.onSchemaTypeOverride(({ schema }) => schema['x-factory-type']);
                }
            };`
        );
        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'f');
            assert.strictEqual(plugins[0]?.apiVersion, '3');
            assert.strictEqual(plugins[0]?.resolveSchemaTypeOverride?.({ schema: { 'x-factory-type': 'Foo' }, context: { openApiVersion: 'v3', parentRef: '' } }), 'Foo');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('загружает function factory с .meta', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-factory-fn-'));
        const pluginPath = join(tempDir, 'factory-fn.cjs');
        writeFileSync(
            pluginPath,
            `function createPlugin(api) {
                api.onSchemaTypeOverride(() => 'FromFn');
            }
            createPlugin.meta = { name: 'fn-factory', apiVersion: '3' };
            module.exports = createPlugin;`
        );
        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'fn-factory');
            assert.strictEqual(plugins[0]?.apiVersion, '3');
            assert.strictEqual(wrapLegacyPlugin(plugins[0]), plugins[0]);
            assert.strictEqual(plugins[0]?.resolveSchemaTypeOverride?.({ schema: {}, context: { openApiVersion: 'v3', parentRef: '' } }), 'FromFn');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('factory onConfigure получает непустой config', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-factory-cfg-'));
        const pluginPath = join(tempDir, 'factory-cfg.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                meta: { name: 'cfg', apiVersion: '3' },
                createPlugin(api) {
                    api.onConfigure(function (config) { this.seen = config; });
                }
            };`
        );
        try {
            const plugins = await loadGeneratorPlugins([{ path: pluginPath, config: { mode: 'strict' } }], { disableBuiltins: true });
            assert.deepStrictEqual((plugins[0] as { seen?: unknown }).seen, { mode: 'strict' });
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('строковый path у factory не вызывает onConfigure', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-factory-ncfg-'));
        const pluginPath = join(tempDir, 'factory-ncfg.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                meta: { name: 'ncfg', apiVersion: '3' },
                createPlugin(api) {
                    api.onConfigure(function () { this.called = true; });
                }
            };`
        );
        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual((plugins[0] as { called?: boolean }).called, undefined);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('повторный onSchemaTypeOverride бросает', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-factory-dup-'));
        const pluginPath = join(tempDir, 'factory-dup.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                meta: { name: 'dup', apiVersion: '3' },
                createPlugin(api) {
                    api.onSchemaTypeOverride(() => 'a');
                    api.onSchemaTypeOverride(() => 'b');
                }
            };`
        );
        try {
            await assert.rejects(() => loadGeneratorPlugins([pluginPath], { disableBuiltins: true }), /onSchemaTypeOverride already registered/);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('предупреждает, но загружает v2-плагин без apiVersion', async () => {
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
            assert.strictEqual(plugins[0]?.apiVersion, '3');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('вызывает configure при непустом config у entry', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-configure-'));
        const pluginPath = join(tempDir, 'configured.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'configured',
                seen: null,
                configure(config) { this.seen = config; },
            };`
        );
        try {
            const plugins = await loadGeneratorPlugins([{ path: pluginPath, config: { mode: 'strict' } }], { disableBuiltins: true });
            assert.strictEqual(plugins[0]?.name, 'configured');
            assert.strictEqual(plugins[0]?.apiVersion, '3');
            assert.deepStrictEqual((plugins[0] as { seen?: unknown }).seen, { mode: 'strict' });
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('не вызывает configure для строковых path entry', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-noconfig-'));
        const pluginPath = join(tempDir, 'noconfig.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'noconfig',
                called: false,
                configure() { this.called = true; },
            };`
        );
        try {
            const plugins = await loadGeneratorPlugins([pluginPath], { disableBuiltins: true });
            assert.strictEqual((plugins[0] as { called?: boolean }).called, false);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('throw из configure валит загрузку', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-configure-fail-'));
        const pluginPath = join(tempDir, 'fail.cjs');
        writeFileSync(
            pluginPath,
            `module.exports = {
                name: 'fail-configure',
                configure() { throw new Error('bad config'); },
            };`
        );
        try {
            await assert.rejects(() => loadGeneratorPlugins([{ path: pluginPath, config: { x: 1 } }], { disableBuiltins: true }), /bad config/);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
