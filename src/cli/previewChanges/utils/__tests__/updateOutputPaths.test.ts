import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { HttpClient } from '../../../../core/types/enums/HttpClient.enum';
import { updateOutputPaths } from '../updateOutputPaths';

describe('@unit: updateOutputPaths', () => {
    test('rewrites output inside generatedDir to previewDir', () => {
        const generatedDir = './test/generated';
        const previewDir = './generated-preview';
        const options = {
            input: './test/spec/v3.json',
            output: path.join(generatedDir, 'api'),
            httpClient: HttpClient.FETCH,
        };

        const updated = updateOutputPaths(options, previewDir, generatedDir);

        assert.strictEqual(updated.output, path.join(previewDir, 'api'));
    });

    test('uses basename when output escapes generatedDir via ../', () => {
        const generatedDir = './test/generated';
        const previewDir = './generated-preview';
        const options = {
            input: './test/spec/v3.json',
            output: '../outside/api',
            httpClient: HttpClient.FETCH,
        };

        const updated = updateOutputPaths(options, previewDir, generatedDir);

        assert.strictEqual(updated.output, path.join(previewDir, 'api'));
    });

    test('rewrites outputCore and sibling paths for flat config', () => {
        const generatedDir = './test/generated';
        const previewDir = './generated-preview';
        const options = {
            input: './test/spec/v3.json',
            output: path.join(generatedDir, 'api'),
            outputCore: path.join(generatedDir, 'api', 'core'),
            outputServices: path.join(generatedDir, 'api', 'services'),
            outputModels: path.join(generatedDir, 'api', 'models'),
            outputSchemas: path.join(generatedDir, 'api', 'schemas'),
            httpClient: HttpClient.FETCH,
        };

        const updated = updateOutputPaths(options, previewDir, generatedDir);

        assert.strictEqual(updated.output, path.join(previewDir, 'api'));
        assert.ok(updated.outputCore?.includes('core'));
        assert.ok(updated.outputServices?.includes('services'));
        assert.ok(updated.outputModels?.includes('models'));
        assert.ok(updated.outputSchemas?.includes('schemas'));
    });

    test('updates items array for multi-option config', () => {
        const generatedDir = './test/generated';
        const previewDir = './generated-preview';
        const options = {
            items: [
                { input: './a.json', output: path.join(generatedDir, 'client-a') },
                { input: './b.json', output: path.join(generatedDir, 'client-b') },
            ],
            httpClient: HttpClient.FETCH,
        };

        const updated = updateOutputPaths(options, previewDir, generatedDir);

        assert.strictEqual(updated.items?.length, 2);
        assert.strictEqual(updated.items?.[0].output, path.join(previewDir, 'client-a'));
        assert.strictEqual(updated.items?.[1].output, path.join(previewDir, 'client-b'));
    });
});
