import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { generateOpenApiClient } from '../generateOpenApiClient';

const repoRoot = path.join(__dirname, '..', '..', '..', '..');

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: generateOpenApiClient marauder config mode', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('config mode accepts boolean Marauder shorthand and exploitAnomalies alias', async t => {
        const tempDir = createTempDir(t, 'marauder-config-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                items: [{ input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'), output: outputDir }],
                autoSelect: true,
                anomalyDetection: true,
                exploitAnomalies: true,
            })
        );

        const result = await generateOpenApiClient({
            openapiConfig: configPath,
        });

        assert.strictEqual(result.success, true, result.error);
    });
});

describe('@unit: generateOpenApiClient direct mode tsconfig/eslint paths', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('direct mode with tsconfigPath and eslintConfigPath succeeds', async t => {
        const tempDir = createTempDir(t, 'direct-tsconfig-eslint-');
        const outputDir = path.join(tempDir, 'generated');

        const result = await generateOpenApiClient({
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
            openapiConfig: 'openapi.config.json',
            input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'),
            output: outputDir,
            tsconfigPath: path.join(repoRoot, 'tsconfig.json'),
            eslintConfigPath: path.join(repoRoot, 'eslint.config.js'),
        });

        assert.strictEqual(result.success, true, result.error);
    });
});
