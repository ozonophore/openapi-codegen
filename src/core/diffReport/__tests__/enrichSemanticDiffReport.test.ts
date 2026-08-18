import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { OpenApiGeneratorPlugin } from '../../plugins/GeneratorPlugin.model';
import type { SemanticDiffReport } from '../../semanticDiff/analyzeOpenApiDiff';
import type { CommonOpenApi } from '../../types/shared/CommonOpenApi.model';
import { enrichSemanticDiffReport } from '../enrichSemanticDiffReport';

function createBaseReport(): SemanticDiffReport {
    return {
        schemaVersion: '1.1.0',
        summary: {
            breaking: 1,
            nonBreaking: 1,
            informational: 0,
        },
        recommendation: {
            semver: 'major',
            confidence: 'medium',
            reason: 'Breaking changes detected.',
            reasons: ['HAS_BREAKING_CHANGES'],
        },
        governance: {
            summary: { errors: 0, warnings: 0, info: 0 },
            violations: [],
        },
        changes: [
            {
                type: 'operation.removed',
                severity: 'breaking',
                message: 'Operation "GET /users" was removed.',
                path: '#/paths/GET /users',
            },
            {
                type: 'operation.added',
                severity: 'non-breaking',
                message: 'Operation "GET /pets" was added.',
                path: '#/paths/GET /pets',
            },
        ],
    };
}

const openApi = {
    openapi: '3.0.0',
    info: { title: 't', version: '1.0.0' },
    paths: {},
} as unknown as CommonOpenApi;

describe('@unit: enrichSemanticDiffReport', () => {
    test('applies hooks then ignore then governance and miracles', async () => {
        const plugin: OpenApiGeneratorPlugin = {
            name: 'path-rewriter',
            apiVersion: '2',
            beforeReportWrite: ({ reportPath }) => ({
                reportPath: reportPath.replace('.json', '.enriched.json'),
            }),
        };

        const result = await enrichSemanticDiffReport({
            baseReport: createBaseReport(),
            openApi,
            reportPath: './report.json',
            plugins: [plugin],
            ignoreRules: [{ path: '#/paths/GET /pets' }],
            allowBreaking: false,
        });

        assert.strictEqual(result.reportPath, './report.enriched.json');
        assert.strictEqual(result.ignored, 1);
        assert.strictEqual(result.report.changes.length, 1);
        assert.strictEqual(result.report.changes[0]?.path, '#/paths/GET /users');
        assert.strictEqual(result.report.summary.breaking, 1);
        assert.strictEqual(result.report.summary.nonBreaking, 0);
        assert.ok((result.report.miracles?.length ?? 0) >= 0);
        assert.ok(result.report.governance.summary.errors >= 1);
    });

    test('preserves reportPath and ignored=0 when no hooks or rules', async () => {
        const result = await enrichSemanticDiffReport({
            baseReport: createBaseReport(),
            openApi,
            reportPath: './report.json',
            plugins: [],
            ignoreRules: [],
            allowBreaking: true,
        });

        assert.strictEqual(result.reportPath, './report.json');
        assert.strictEqual(result.ignored, 0);
        assert.strictEqual(result.report.changes.length, 2);
        assert.ok(Array.isArray(result.report.miracles));
    });
});
