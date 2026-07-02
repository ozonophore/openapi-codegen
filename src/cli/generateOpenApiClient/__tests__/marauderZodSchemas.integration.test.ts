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

function useTempWorkDir(t: TestContext, tempDir: string): void {
    const previousCwd = process.cwd();
    process.chdir(tempDir);
    t.after(() => {
        process.chdir(previousCwd);
    });
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

    test('A2: specAnalysis boolean becomes { enabled: true }', () => {
        const parsed = parseGenerateOptions({ specAnalysis: true });
        assert.deepStrictEqual(parsed.specAnalysis, { enabled: true });
    });

    test('A3: anomalyDetection deprecated alias still parses', () => {
        const parsed = parseGenerateOptions({ anomalyDetection: true });
        assert.deepStrictEqual(parsed.anomalyDetection, { enabled: true });
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

    test('D1: CLI specAnalysis enables analysis while preserving nested config', () => {
        const cli = parseGenerateOptions({ specAnalysis: true });
        const merged = mergeGenerateCliOverrides(
            {
                specAnalysis: { enabled: false, failOnHigh: true, reportPath: './report.json' },
                anomalyDetection: { severity: 'high' },
            } as any,
            cli
        );
        assert.deepStrictEqual(merged.specAnalysis, {
            enabled: true,
            failOnHigh: true,
            reportPath: './report.json',
            severity: 'high',
        });
    });

    test('G1: invalid specAnalysis severity fails schema validation', () => {
        const result = validateZodOptions(generateOptionsSchema, {
            openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
            input: lomSpec,
            output: './out',
            specAnalysis: { enabled: true, severity: 'INVALID' },
        });
        assert.strictEqual(result.success, false);
    });

    test('G2: nested dot-flags merge with boolean shorthand before Zod', () => {
        const mergedCli = mergeNestedCliOptions({ autoSelect: true, specAnalysis: true }, { autoSelect: { strict: true }, specAnalysis: { failOnHigh: true } });
        const parsed = parseGenerateOptions(mergedCli);
        assert.deepStrictEqual(parsed.autoSelect, { enabled: true, strict: true });
        assert.deepStrictEqual(parsed.specAnalysis, { enabled: true, failOnHigh: true });
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

    test('B2: config specAnalysis with reportPath passes through', async t => {
        const tempDir = createTempDir(t, 'marauder-b2-');
        useTempWorkDir(t, tempDir);
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                specAnalysis: {
                    enabled: true,
                    severity: 'high',
                    failOnHigh: false,
                    reportFormat: 'markdown',
                    reportPath: './reports/anomalies.md',
                },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
        assert.ok(existsSync(path.join(tempDir, 'reports', 'anomalies.md')), 'spec analysis report should be written under temp dir');
    });

    test('B3: config mode accepts boolean Marauder shorthand and specAnalysis alias', async t => {
        const tempDir = createTempDir(t, 'marauder-b3-');
        useTempWorkDir(t, tempDir);
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                items: [{ input: lomSpec, output: outputDir }],
                autoSelect: true,
                specAnalysis: true,
                anomalyDetection: true,
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('C2: CLI specAnalysis overrides config enabled=false', async t => {
        const tempDir = createTempDir(t, 'marauder-c2-');
        useTempWorkDir(t, tempDir);
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                specAnalysis: { enabled: false, failOnHigh: true },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            specAnalysis: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('D2: both specAnalysis and anomalyDetection CLI flags enable analysis', async t => {
        const tempDir = createTempDir(t, 'marauder-d2-');
        useTempWorkDir(t, tempDir);
        const outputDir = path.join(tempDir, 'generated');
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                specAnalysis: { enabled: false },
                anomalyDetection: { enabled: false },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            specAnalysis: true,
            anomalyDetection: true,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('D3: specAnalysis preserves config anomalyDetection nested fields', async t => {
        const tempDir = createTempDir(t, 'marauder-d3-');
        useTempWorkDir(t, tempDir);
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
            specAnalysis: true,
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

    for (const flag of ['autoSelect', 'specAnalysis', 'anomalyDetection'] as const) {
        test(`E4: direct mode with ${flag} flag`, async t => {
            const tempDir = createTempDir(t, `marauder-e4-${flag}-`);
            if (flag !== 'autoSelect') {
                useTempWorkDir(t, tempDir);
            }
            const outputDir = path.join(tempDir, 'generated');
            const result = await generateOpenApiClient({
                ...cliDefaults,
                openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
                input: lomSpec,
                output: outputDir,
                [flag]: true,
            });
            assert.strictEqual(result.success, true, result.error);
        });
    }

    test('E5: direct mode with tsconfigPath and eslintConfigPath succeeds', async t => {
        const outputDir = path.join(createTempDir(t, 'marauder-e5-'), 'generated');
        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
            input: lomSpec,
            output: outputDir,
            tsconfigPath: path.join(repoRoot, 'tsconfig.json'),
            eslintConfigPath: path.join(repoRoot, 'eslint.config.js'),
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
                specAnalysis: false,
                anomalyDetection: false,
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
                specAnalysis: { enabled: true, severity: 'medium' },
                items: [{ input: lomSpec, output: outputDir }],
            })
        );

        const result = await generateOpenApiClient({
            ...cliDefaults,
            openapiConfig: configPath,
            autoSelect: true,
            specAnalysis: false,
        });
        assert.strictEqual(result.success, true, result.error);
    });

    test('F2: per-item specAnalysis override in config', async t => {
        const tempDir = createTempDir(t, 'marauder-f2-');
        useTempWorkDir(t, tempDir);
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                specAnalysis: { enabled: false },
                items: [
                    { input: lomSpec, output: path.join(tempDir, 'out1') },
                    { input: lomSpec, output: path.join(tempDir, 'out2'), specAnalysis: { enabled: true, severity: 'high' } },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('F3: auto-select with per-item specAnalysis override', async t => {
        const tempDir = createTempDir(t, 'marauder-f3-');
        useTempWorkDir(t, tempDir);
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                autoSelect: { enabled: true, preferSmallBundles: true },
                specAnalysis: { enabled: true, crossSpec: false },
                items: [
                    { input: lomSpec, output: path.join(tempDir, 'out1') },
                    { input: lomSpec, output: path.join(tempDir, 'out2'), specAnalysis: { enabled: false } },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, true, result.error);
    });

    test('G3: failOnHigh stops generation when critical anomalies are found', async t => {
        const tempDir = createTempDir(t, 'marauder-g3-');
        useTempWorkDir(t, tempDir);
        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                specAnalysis: {
                    enabled: true,
                    failOnHigh: true,
                    severity: 'low',
                },
                items: [{ input: anomaliesSpec, output: './generated' }],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.strictEqual(result.success, false, 'expected generation to fail on critical anomalies');
        assert.match(result.error ?? '', /high-severity finding/i);
        assert.ok(existsSync(path.join(tempDir, '.openapi-codegen-reports', 'anomaly-report.json')), 'anomaly report should be written before abort');
    });
});
