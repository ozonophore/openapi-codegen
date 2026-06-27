import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../../common/Consts';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { generateOpenApiClient } from '../generateOpenApiClient';

const repoRoot = path.join(__dirname, '..', '..', '..', '..');

const cliDefaults = {
    httpClient: 'fetch',
    useOptions: false,
    useUnionTypes: false,
    excludeCoreServiceFiles: false,
    interfacePrefix: 'I',
    enumPrefix: 'E',
    typePrefix: 'T',
    useCancelableRequest: false,
    logLevel: 'error',
    logTarget: 'console',
    sortByRequired: true,
    useSeparatedIndexes: false,
    validationLibrary: 'none',
    emptySchemaStrategy: 'keep',
} as const;

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: generateOpenApiClient marauder direct mode', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    for (const flag of ['autoSelect', 'anomalyDetection', 'exploitAnomalies'] as const) {
        test(`direct mode with ${flag} flag`, async t => {
            const tempDir = createTempDir(t, `marauder-${flag}-`);
            const outputDir = path.join(tempDir, 'generated');

            const result = await generateOpenApiClient({
                ...cliDefaults,
                openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
                input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'),
                output: outputDir,
                [flag]: true,
            });

            assert.strictEqual(result.success, true, result.error);
        });
    }
});
