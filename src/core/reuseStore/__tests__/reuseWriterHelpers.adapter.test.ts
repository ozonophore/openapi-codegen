import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { Model } from '../../types/shared/Model.model';
import type { ReuseOutputAdapter, ReuseWriterContext } from '../reuseWriterHelpers';
import { writeModelWithReuse } from '../reuseWriterHelpers';

describe('@unit: reuseWriterHelpers adapter', () => {
    test('writeModelWithReuse uses adapter without WriteClient class', async () => {
        const writes: Array<{ file: string; content: string }> = [];
        const lintTargets: string[] = [];
        const adapter: ReuseOutputAdapter = {
            writeOutputFile: async (file, content) => {
                writes.push({ file, content });
            },
            registerLintTarget: file => {
                lintTargets.push(file);
            },
        };

        const artifactContent = 'export const User = {};';
        const registered: Array<{ inputPath: string; outputPath: string }> = [];

        const ctx = {
            optionsSlice: {} as ReuseWriterContext['optionsSlice'],
            specInput: 'api',
            inputPath: '/abs/openapi.yaml',
            modelSchemas: new Map([['User', { type: 'object' }]]),
            referencedArtifactKeys: new Set<string>(),
        };

        const model = { name: 'User', export: 'interface', path: 'User' } as Model;

        await writeModelWithReuse(
            adapter,
            model,
            '/out/models/User.ts',
            '/out/models',
            {
                ...ctx,
                reuseStore: {
                    lookup: () => ({ status: 'miss', optionsSliceHash: 'slice-hash' }),
                    writeArtifact: async () => undefined,
                    register: (entry: { inputPath: string; outputPath: string }) => {
                        registered.push({ inputPath: entry.inputPath, outputPath: entry.outputPath });
                        return { artifactKey: 'key-1' };
                    },
                } as unknown as ReuseWriterContext['reuseStore'],
            },
            async () => artifactContent
        );

        assert.equal(writes.length, 1);
        assert.equal(writes[0]?.file, '/out/models/User.ts');
        assert.equal(writes[0]?.content, artifactContent);
        assert.deepEqual(lintTargets, ['/out/models/User.ts']);
        assert.equal(registered[0]?.inputPath, '/abs/openapi.yaml');
    });
});
