import assert from 'node:assert';
import { describe, test } from 'node:test';

import { OpenApiGeneratorPlugin } from '../GeneratorPlugin.model';
import { wrapLegacyPlugin } from '../wrapLegacyPlugin';

describe('@unit: wrapLegacyPlugin', () => {
    test('ставит apiVersion 3 in-place и сохраняет this', () => {
        const plugin: OpenApiGeneratorPlugin & { seen?: string } = {
            name: 'legacy',
            resolveSchemaTypeOverride: function () {
                return this.name;
            },
        };
        const wrapped = wrapLegacyPlugin(plugin);
        assert.strictEqual(wrapped, plugin);
        assert.strictEqual(wrapped.apiVersion, '3');
        assert.strictEqual(wrapped.resolveSchemaTypeOverride?.({ schema: {}, context: { openApiVersion: 'v3', parentRef: '' } }), 'legacy');
    });

    test('не оборачивает factory-плагины повторно', () => {
        const plugin: OpenApiGeneratorPlugin = {
            name: 'factory',
            apiVersion: '3',
        };
        assert.strictEqual(wrapLegacyPlugin(plugin), plugin);
    });
});
