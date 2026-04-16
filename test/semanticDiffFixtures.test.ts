import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { validateSemanticDiffReportSchema } from '../src/core/semanticDiff/semanticDiffReportSchema';
import { toMatchSnapshot } from './utils/toMatchSnapshot';

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
 * Runs CLI analyze-diff and returns process exit code.
 */
function runAnalyzeDiff(oldSpec: string, newSpec: string, reportFile: string, governanceConfig?: string): number {
    const args = ['--import', 'tsx', './src/cli/index.ts', 'analyze-diff', '--input', newSpec, '--compare-with', oldSpec, '--output-report', reportFile];
    if (governanceConfig) {
        args.push('--governance-config', governanceConfig);
    }

    const result = spawnSync(process.execPath, args, {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    return result.status ?? 1;
}

/**
 * Builds compact, stable projection for snapshot assertions.
 */
function buildSnapshotProjection(report: SemanticDiffReport): Record<string, unknown> {
    return {
        schemaVersion: report.schemaVersion,
        summary: report.summary,
        recommendation: report.recommendation,
        governanceSummary: report.governance.summary,
        governanceRuleIds: [...new Set(report.governance.violations.map(violation => violation.ruleId))].sort(),
        changesCount: report.changes.length,
        topChanges: report.changes.slice(0, 30).map(change => ({
            type: change.type,
            severity: change.severity,
            path: change.path,
        })),
    };
}

/**
 * Asserts semantic diff report against named snapshot.
 */
function assertSemanticDiffFixtureSnapshot(
    oldSpecRelativePath: string,
    newSpecRelativePath: string,
    snapshotName: string,
    governanceConfigRaw?: Record<string, unknown>
): SemanticDiffReport {
    const tempDir = mkdtempSync(path.join(repoRoot, 'test', 'generated', `semantic-diff-fixture-${snapshotName}-`));
    const reportPath = path.join(tempDir, 'report.json');
    const governanceConfigPath = path.join(tempDir, 'governance.json');

    const oldSpecPath = path.join(repoRoot, oldSpecRelativePath);
    const newSpecPath = path.join(repoRoot, newSpecRelativePath);

    if (governanceConfigRaw) {
        writeFileSync(governanceConfigPath, JSON.stringify(governanceConfigRaw, null, 2), 'utf8');
    }

    const exitCode = runAnalyzeDiff(oldSpecPath, newSpecPath, reportPath, governanceConfigRaw ? governanceConfigPath : undefined);
    assert.ok(exitCode === 0 || exitCode === 1, `Unexpected analyze-diff exit code: ${exitCode}`);

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
    const schemaValidation = validateSemanticDiffReportSchema(report);
    assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
    assert.strictEqual(report.schemaVersion, '1.1.0');
    const projectedReport = buildSnapshotProjection(report);

    const snapshotFile = path.join(repoRoot, 'test', '__snapshots__', 'semanticDiff', `${snapshotName}.snap.json`);
    toMatchSnapshot(JSON.stringify(projectedReport, null, 2), snapshotFile);

    return report;
}

describe('@unit: semantic diff fixtures', () => {
    test('matches snapshot for large v3 -> v3.withDifferentRefs diff', () => {
        assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.withDifferentRefs.yml', 'v3_to_v3_withDifferentRefs');
    });

    test('matches snapshot for large v2 -> v3 diff', () => {
        assertSemanticDiffFixtureSnapshot('test/spec/v2.json', 'test/spec/v3.json', 'v2_to_v3');
    });

    test('matches snapshot for large v3 -> v3.withDifferentRefs diff with governance override', () => {
        assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.withDifferentRefs.yml', 'v3_to_v3_withDifferentRefs_governance', {
            rules: {
                NO_BREAKING_WITHOUT_FLAG: {
                    enabled: false,
                },
            },
        });
    });

    test('matches snapshot for large v3 -> v3 patch diff', () => {
        const report = assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.json', 'v3_to_v3_patch');
        assert.strictEqual(report.recommendation.semver, 'patch');
        assert.ok(report.recommendation.reasons.includes('NO_API_SURFACE_CHANGES'));
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
    });
});
