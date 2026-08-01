import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { validatePluginPaths } from '../validatePluginPaths';

describe('@unit: validatePluginPaths', () => {
    test('warns when plugin file is missing', () => {
        const warnings = validatePluginPaths({
            plugins: ['./definitely-missing-plugin-xyz.cjs'],
        });
        assert.equal(warnings.length, 1);
        assert.match(warnings[0] ?? '', /definitely-missing-plugin-xyz/);
    });

    test('accepts existing example plugin path when present', () => {
        const warnings = validatePluginPaths({
            plugins: ['./example/plugins/custom-type.plugin.cjs'],
        });
        assert.deepEqual(warnings, []);
    });
});
