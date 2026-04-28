import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

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

const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

function runGenerateOpenApiClientInChild(options: Record<string, unknown>): number {
    const cliDefaults: Record<string, unknown> = {
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
    };

    const script = `
        import generateOpenApiClientModule from './src/cli/generateOpenApiClient/generateOpenApiClient.ts';
        const options = JSON.parse(process.env.CLI_OPTIONS ?? '{}');
        generateOpenApiClientModule.generateOpenApiClient(options).catch((error) => {
            console.error(error instanceof Error ? error.message : String(error));
            process.exit(1);
        });
    `;

    const result = spawnSync(process.execPath, ['--import', 'tsx', '-e', script], {
        cwd: repoRoot,
        env: {
            ...process.env,
            CLI_OPTIONS: JSON.stringify({
                ...cliDefaults,
                ...options,
            }),
        },
        encoding: 'utf8',
    });

    return result.status ?? 1;
}

describe('@unit: cli strict-openapi', () => {
    test('returns exit code 0 and writes report file when strict has no errors', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-strict-ok-'));
        const reportFile = path.join(tempDir, 'strict-report.json');
        const outputDir = path.join(tempDir, 'generated');

        const exitCode = runGenerateOpenApiClientInChild({
            input: path.join(repoRoot, 'test/spec/lom/lom_api.yaml'),
            output: outputDir,
            strictOpenapi: true,
            reportFile,
        });

        assert.strictEqual(exitCode, 0);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(Array.isArray(report.issues));
        assert.ok(Array.isArray(report.governance.violations));
        assert.strictEqual(typeof report.summary.errors, 'number');
        assert.strictEqual(typeof report.summary.warnings, 'number');
        assert.strictEqual(typeof report.summary.info, 'number');
    });

    test('returns exit code 1 and writes report file when strict finds errors', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-strict-error-'));
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

        const exitCode = runGenerateOpenApiClientInChild({
            input: inputSpec,
            output: outputDir,
            strictOpenapi: true,
            reportFile,
        });

        assert.strictEqual(exitCode, 1);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(report.summary.errors > 0);
        assert.ok(report.issues.some(issue => issue.severity === 'error'));
    });

    test('applies governance config file in strict report', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-strict-governance-'));
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

        const exitCode = runGenerateOpenApiClientInChild({
            input: inputSpec,
            output: outputDir,
            strictOpenapi: true,
            reportFile,
            governanceConfig,
        });

        assert.strictEqual(exitCode, 0);

        const report = JSON.parse(readFileSync(reportFile, 'utf8')) as StrictReport;
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(
            report.governance.violations.some(
                violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX' && violation.severity === 'error'
            )
        );
    });
});
