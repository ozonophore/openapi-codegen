import assert from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../../common/Consts';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import type { CLICommandResult } from '../../types';
import { generateOpenApiClient } from '../generateOpenApiClient';

type StrictReport = {
    summary: {
        errors: number;
        warnings: number;
        info: number;
    };
    governance: {
        summary: {
            errors: number;
            warnings: number;
            info: number;
        };
        violations: Array<{
            ruleId: string;
            severity: 'error' | 'warning' | 'info';
            message: string;
            path: string;
        }>;
    };
    issues: Array<{
        severity: 'error' | 'warning' | 'info';
        code: string;
        message: string;
        path: string;
    }>;
};

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

function runStrictGenerate(options: Record<string, unknown>): Promise<CLICommandResult> {
    return generateOpenApiClient({
        ...cliDefaults,
        ...options,
    });
}

describe('@unit: generateOpenApiClient strict-openapi', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('returns success and writes report file when strict has no errors', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-strict-ok-');
        const reportFile = path.join(tempDir, 'strict-report.json');
        const outputDir = path.join(tempDir, 'generated');

        const result = await runStrictGenerate({
            input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'),
            output: outputDir,
            strictOpenapi: true,
            reportFile,
        });

        assert.strictEqual(result.success, true);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(Array.isArray(report.issues));
        assert.ok(Array.isArray(report.governance.violations));
        assert.strictEqual(typeof report.summary.errors, 'number');
        assert.strictEqual(typeof report.summary.warnings, 'number');
        assert.strictEqual(typeof report.summary.info, 'number');
    });

    test('returns failure and writes report file when strict finds errors', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-strict-error-');
        const inputSpec = path.join(tempDir, 'broken-openapi.json');
        const reportFile = path.join(tempDir, 'strict-report.json');
        const outputDir = path.join(tempDir, 'generated');

        writeFileSync(
            inputSpec,
            JSON.stringify({
                openapi: '3.0.0',
                info: {
                    title: 'Broken API',
                    version: '1.0.0',
                },
                paths: {
                    '/broken': {
                        get: {
                            responses: {
                                '200': {
                                    description: 'ok',
                                    content: {
                                        'application/json': {
                                            schema: {
                                                $ref: '#/components/schemas/Missing',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                components: {
                    schemas: {},
                },
            })
        );

        const result = await runStrictGenerate({
            input: inputSpec,
            output: outputDir,
            strictOpenapi: true,
            reportFile,
        });

        assert.strictEqual(result.success, false);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(report.summary.errors > 0);
        assert.ok(report.issues.some(issue => issue.severity === 'error'));
    });

    test('applies governance config file in strict report', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-strict-governance-');
        const inputSpec = path.join(tempDir, 'policy-openapi.json');
        const reportFile = path.join(tempDir, 'strict-report.json');
        const governanceConfig = path.join(tempDir, 'governance.json');
        const outputDir = path.join(tempDir, 'generated');

        writeFileSync(
            inputSpec,
            JSON.stringify({
                openapi: '3.0.0',
                info: {
                    title: 'Policy API',
                    version: '1.0.0',
                },
                paths: {
                    '/policy': {
                        get: {
                            responses: {
                                default: {
                                    description: 'fallback',
                                },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            governanceConfig,
            JSON.stringify({
                rules: {
                    REQUIRE_OPERATION_ID: {
                        enabled: false,
                    },
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'error',
                    },
                },
            })
        );

        const result = await runStrictGenerate({
            input: inputSpec,
            output: outputDir,
            strictOpenapi: true,
            reportFile,
            governanceConfig,
        });

        assert.strictEqual(result.success, true);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(report.governance.violations.some(violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX' && violation.severity === 'error'));
    });

    test('failOnGovernanceErrors stops generation when governance reports errors', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-strict-fail-gov-');
        const inputSpec = path.join(tempDir, 'policy-openapi.json');
        const reportFile = path.join(tempDir, 'strict-report.json');
        const governanceConfig = path.join(tempDir, 'governance.json');
        const outputDir = path.join(tempDir, 'generated');

        writeFileSync(
            inputSpec,
            JSON.stringify({
                openapi: '3.0.0',
                info: {
                    title: 'Policy API',
                    version: '1.0.0',
                },
                paths: {
                    '/policy': {
                        get: {
                            responses: {
                                default: {
                                    description: 'fallback',
                                },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            governanceConfig,
            JSON.stringify({
                rules: {
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'error',
                    },
                },
            })
        );

        const result = await runStrictGenerate({
            input: inputSpec,
            output: outputDir,
            strictOpenapi: true,
            failOnGovernanceErrors: true,
            reportFile,
            governanceConfig,
        });

        assert.strictEqual(result.success, false);
    });

    test('direct mode succeeds with Commander default openapiConfig', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-direct-ocn-');
        const outputDir = path.join(tempDir, 'generated');

        const result = await runStrictGenerate({
            openapiConfig: DEFAULT_OPENAPI_CONFIG_FILENAME,
            input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'),
            output: outputDir,
        });

        assert.strictEqual(result.success, true);
    });
});
