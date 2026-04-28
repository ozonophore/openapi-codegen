import assert from 'node:assert';
import { describe, test } from 'node:test';

import { SemanticDiffReport } from '../../semanticDiff/analyzeOpenApiDiff';
import { applySemanticDiffPluginHooks } from '../applySemanticDiffPluginHooks';
import { OpenApiGeneratorPlugin } from '../GeneratorPlugin.model';

function createBaseReport(): SemanticDiffReport {
    return {
        schemaVersion: '1.1.0',
        summary: {
            breaking: 1,
            nonBreaking: 0,
            informational: 0,
        },
        recommendation: {
            semver: 'major',
            confidence: 'medium',
            reason: 'Breaking changes detected.',
            reasons: ['HAS_BREAKING_CHANGES'],
        },
        governance: {
            summary: {
                errors: 1,
                warnings: 0,
                info: 0,
            },
            violations: [
                {
                    ruleId: 'NO_BREAKING_WITHOUT_FLAG',
                    severity: 'error',
                    message: 'breaking changes found',
                    path: '#/paths/GET /users',
                },
            ],
        },
        changes: [
            {
                type: 'operation.removed',
                severity: 'breaking',
                message: 'Operation "GET /users" was removed.',
                path: '#/paths/GET /users',
            },
        ],
    };
}

describe('@unit: applySemanticDiffPluginHooks', () => {
    test('applies v2 hooks in deterministic order', async () => {
        const pluginA: OpenApiGeneratorPlugin = {
            name: 'plugin-a',
            apiVersion: '2',
            afterSemanticDiff: ({ report }) => ({
                ...report,
                summary: {
                    ...report.summary,
                    informational: 1,
                },
            }),
            mapRecommendation: ({ recommendation }) => ({
                ...recommendation,
                confidence: 'high',
            }),
            beforeReportWrite: ({ reportPath }) => ({
                reportPath: reportPath.replace('.json', '.v2.json'),
            }),
        };

        const result = await applySemanticDiffPluginHooks({
            report: createBaseReport(),
            reportPath: './report.json',
            plugins: [pluginA],
            allowBreaking: false,
            strictPluginMode: false,
        });

        assert.strictEqual(result.report.summary.informational, 1);
        assert.strictEqual(result.report.recommendation.confidence, 'high');
        assert.strictEqual(result.reportPath, './report.v2.json');
        assert.ok(result.diagnostics.length >= 3);
        assert.ok(result.diagnostics.every(item => item.status === 'applied'));
    });

    test('non-strict mode keeps working when plugin hook fails', async () => {
        const faultyPlugin: OpenApiGeneratorPlugin = {
            name: 'faulty-plugin',
            apiVersion: '2',
            afterSemanticDiff: () => {
                throw new Error('boom');
            },
        };

        const result = await applySemanticDiffPluginHooks({
            report: createBaseReport(),
            reportPath: './report.json',
            plugins: [faultyPlugin],
            allowBreaking: false,
            strictPluginMode: false,
        });

        assert.strictEqual(result.reportPath, './report.json');
        assert.ok(result.diagnostics.some(item => item.pluginName === 'faulty-plugin' && item.status === 'failed'));
    });

    test('strict mode throws when plugin hook fails', async () => {
        const faultyPlugin: OpenApiGeneratorPlugin = {
            name: 'faulty-plugin',
            apiVersion: '2',
            mapRecommendation: () => {
                throw new Error('map failed');
            },
        };

        await assert.rejects(
            async () =>
                applySemanticDiffPluginHooks({
                    report: createBaseReport(),
                    reportPath: './report.json',
                    plugins: [faultyPlugin],
                    allowBreaking: false,
                    strictPluginMode: true,
                }),
            (error: unknown) => error instanceof Error && error.message.includes('faulty-plugin')
        );
    });
});
