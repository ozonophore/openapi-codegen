import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { Context } from '../Context';
import { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import { getOutputPaths } from '../utils/getOutputPaths';

function createContext(plugins: OpenApiGeneratorPlugin[], strictPluginMode?: boolean): Context {
    return new Context({
        input: 'test/spec.json',
        output: getOutputPaths({ output: './generated' }),
        plugins,
        strictPluginMode,
    });
}

describe('@unit: Context strictPluginMode', () => {
    test('soft mode skips failing plugin and tries the next one', () => {
        const faultyPlugin: OpenApiGeneratorPlugin = {
            name: 'faulty-plugin',
            resolveSchemaTypeOverride: () => {
                throw new Error('boom');
            },
        };
        const workingPlugin: OpenApiGeneratorPlugin = {
            name: 'working-plugin',
            resolveSchemaTypeOverride: () => 'CustomType',
        };

        const context = createContext([faultyPlugin, workingPlugin], false);
        const override = context.resolveSchemaTypeOverride({ type: 'string' }, { openApiVersion: 'v3', parentRef: '' });

        assert.equal(override, 'CustomType');
    });

    test('soft mode returns undefined when all plugins fail', () => {
        const faultyPlugin: OpenApiGeneratorPlugin = {
            name: 'faulty-plugin',
            resolveSchemaTypeOverride: () => {
                throw new Error('boom');
            },
        };

        const context = createContext([faultyPlugin], false);
        const override = context.resolveSchemaTypeOverride({ type: 'string' }, { openApiVersion: 'v3', parentRef: '' });

        assert.equal(override, undefined);
    });

    test('strict mode throws when plugin fails', () => {
        const faultyPlugin: OpenApiGeneratorPlugin = {
            name: 'faulty-plugin',
            resolveSchemaTypeOverride: () => {
                throw new Error('boom');
            },
        };

        const context = createContext([faultyPlugin], true);

        assert.throws(
            () => context.resolveSchemaTypeOverride({ type: 'string' }, { openApiVersion: 'v3', parentRef: '' }),
            (error: unknown) => error instanceof Error && error.message.includes('faulty-plugin')
        );
    });
});
