import assert from 'node:assert';
import { describe, test } from 'node:test';

import { analyzeOpenApiDiff } from '../analyzeOpenApiDiff';
import { validateSemanticDiffReportSchema } from '../semanticDiffReportSchema';

describe('@unit: semanticDiffReportSchema', () => {
    test('validates report produced by analyzeOpenApiDiff', () => {
        const report = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
                components: { schemas: {} },
            } as any,
            {
                openapi: '3.0.0',
                paths: {
                    '/ping': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                                '201': { description: 'created' },
                            },
                        },
                    },
                },
                components: { schemas: {} },
            } as any
        );

        const validation = validateSemanticDiffReportSchema(report);
        assert.strictEqual(validation.valid, true, validation.errors.join('\n'));
    });

    test('rejects report without schemaVersion', () => {
        const malformedReport = {
            summary: {
                breaking: 0,
                nonBreaking: 0,
                informational: 0,
            },
            recommendation: {
                semver: 'patch',
                reason: 'No changes',
            },
            governance: {
                summary: {
                    errors: 0,
                    warnings: 0,
                    info: 0,
                },
                violations: [],
            },
            changes: [],
        };

        const validation = validateSemanticDiffReportSchema(malformedReport);
        assert.strictEqual(validation.valid, false);
        assert.ok(validation.errors.some(error => error.includes('schemaVersion')));
    });
});
