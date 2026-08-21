import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import type { CoreOutputAdapter } from '../../CoreOutputAdapter';
import { templates } from '../../utils/__mocks__/templates';
import { writeClientFullIndex } from '../writeClientFullIndex';

describe('@unit: writeClientFullIndex', () => {
    test('writes to filesystem', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const adapter: CoreOutputAdapter = {
            writeOutputFile: async (file, content) => fileSystemHelpers.writeFile(file, content),
            registerLintTarget: () => undefined,
            logger: { info: () => undefined, warn: () => undefined },
        };

        await writeClientFullIndex(adapter, { templates, outputPath: '/', core: [], models: [], schemas: [], services: [] });

        assert.ok(
            writeFileCalls.some(([filePath, content]) => filePath.toString().includes('index.ts') && content.toString().includes('fullIndex')),
            'Expected writeFile to be called with index content for index.ts'
        );

        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
