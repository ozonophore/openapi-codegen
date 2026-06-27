import assert from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../../common/Consts';
import { validateZodOptions } from '../../../common/Validation';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { generateOptionsSchema } from '../../schemas/generate';
import { mergeNestedCliOptions } from '../../utils/parseNestedCliOptions';
import { mergeGenerateCliOverrides } from '../generateCliOverrides';
import { generateOpenApiClient } from '../generateOpenApiClient';

const repoRoot = path.join(__dirname, '..', '..', '..', '..');
const lomSpec = path.join(repoRoot, 'test/spec/lom/lom_api.yaml');
const anomaliesSpec = path.join(repoRoot, 'test/spec/anomalies/spec_with_anomalies.yaml');

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

function parseGenerateOptions(input: Record<string, unknown>) {
    const result = validateZodOptions(generateOptionsSchema, {
        openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
        input: lomSpec,
        output: './out',
        ...input,
    });
    assert.strictEqual(result.success, true, result.success ? undefined : result.errors.join('\n'));
    return result.data!;
}

describe('@unit: marauder Zod schema layer', () => {
    test('A1: autoSelect boolean becomes { enabled: true }', () => {
        const parsed = parseGenerateOptions({ autoSelect: true });
        assert.deepStrictEqual(parsed.autoSelect, { enabled: true });
    });

    test('A2: anomalyDetection boolean becomes { enabled: true }', () => {
        const parsed = parseGenerateOptions({ anomalyDetection: true });
        assert.deepStrictEqual(parsed.anomalyDetection, { enabled: true });
    });

    test('A3: exploitAnomalies fans out to exploitation and detection', () => {
        const parsed = parseGenerateOptions({ exploitAnomalies: true });
        assert.deepStrictEqual(parsed.anomalyExploitation, { enabled: true });
        assert.deepStrictEqual(parsed.anomalyDetection, { enabled: true });
        assert.strictEqual('exploitAnomalies' in parsed, false);
    });

    test('C1: merge preserves nested config fields when CLI enables autoSelect', () => {
        const cli = parseGenerateOptions({ autoSelect: true });
        const merged = mergeGenerateCliOverrides({ autoSelect: { enabled: false, strict: true, preferStandards: true } } as any, cli);
        assert.deepStrictEqual(merged.autoSelect, {
            enabled: true,
            strict: true,
            preferStandards: true,
        });
    });

    test('D1: exploitAnomalies enables detection while preserving nested config', () => {
        const cli = parseGenerateOptions({ exploitAnomalies: true });
        const merged = mergeGenerateCliOverrides(
            {
                anomalyDetection: { enabled: false, failOnAnomalies: true, reportPath: './report.json' },
                anomalyExploitation: { enabled: false, strategy: 'balanced' },
            } as any,
            cli
        );
        assert.deepStrictEqual(merged.anomalyDetection, {
            enabled: true,
            failOnAnomalies: true,
            reportPath: './report.json',
        });
        assert.deepStrictEqual(merged.anomalyExploitation, { enabled: true, strategy: 'balanced' });
    });

    test('G1: invalid anomalyDetection severity fails schema validation', () => {
        const result = validateZodOptions(generateOptionsSchema, {
            openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
            input: lomSpec,
            output: './out',
            anomalyDetection: { enabled: true, severity: 'INVALID' },
        });
        assert.strictEqual(result.success, false);
    });

    test('G2: nested dot-flags merge with boolean shorthand before Zod', () => {
        const mergedCli = mergeNestedCliOptions({ autoSelect: true, anomalyDetection: true }, { autoSelect: { strict: true }, anomalyDetection: { failOnAnomalies: true } });
        const parsed = parseGenerateOptions(mergedCli);
        assert.deepStrictEqual(parsed.autoSelect, { enabled: true, strict: true });
        assert.deepStrictEqual(parsed.anomalyDetection, { enabled: true, failOnAnomalies: true });
    });
});

