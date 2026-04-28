import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { validateSemanticDiffReportSchema } from '../src/core/semanticDiff/semanticDiffReportSchema';

type SemanticDiffReport = {
    schemaVersion: string;
    summary: {
        breaking: number;
        nonBreaking: number;
        informational: number;
    };
    recommendation: {
        semver: 'major' | 'minor' | 'patch';
        confidence: 'high' | 'medium' | 'low';
        reason: string;
        reasons: string[];
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
    changes: Array<{
        type: string;
        severity: 'breaking' | 'non-breaking' | 'informational';
        message: string;
        path: string;
    }>;
};

const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

/**
 * Runs CLI analyze-diff command as child process.
 */
function runAnalyzeDiff(
    inputSpec: string,
    reportFile: string,
    compareWith?: string,
    gitRef?: string,
    ci = true,
    allowBreaking = false,
    governanceConfig?: string
): { exitCode: number; stdout: string; stderr: string } {
    const args = ['--import', 'tsx', './src/cli/index.ts', 'analyze-diff', '--input', inputSpec, '--output-report', reportFile];
    if (compareWith) {
        args.push('--compare-with', compareWith);
    }
    if (gitRef) {
        args.push('--git', gitRef);
    }
    if (ci) {
        args.push('--ci');
    }
    if (allowBreaking) {
        args.push('--allow-breaking');
    }
    if (governanceConfig) {
        args.push('--governance-config', governanceConfig);
    }

    const result = spawnSync(process.execPath, args, {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    return {
        exitCode: result.status ?? 1,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
    };
}

describe('@unit: cli analyze-diff', () => {
    test('returns exit code 0 and skipped output for --input without base-source', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-skip-'));
        const reportPath = path.join(tempDir, 'report.json');
        const inputSpecPath = path.join(repoRoot, 'test', 'spec', 'v3.json');
        const analyzeResult = runAnalyzeDiff(inputSpecPath, reportPath, undefined, undefined, false);
        assert.strictEqual(analyzeResult.exitCode, 0);
        assert.ok(analyzeResult.stdout.includes('History analysis skipped'));
    });

    test('returns exit code 0 for --input + --git', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-git-'));
        const reportPath = path.join(tempDir, 'report.json');
        const inputSpecPath = path.join(repoRoot, 'test', 'spec', 'v3.json');
        const analyzeResult = runAnalyzeDiff(inputSpecPath, reportPath, undefined, 'HEAD', true);
        assert.strictEqual(analyzeResult.exitCode, 0);
    });

    test('returns exit code 0 for non-breaking diff in ci mode', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-ok-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '1.1.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                    '/pong': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        const analyzeResult = runAnalyzeDiff(newSpecPath, reportPath, oldSpecPath, undefined, true);
        assert.strictEqual(analyzeResult.exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.strictEqual(report.summary.breaking, 0);
        assert.ok(report.summary.nonBreaking > 0);
        assert.strictEqual(report.recommendation.semver, 'minor');
        assert.ok(report.recommendation.reasons.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));
        assert.strictEqual(report.governance.summary.errors, 0);
        assert.ok(analyzeResult.stdout.includes('### OpenAPI Semantic Diff'));
        assert.ok(analyzeResult.stdout.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));
    });

    test('returns exit code 1 for breaking diff in ci mode', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-breaking-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '2.0.0' },
                paths: {},
            })
        );

        const analyzeResult = runAnalyzeDiff(newSpecPath, reportPath, oldSpecPath, undefined, true);
        assert.strictEqual(analyzeResult.exitCode, 1);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(report.changes.some(change => change.severity === 'breaking'));
        assert.strictEqual(report.recommendation.semver, 'major');
        assert.ok(report.recommendation.reasons.includes('HAS_BREAKING_CHANGES'));
        assert.ok(report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(analyzeResult.stdout.includes('### OpenAPI Semantic Diff'));
        assert.ok(analyzeResult.stdout.includes('HAS_BREAKING_CHANGES'));
    });

    test('returns exit code 0 for breaking diff in ci mode when allow-breaking is enabled', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-breaking-allowed-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            operationId: 'getPing',
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '2.0.0' },
                paths: {},
            })
        );

        const analyzeResult = runAnalyzeDiff(newSpecPath, reportPath, oldSpecPath, undefined, true, true);
        assert.strictEqual(analyzeResult.exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(analyzeResult.stdout.includes('### OpenAPI Semantic Diff'));
    });

    test('returns exit code 0 for breaking diff in ci mode when governance config disables no-breaking rule', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-breaking-policy-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');
        const governanceConfigPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            operationId: 'getPing',
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '2.0.0' },
                paths: {},
            })
        );

        writeFileSync(
            governanceConfigPath,
            JSON.stringify({
                rules: {
                    NO_BREAKING_WITHOUT_FLAG: {
                        enabled: false,
                    },
                },
            })
        );

        const analyzeResult = runAnalyzeDiff(newSpecPath, reportPath, oldSpecPath, undefined, true, false, governanceConfigPath);
        assert.strictEqual(analyzeResult.exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(analyzeResult.stdout.includes('### OpenAPI Semantic Diff'));
    });

    test('uses --compare-with over --git when both flags are provided', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-priority-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '1.1.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        const analyzeResult = runAnalyzeDiff(newSpecPath, reportPath, oldSpecPath, 'HEAD~9999', true);
        assert.strictEqual(analyzeResult.exitCode, 0);
        assert.ok(analyzeResult.stdout.includes('Ignoring git ref'));
    });

    test('filters semantic changes with analyze.ignore and recalculates summary', () => {
        const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', 'openapi-cli-analyze-ignore-'));
        const oldSpecPath = path.join(tempDir, 'old.json');
        const newSpecPath = path.join(tempDir, 'new.json');
        const reportPath = path.join(tempDir, 'report.json');
        const configPath = path.join(tempDir, 'openapi.config.json');

        writeFileSync(
            oldSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Old', version: '1.0.0' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            newSpecPath,
            JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'New', version: '1.0.1' },
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                    '/pong': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            })
        );

        writeFileSync(
            configPath,
            JSON.stringify(
                {
                    analyze: {
                        ignore: [
                            {
                                path: '#/paths/GET /pong',
                            },
                        ],
                    },
                },
                null,
                2
            )
        );

        const result = spawnSync(
            process.execPath,
            [
                '--import',
                'tsx',
                './src/cli/index.ts',
                'analyze-diff',
                '--input',
                newSpecPath,
                '--compare-with',
                oldSpecPath,
                '--output-report',
                reportPath,
                '--openapi-config',
                configPath,
                '--ci',
            ],
            {
                cwd: repoRoot,
                encoding: 'utf8',
            }
        );

        assert.strictEqual(result.status, 0);
        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
        assert.strictEqual(report.summary.informational, 0);
        assert.strictEqual(report.recommendation.semver, 'patch');
        assert.ok((result.stdout ?? '').includes('IGNORED: 1 semantic change'));
    });

    test('fails when --input is missing', () => {
        const result = spawnSync(process.execPath, ['--import', 'tsx', './src/cli/index.ts', 'analyze-diff', '--git', 'HEAD~1'], {
            cwd: repoRoot,
            encoding: 'utf8',
        });
        assert.strictEqual(result.status, 1);
        assert.ok((result.stdout ?? '').includes('"--input" is required for analyze-diff command'));
    });

    test('old positional analyze-diff arguments are rejected', () => {
        const result = spawnSync(process.execPath, ['--import', 'tsx', './src/cli/index.ts', 'analyze-diff', 'old.json', 'new.json'], {
            cwd: repoRoot,
            encoding: 'utf8',
        });
        assert.strictEqual(result.status, 1);
    });
});
