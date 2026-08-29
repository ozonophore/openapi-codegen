import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { createTempDir } from '../../../../test/helpers/createTempDir';
import { installSilenceAppLogger } from '../../../../test/helpers/silenceLoggers';
import { validateSpecFile } from '../validateSpecFile';
import { validateSpecFiles } from '../validateSpecFiles';

const minimalOpenApi = {
    openapi: '3.0.3',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
};

const createSpecFile = (t: TestContext, content: unknown): string => {
    const dir = createTempDir(t, 'spec-');
    const filePath = path.join(dir, 'spec.json');
    fs.writeFileSync(filePath, JSON.stringify(content), 'utf-8');
    return filePath;
};

describe('@unit: validateSpecFiles', () => {
    let restoreAppLogger: (() => void) | undefined;

    beforeEach(() => {
        restoreAppLogger = installSilenceAppLogger();
    });

    afterEach(() => {
        restoreAppLogger?.();
        restoreAppLogger = undefined;
    });

    test('validateSpecFile returns true for valid OpenAPI spec', async t => {
        const specPath = createSpecFile(t, minimalOpenApi);
        const isValid = await validateSpecFile(specPath);
        assert.strictEqual(isValid, true);
    });

    test('validateSpecFile returns false for invalid file', async t => {
        const specPath = createSpecFile(t, { not: 'openapi' });
        const isValid = await validateSpecFile(specPath);
        assert.strictEqual(isValid, false);
    });

    test('validateSpecFiles returns only valid specs with relative paths', async t => {
        const validPath = createSpecFile(t, minimalOpenApi);
        const invalidPath = createSpecFile(t, { invalid: true });

        const validated = await validateSpecFiles([validPath, invalidPath]);

        assert.strictEqual(validated.length, 1);
        assert.strictEqual(validated[0].path, validPath);
        assert.ok(validated[0].relativePath.endsWith('spec.json'));
    });

    test('validateSpecFiles returns empty array when all files invalid', async t => {
        const invalidPath = createSpecFile(t, { invalid: true });
        const validated = await validateSpecFiles([invalidPath]);
        assert.deepStrictEqual(validated, []);
    });
});