describe('@unit: marauder generate integration scenarios', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('B1: config autoSelect object with nested fields passes through', async t => {
        const tempDir = createTempDir(t, 'marauder-b1-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                autoSelect: { enabled: true, strict: true, preferStandards: false },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('B2: config anomalyDetection with reportPath passes through', async t => {
        const tempDir = createTempDir(t, 'marauder-b2-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: {
                    enabled: true,
                    severity: 'high',
                    failOnAnomalies: false,
                    reportPath: './reports/anomalies.md',
                },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('B3: config anomalyExploitation with strategy and outputPath passes through', async t => {
        const tempDir = createTempDir(t, 'marauder-b3-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyExploitation: {
                    enabled: true,
                    strategy: 'balanced',
                    outputPath: './src/api/optimizations',
                },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('C2: CLI anomalyDetection overrides config enabled=false', async t => {
        const tempDir = createTempDir(t, 'marauder-c2-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: { enabled: false, failOnAnomalies: true },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            anomalyDetection: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('C3: CLI exploitAnomalies overrides config exploitation enabled=false', async t => {
        const tempDir = createTempDir(t, 'marauder-c3-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyExploitation: { enabled: false, strategy: 'aggressive' },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            exploitAnomalies: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('D2: both anomalyDetection and exploitAnomalies CLI flags enable Marauder features', async t => {
        const tempDir = createTempDir(t, 'marauder-d2-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: { enabled: false },
                anomalyExploitation: { enabled: false },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            anomalyDetection: true,
            exploitAnomalies: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('D3: exploitAnomalies preserves config anomalyDetection nested fields', async t => {
        const tempDir = createTempDir(t, 'marauder-d3-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: { enabled: false, severity: 'high', reportPath: './reports.md' },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            exploitAnomalies: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('E1: direct mode without Marauder flags succeeds', async t => {
        const outputDir = path.join(createTempDir(t, 'marauder-e1-'), 'generated');
        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
            input: lomSpec,
            output: outputDir,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('E2: config mode without Marauder blocks succeeds', async t => {
        const tempDir = createTempDir(t, 'marauder-e2-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('E3: config boolean shorthand false normalizes via migration', async t => {
        const tempDir = createTempDir(t, 'marauder-e3-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                autoSelect: false,
                anomalyDetection: false,
                anomalyExploitation: false,
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('F1: combined CLI overrides with nested config fields', async t => {
        const tempDir = createTempDir(t, 'marauder-f1-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                autoSelect: { enabled: false, strict: true },
                anomalyDetection: { enabled: true, severity: 'medium' },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            autoSelect: true,
            anomalyDetection: false,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('F2: per-item anomalyDetection override in config', async t => {
        const tempDir = createTempDir(t, 'marauder-f2-');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: { enabled: false },
                items: [
                    { input: lomSpec, output: path.join(tempDir, 'out1') },
                    { input: lomSpec, output: path.join(tempDir, 'out2'), anomalyDetection: { enabled: true, severity: 'high' } },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('F3: auto-select and exploitation with per-item exploitation override', async t => {
        const tempDir = createTempDir(t, 'marauder-f3-');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                autoSelect: { enabled: true, preferSmallBundles: true },
                anomalyExploitation: { enabled: true, strategy: 'balanced' },
                items: [
                    { input: lomSpec, output: path.join(tempDir, 'out1') },
                    { input: lomSpec, output: path.join(tempDir, 'out2'), anomalyExploitation: { enabled: false } },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('G3: failOnAnomalies stops generation when critical anomalies are found', async t => {
        const tempDir = createTempDir(t, 'marauder-g3-');
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                anomalyDetection: {
                    enabled: true,
                    failOnAnomalies: true,
                    severity: 'low',
                },
                items: [{ input: anomaliesSpec, output: outputDir }],
            })
        );

        const previousCwd = process.cwd();
        process.chdir(tempDir);
        t.after(() => {
            process.chdir(previousCwd);
        });

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, false, 'expected generation to fail on critical anomalies');
        assert.match(result.error ?? '', /critical anomaly/i);
        assert.strictEqual(existsSync(path.join(outputDir, 'index.ts')), false);
    });
});
