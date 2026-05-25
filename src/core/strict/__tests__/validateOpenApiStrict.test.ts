import assert from 'node:assert';
import { describe, test } from 'node:test';

import { validateOpenApiStrict } from '../validateOpenApiStrict';

describe('@unit: validateOpenApiStrict', () => {
    test('reports unresolved refs, fallback media type, suspicious default response, and missing operationId', () => {
        const openApi = {
            paths: {
                '/pets': {
                    post: {
                        requestBody: {
                            content: {
                                'text/plain': {
                                    schema: { type: 'string' },
                                },
                            },
                        },
                        responses: {
                            default: {
                                description: 'ok',
                                content: {
                                    'application/problem+json': {
                                        schema: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as any;

        const report = validateOpenApiStrict({
            openApi,
            context: {
                paths: () => ['/spec/main.yaml'],
                get: () => ({
                    components: {
                        schemas: {
                            Pet: {
                                $ref: '#/components/schemas/Missing',
                            },
                        },
                    },
                }),
                exists: () => false,
            },
        });

        assert.strictEqual(report.summary.errors, 1);
        assert.strictEqual(report.summary.warnings, 3);
        assert.strictEqual(report.summary.info, 1);
        assert.ok(report.issues.some(issue => issue.code === 'UNRESOLVED_REF'));
        assert.ok(report.issues.some(issue => issue.code === 'CONTENT_MEDIA_TYPE_FALLBACK'));
        assert.ok(report.issues.some(issue => issue.code === 'SUSPICIOUS_DEFAULT_RESPONSE'));
        assert.ok(report.issues.some(issue => issue.code === 'MISSING_OPERATION_ID'));
    });

    test('returns clean report when no strict issues found', () => {
        const openApi = {
            paths: {
                '/pets': {
                    get: {
                        operationId: 'getPets',
                        responses: {
                            '200': {
                                description: 'ok',
                                content: {
                                    'application/json': {
                                        schema: { type: 'array' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as any;

        const report = validateOpenApiStrict({
            openApi,
            context: {
                paths: () => ['/spec/main.yaml'],
                get: () => ({}),
                exists: () => true,
            },
        });

        assert.deepStrictEqual(report.summary, {
            errors: 0,
            warnings: 0,
            info: 0,
        });
        assert.deepStrictEqual(report.issues, []);
    });

    test('includes preIssues from parser validation into final report', () => {
        const report = validateOpenApiStrict({
            openApi: { paths: {} } as any,
            context: {
                paths: () => [],
                get: () => ({}),
                exists: () => true,
            },
            preIssues: [
                {
                    severity: 'error',
                    code: 'OPENAPI_PARSER_VALIDATION_FAILED',
                    message: 'Parser validation failed',
                    path: '/spec/openapi.yaml',
                },
            ],
        });

        assert.strictEqual(report.summary.errors, 1);
        assert.strictEqual(report.summary.warnings, 0);
        assert.strictEqual(report.summary.info, 0);
        assert.strictEqual(report.issues.length, 1);
        assert.strictEqual(report.issues[0].code, 'OPENAPI_PARSER_VALIDATION_FAILED');
    });
});
