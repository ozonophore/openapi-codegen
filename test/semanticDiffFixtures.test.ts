import assert from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { analyzeDiff, toAnalyzeDiffExitCode } from '../src/cli/analyzeDiff/analyzeDiff';
import type { SemanticDiffReport } from '../src/core/semanticDiff/analyzeOpenApiDiff';
import { validateSemanticDiffReportSchema } from '../src/core/semanticDiff/semanticDiffReportSchema';
import { toMatchSnapshot } from './utils/toMatchSnapshot';

const repoRoot = path.join(__dirname, '..');

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
async function assertSemanticDiffFixtureSnapshot(
    oldSpecRelativePath: string,
    newSpecRelativePath: string,
    snapshotName: string,
    governanceConfigRaw?: Record<string, unknown>
): Promise<SemanticDiffReport> {
    const generatedRoot = path.join(repoRoot, 'test', 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, `semantic-diff-fixture-${snapshotName}-`));
    const reportPath = path.join(tempDir, 'report.json');
    const governanceConfigPath = path.join(tempDir, 'governance.json');

    const oldSpecPath = path.join(repoRoot, oldSpecRelativePath);
    const newSpecPath = path.join(repoRoot, newSpecRelativePath);

    try {
        if (governanceConfigRaw) {
            writeFileSync(governanceConfigPath, JSON.stringify(governanceConfigRaw, null, 2), 'utf8');
        }

        const result = await analyzeDiff({
            input: newSpecPath,
            compareWith: oldSpecPath,
            outputReport: reportPath,
            governanceConfig: governanceConfigRaw ? governanceConfigPath : undefined,
        });
        const exitCode = toAnalyzeDiffExitCode(result);
        assert.ok(exitCode === 0 || exitCode === 1, `Unexpected analyze-diff exit code: ${exitCode}`);

        const report = JSON.parse(readFileSync(reportPath, 'utf8')) as SemanticDiffReport;
        const schemaValidation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(schemaValidation.valid, true, schemaValidation.errors.join('\n'));
        assert.strictEqual(report.schemaVersion, '1.1.0');
        const projectedReport = buildSnapshotProjection(report);

        const snapshotFile = path.join(repoRoot, 'test', '__snapshots__', 'semanticDiff', `${snapshotName}.snap.json`);
        toMatchSnapshot(JSON.stringify(projectedReport, null, 2), snapshotFile);

        return report;
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
}

describe('@unit: semantic diff fixtures', () => {
    test('matches snapshot for large v3 -> v3.withDifferentRefs diff', async () => {
        await assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.withDifferentRefs.yml', 'v3_to_v3_withDifferentRefs');
    });

    test('matches snapshot for large v2 -> v3 diff', async () => {
        await assertSemanticDiffFixtureSnapshot('test/spec/v2.json', 'test/spec/v3.json', 'v2_to_v3');
    });

    test('matches snapshot for large v3 -> v3.withDifferentRefs diff with governance override', async () => {
        await assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.withDifferentRefs.yml', 'v3_to_v3_withDifferentRefs_governance', {
            rules: {
                NO_BREAKING_WITHOUT_FLAG: {
                    enabled: false,
                },
            },
        });
    });

    test('matches snapshot for large v3 -> v3 patch diff', async () => {
        const report = await assertSemanticDiffFixtureSnapshot('test/spec/v3.json', 'test/spec/v3.json', 'v3_to_v3_patch');
        assert.strictEqual(report.recommendation.semver, 'patch');
        assert.ok(report.recommendation.reasons.includes('NO_API_SURFACE_CHANGES'));
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
    });
});
