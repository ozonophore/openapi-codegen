import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { loadItemPlugins } from '../loadItemPlugins';

describe('@unit: loadItemPlugins', () => {
    test('returns builtin plugins when no user plugins provided', async () => {
        const plugins = await loadItemPlugins(undefined, undefined);
        assert.ok(plugins.length > 0);
        assert.ok(plugins.some(p => p.name === 'x-typescript-type'));
    });

    test('returns only user plugins when disableBuiltinPlugins=true', async () => {
        const tmpDir = mkdtempSync(join(tmpdir(), 'load-plugins-'));
        const pluginPath = join(tmpDir, 'custom.cjs');
        writeFileSync(pluginPath, `module.exports = { name: 'custom-test-plugin' };`);

        try {
            const plugins = await loadItemPlugins([pluginPath], true);
            assert.equal(plugins.length, 1);
            assert.equal(plugins[0]?.name, 'custom-test-plugin');
        } finally {
            rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('returns user plugin + builtins when disableBuiltinPlugins=false', async () => {
        const tmpDir = mkdtempSync(join(tmpdir(), 'load-plugins-builtins-'));
        const pluginPath = join(tmpDir, 'custom.cjs');
        writeFileSync(pluginPath, `module.exports = { name: 'custom-test-plugin' };`);

        try {
            const plugins = await loadItemPlugins([pluginPath], false);
            assert.ok(plugins.length > 1);
            assert.equal(plugins[0]?.name, 'custom-test-plugin');
            assert.ok(plugins.some(p => p.name === 'x-typescript-type'));
        } finally {
            rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
