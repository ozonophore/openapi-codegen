import assert from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import type { SemanticDiffReport } from '../../../core/semanticDiff/analyzeOpenApiDiff';
import { validateSemanticDiffReportSchema } from '../../../core/semanticDiff/semanticDiffReportSchema';
import { analyzeDiff, type AnalyzeDiffResult, toAnalyzeDiffExitCode } from '../analyzeDiff';
import { formatCiMarkdownSummary } from '../ciSummary';

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

async function runAnalyzeDiffCli(options: {
    input: string;
    outputReport: string;
    compareWith?: string;
    git?: string;
    ci?: boolean;
    allowBreaking?: boolean;
    governanceConfig?: string;
    openapiConfig?: string;
}): Promise<{ exitCode: number; result: AnalyzeDiffResult }> {
    const result = await analyzeDiff(options);
    return {
        exitCode: toAnalyzeDiffExitCode(result),
        result,
    };
}

describe('@unit: analyzeDiff cli', () => {
    test('returns exit code 0 and skips when --input has no base source', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-skip-');
        const reportPath = path.join(tempDir, 'report.json');
        const inputSpecPath = path.join(repoRoot, 'test/spec/v3.json');
        const { exitCode, result } = await runAnalyzeDiffCli({
            input: inputSpecPath,
            outputReport: reportPath,
            ci: false,
        });

        assert.strictEqual(exitCode, 0);
        assert.strictEqual(result.skipped, true);
        assert.strictEqual(result.error, undefined);
    });

    test('returns exit code 0 for --input + --git', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-git-');
        const reportPath = path.join(tempDir, 'report.json');
        const inputSpecPath = path.join(repoRoot, 'test/spec/v3.json');
        const { exitCode } = await runAnalyzeDiffCli({
            input: inputSpecPath,
            outputReport: reportPath,
            git: 'HEAD',
            ci: true,
        });

        assert.strictEqual(exitCode, 0);
    });

    test('returns exit code 0 for non-breaking diff in ci mode', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-ok-');
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

        const { exitCode } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            ci: true,
        });
        assert.strictEqual(exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.strictEqual(report.summary.breaking, 0);
        assert.ok(report.summary.nonBreaking > 0);
        assert.strictEqual(report.recommendation.semver, 'minor');
        assert.ok(report.recommendation.reasons.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));
        assert.strictEqual(report.governance.summary.errors, 0);

        const ciSummary = formatCiMarkdownSummary(report, reportPath);
        assert.ok(ciSummary.includes('### OpenAPI Semantic Diff'));
        assert.ok(ciSummary.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));
    });

    test('returns exit code 1 for breaking diff in ci mode', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-breaking-');
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

        const { exitCode } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            ci: true,
        });
        assert.strictEqual(exitCode, 1);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(report.changes.some(change => change.severity === 'breaking'));
        assert.strictEqual(report.recommendation.semver, 'major');
        assert.ok(report.recommendation.reasons.includes('HAS_BREAKING_CHANGES'));
        assert.ok(report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));

        const ciSummary = formatCiMarkdownSummary(report, reportPath);
        assert.ok(ciSummary.includes('### OpenAPI Semantic Diff'));
        assert.ok(ciSummary.includes('HAS_BREAKING_CHANGES'));
    });

    test('returns exit code 0 for breaking diff in ci mode when allow-breaking is enabled', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-breaking-allowed-');
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

        const { exitCode } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            ci: true,
            allowBreaking: true,
        });
        assert.strictEqual(exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(formatCiMarkdownSummary(report, reportPath).includes('### OpenAPI Semantic Diff'));
    });

    test('returns exit code 0 for breaking diff in ci mode when governance config disables no-breaking rule', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-breaking-policy-');
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

        const { exitCode } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            ci: true,
            governanceConfig: governanceConfigPath,
        });
        assert.strictEqual(exitCode, 0);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking > 0);
        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(formatCiMarkdownSummary(report, reportPath).includes('### OpenAPI Semantic Diff'));
    });

    test('uses --compare-with over --git when both flags are provided', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-priority-');
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

        const { exitCode, result } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            git: 'HEAD~9999',
            ci: true,
        });
        assert.strictEqual(exitCode, 0);
        assert.strictEqual(result.success, true);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.recommendation.semver, 'patch');
        assert.ok(LOGGER_MESSAGES.ANALYZE_DIFF.COMPARE_WITH_OVERRIDES_GIT('HEAD~9999').includes('Ignoring git ref'));
    });

    test('filters semantic changes with analyze.ignore and recalculates summary', async t => {
        const tempDir = createTempDir(t, 'openapi-cli-analyze-ignore-');
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

        const { exitCode, result } = await runAnalyzeDiffCli({
            input: newSpecPath,
            outputReport: reportPath,
            compareWith: oldSpecPath,
            openapiConfig: configPath,
            ci: true,
        });

        assert.strictEqual(exitCode, 0);
        assert.strictEqual(result.ignored, 1);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
        assert.strictEqual(report.summary.informational, 0);
        assert.strictEqual(report.recommendation.semver, 'patch');
        assert.ok(LOGGER_MESSAGES.ANALYZE_DIFF.IGNORED_CHANGES(1).includes('IGNORED: 1 semantic change'));
    });

    test('fails when --input is missing', async () => {
        const result = await analyzeDiff({ git: 'HEAD~1' });
        assert.strictEqual(toAnalyzeDiffExitCode(result), 1);
        assert.ok(result.error?.includes('"--input" is required for analyze-diff command'));
    });

    test('fails when analyze-diff is invoked without --input (legacy positional args are not accepted)', async () => {
        const result = await analyzeDiff({});
        assert.strictEqual(toAnalyzeDiffExitCode(result), 1);
        assert.ok(result.error?.includes('"--input" is required for analyze-diff command'));
    });
});
