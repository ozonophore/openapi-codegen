import assert from 'node:assert';
import { describe, test } from 'node:test';

import { analyzeOpenApiDiff } from '../analyzeOpenApiDiff';
import {
    breakingModelAndOperationRemovalsScenario,
    formatNarrowingScenario,
    governanceBreakingScenario,
    infoVersionMajorScenario,
    infoVersionMinorScenario,
    nonBreakingAdditionsScenario,
    operationRemovedWithMetadataScenario,
    propertyRequiredTypeAndEnumScenario,
    propertyTypeAndEnumScenario,
    refAndFormatWideningScenario,
    securitySchemeChangesScenario,
    semverMajorScenario,
    semverMinorScenario,
    semverPatchScenario,
    stableDedupOrderingScenario,
    successResponsePayloadChangesScenario,
    wideningAndNarrowingTransitionsScenario,
} from './fixtures/diffScenarios';

describe('@unit: analyzeOpenApiDiff', () => {
    test('detects breaking model and operation removals', () => {
        const { oldSpec, newSpec } = breakingModelAndOperationRemovalsScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking >= 2);
        assert.ok(report.changes.some(change => change.type === 'model.removed'));
        assert.ok(report.changes.some(change => change.type === 'operation.removed'));
    });

    test('includes from/to on property type and enum value changes', () => {
        const { oldSpec, newSpec } = propertyTypeAndEnumScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);
        const typeChange = report.changes.find(change => change.type === 'model.property.type.changed' && change.path.includes('/age'));
        const roleTypeChange = report.changes.find(change => change.type === 'model.property.type.changed' && change.path.includes('/role'));

        assert.strictEqual(typeChange?.from, 'number');
        assert.strictEqual(typeChange?.to, 'integer');
        assert.strictEqual(roleTypeChange?.from, 'enum(admin|user)');
        assert.strictEqual(roleTypeChange?.to, 'enum(admin)');
    });

    test('includes operation metadata on operation.removed', () => {
        const { oldSpec, newSpec } = operationRemovedWithMetadataScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);
        const removed = report.changes.find(change => change.type === 'operation.removed');

        assert.ok(removed);
        assert.deepStrictEqual(removed?.from, {
            operationId: 'listPets',
            summary: 'List pets',
            description: 'Returns pets',
            tags: ['pets'],
        });
    });

    test('detects property required/type changes and enum changes', () => {
        const { oldSpec, newSpec } = propertyRequiredTypeAndEnumScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.severity === 'breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.required.changed' && change.severity === 'non-breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/role')));
    });

    test('detects non-breaking additions', () => {
        const { oldSpec, newSpec } = nonBreakingAdditionsScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.summary.nonBreaking >= 3);
        assert.ok(report.changes.some(change => change.type === 'model.added'));
        assert.ok(report.changes.some(change => change.type === 'operation.added'));
        assert.ok(report.changes.some(change => change.type === 'operation.response.success.added'));
    });

    test('classifies widening and narrowing transitions for enum/number and union', () => {
        const { oldSpec, newSpec } = wideningAndNarrowingTransitionsScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/tier') && change.severity === 'non-breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/score') && change.severity === 'non-breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/state') && change.severity === 'breaking'));
    });

    test('treats different refs and narrowing formats as breaking, widening formats as non-breaking', () => {
        const { oldSpec, newSpec } = refAndFormatWideningScenario;
        const wideningReport = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(wideningReport.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/profile') && change.severity === 'breaking'));
        assert.ok(wideningReport.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/count') && change.severity === 'non-breaking'));
        assert.ok(wideningReport.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/ratio') && change.severity === 'non-breaking'));

        const { oldSpec: narrowingOldSpec, newSpec: narrowingNewSpec } = formatNarrowingScenario;
        const narrowingReport = analyzeOpenApiDiff(narrowingOldSpec, narrowingNewSpec);

        assert.ok(narrowingReport.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/count') && change.severity === 'breaking'));
    });

    test('detects success response payload schema changes', () => {
        const { oldSpec, newSpec } = successResponsePayloadChangesScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.changes.some(change => change.type === 'operation.response.success.type.changed' && change.severity === 'non-breaking'));
        assert.ok(report.changes.some(change => change.type === 'operation.response.success.added'));
    });

    test('returns stable and deduplicated changes ordering', () => {
        const { oldSpec, newSpec } = stableDedupOrderingScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);
        const keys = report.changes.map(change => `${change.path}|${change.type}|${change.severity}|${change.message}`);
        const sortedKeys = [...keys].sort((left, right) => left.localeCompare(right));
        const uniqueSize = new Set(keys).size;

        assert.deepStrictEqual(keys, sortedKeys);
        assert.equal(keys.length, uniqueSize);
    });

    test('builds semver recommendation matrix (major/minor/patch)', () => {
        const majorReport = analyzeOpenApiDiff(semverMajorScenario.oldSpec, semverMajorScenario.newSpec);
        assert.strictEqual(majorReport.recommendation.semver, 'major');
        assert.ok(majorReport.recommendation.reasons.includes('HAS_BREAKING_CHANGES'));

        const minorReport = analyzeOpenApiDiff(semverMinorScenario.oldSpec, semverMinorScenario.newSpec);
        assert.strictEqual(minorReport.recommendation.semver, 'minor');
        assert.ok(minorReport.recommendation.reasons.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));

        const patchReport = analyzeOpenApiDiff(semverPatchScenario.oldSpec, semverPatchScenario.newSpec);
        assert.strictEqual(patchReport.recommendation.semver, 'patch');
        assert.ok(patchReport.recommendation.reasons.includes('NO_API_SURFACE_CHANGES'));
    });

    test('builds governance violations and supports allowBreaking override', () => {
        const { oldSpec, newSpec } = governanceBreakingScenario;

        const strictGovernanceReport = analyzeOpenApiDiff(oldSpec, newSpec);
        assert.ok(strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX'));
        assert.ok(strictGovernanceReport.governance.summary.errors > 0);

        const allowedBreakingReport = analyzeOpenApiDiff(oldSpec, newSpec, { allowBreaking: true });
        assert.ok(!allowedBreakingReport.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
    });

    test('applies governance config overrides in semantic diff report', () => {
        const { oldSpec, newSpec } = governanceBreakingScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec, {
            governanceConfig: {
                rules: {
                    REQUIRE_OPERATION_ID: {
                        enabled: false,
                    },
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'error',
                    },
                },
            },
        });

        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(report.governance.violations.some(violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX' && violation.severity === 'error'));
    });

    test('detects security scheme removals, additions, and type changes', () => {
        const { oldSpec, newSpec } = securitySchemeChangesScenario;
        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.changes.some(change => change.type === 'security.scheme.removed' && change.path.includes('apiKeyAuth')));
        assert.ok(report.changes.some(change => change.type === 'security.scheme.added' && change.path.includes('oauth2Auth')));
        assert.ok(report.changes.some(change => change.type === 'security.scheme.type.changed' && change.severity === 'breaking'));
    });

    test('classifies info.version major bump as breaking', () => {
        const majorReport = analyzeOpenApiDiff(infoVersionMajorScenario.oldSpec, infoVersionMajorScenario.newSpec);
        const majorChange = majorReport.changes.find(change => change.type === 'spec.info.version.changed');
        assert.ok(majorChange);
        assert.strictEqual(majorChange?.severity, 'breaking');
        assert.strictEqual(majorChange?.from, '1.0.0');
        assert.strictEqual(majorChange?.to, '2.0.0');

        const minorReport = analyzeOpenApiDiff(infoVersionMinorScenario.oldSpec, infoVersionMinorScenario.newSpec);
        assert.ok(!minorReport.changes.some(change => change.type === 'spec.info.version.changed'));
    });
});
