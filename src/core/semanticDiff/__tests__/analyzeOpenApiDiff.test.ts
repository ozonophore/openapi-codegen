import assert from 'node:assert';
import { describe, test } from 'node:test';

import { analyzeOpenApiDiff } from '../analyzeOpenApiDiff';

describe('@unit: analyzeOpenApiDiff', () => {
    test('detects breaking model and operation removals', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {
                '/pets': {
                    get: {
                        responses: {
                            '200': { description: 'ok' },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Pet: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                        required: ['id'],
                    },
                },
            },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {},
            },
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.strictEqual(report.schemaVersion, '1.1.0');
        assert.ok(report.summary.breaking >= 2);
        assert.ok(report.changes.some(change => change.type === 'model.removed'));
        assert.ok(report.changes.some(change => change.type === 'operation.removed'));
    });

    test('detects property required/type changes and enum changes', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'number' },
                            role: { enum: ['user', 'admin'] },
                        },
                        required: ['age'],
                    },
                },
            },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'integer' },
                            role: { enum: ['admin'] },
                        },
                        required: [],
                    },
                },
            },
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.severity === 'breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.required.changed' && change.severity === 'non-breaking'));
        assert.ok(report.changes.some(change => change.type === 'model.property.type.changed' && change.path.includes('/role')));
    });

    test('detects non-breaking additions', () => {
        const oldSpec = {
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
            components: {
                schemas: {
                    Ping: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                        },
                    },
                },
            },
        } as any;

        const newSpec = {
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
                '/pong': {
                    get: {
                        responses: {
                            '200': { description: 'ok' },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Ping: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                            meta: { type: 'string' },
                        },
                    },
                    Pong: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                        },
                    },
                },
            },
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(report.summary.nonBreaking >= 3);
        assert.ok(report.changes.some(change => change.type === 'model.added'));
        assert.ok(report.changes.some(change => change.type === 'operation.added'));
        assert.ok(report.changes.some(change => change.type === 'operation.response.success.added'));
    });

    test('classifies widening and narrowing transitions for enum/number and union', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    Account: {
                        type: 'object',
                        properties: {
                            tier: { enum: ['basic', 'pro'] },
                            score: { type: 'integer' },
                            state: { oneOf: [{ type: 'string' }, { type: 'number' }] },
                        },
                    },
                },
            },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    Account: {
                        type: 'object',
                        properties: {
                            tier: { enum: ['basic', 'pro', 'enterprise'] },
                            score: { type: 'number' },
                            state: { oneOf: [{ type: 'string' }] },
                        },
                    },
                },
            },
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(
            report.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/tier') &&
                    change.severity === 'non-breaking'
            )
        );
        assert.ok(
            report.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/score') &&
                    change.severity === 'non-breaking'
            )
        );
        assert.ok(
            report.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/state') &&
                    change.severity === 'breaking'
            )
        );
    });

    test('treats different refs and narrowing formats as breaking, widening formats as non-breaking', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            profile: { $ref: '#/components/schemas/ProfileV1' },
                            count: { type: 'integer', format: 'int32' },
                            ratio: { type: 'number', format: 'float' },
                        },
                    },
                    ProfileV1: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                    ProfileV2: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                },
            },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            profile: { $ref: '#/components/schemas/ProfileV2' },
                            count: { type: 'integer', format: 'int64' },
                            ratio: { type: 'number', format: 'double' },
                        },
                    },
                    ProfileV1: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                    ProfileV2: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                },
            },
        } as any;

        const wideningReport = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(
            wideningReport.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/profile') &&
                    change.severity === 'breaking'
            )
        );
        assert.ok(
            wideningReport.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/count') &&
                    change.severity === 'non-breaking'
            )
        );
        assert.ok(
            wideningReport.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/ratio') &&
                    change.severity === 'non-breaking'
            )
        );

        const narrowingReport = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {},
                components: {
                    schemas: {
                        User: {
                            type: 'object',
                            properties: {
                                count: { type: 'integer', format: 'int64' },
                            },
                        },
                    },
                },
            } as any,
            {
                openapi: '3.0.0',
                paths: {},
                components: {
                    schemas: {
                        User: {
                            type: 'object',
                            properties: {
                                count: { type: 'integer', format: 'int32' },
                            },
                        },
                    },
                },
            } as any
        );

        assert.ok(
            narrowingReport.changes.some(
                change =>
                    change.type === 'model.property.type.changed' &&
                    change.path.includes('/count') &&
                    change.severity === 'breaking'
            )
        );
    });

    test('detects success response payload schema changes', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {
                '/users/{id}': {
                    get: {
                        responses: {
                            '200': {
                                description: 'ok',
                                content: {
                                    'application/json': {
                                        schema: { type: 'integer' },
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
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {
                '/users/{id}': {
                    get: {
                        responses: {
                            '200': {
                                description: 'ok',
                                content: {
                                    'application/json': {
                                        schema: { type: 'number' },
                                    },
                                },
                            },
                            '201': {
                                description: 'created',
                                content: {
                                    'application/json': {
                                        schema: { type: 'string' },
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
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);

        assert.ok(
            report.changes.some(
                change => change.type === 'operation.response.success.type.changed' && change.severity === 'non-breaking'
            )
        );
        assert.ok(report.changes.some(change => change.type === 'operation.response.success.added'));
    });

    test('returns stable and deduplicated changes ordering', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {
                '/z': {
                    get: {
                        responses: {
                            '200': { description: 'ok' },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Zeta: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                        },
                    },
                    Alpha: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                        },
                    },
                },
            },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {},
            },
        } as any;

        const report = analyzeOpenApiDiff(oldSpec, newSpec);
        const keys = report.changes.map(change => `${change.path}|${change.type}|${change.severity}|${change.message}`);
        const sortedKeys = [...keys].sort((left, right) => left.localeCompare(right));
        const uniqueSize = new Set(keys).size;

        assert.deepStrictEqual(keys, sortedKeys);
        assert.equal(keys.length, uniqueSize);
    });

    test('builds semver recommendation matrix (major/minor/patch)', () => {
        const majorReport = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {
                    '/users': {
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
                paths: {},
                components: { schemas: {} },
            } as any
        );
        assert.strictEqual(majorReport.recommendation.semver, 'major');
        assert.ok(majorReport.recommendation.reasons.includes('HAS_BREAKING_CHANGES'));

        const minorReport = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {},
                components: { schemas: {} },
            } as any,
            {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
                components: { schemas: {} },
            } as any
        );
        assert.strictEqual(minorReport.recommendation.semver, 'minor');
        assert.ok(minorReport.recommendation.reasons.includes('HAS_BACKWARD_COMPATIBLE_CHANGES'));

        const patchReport = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {
                    '/users': {
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
                    '/users': {
                        get: {
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
                components: { schemas: {} },
            } as any
        );
        assert.strictEqual(patchReport.recommendation.semver, 'patch');
        assert.ok(patchReport.recommendation.reasons.includes('NO_API_SURFACE_CHANGES'));
    });

    test('builds governance violations and supports allowBreaking override', () => {
        const oldSpec = {
            openapi: '3.0.0',
            paths: {
                '/users': {
                    get: {
                        operationId: 'getUsers',
                        responses: {
                            '200': { description: 'ok' },
                        },
                    },
                },
            },
            components: { schemas: {} },
        } as any;

        const newSpec = {
            openapi: '3.0.0',
            paths: {
                '/users': {
                    get: {
                        responses: {
                            default: { description: 'fallback' },
                        },
                    },
                },
            },
            components: { schemas: {} },
        } as any;

        const strictGovernanceReport = analyzeOpenApiDiff(oldSpec, newSpec);
        assert.ok(
            strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG')
        );
        assert.ok(
            strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID')
        );
        assert.ok(
            strictGovernanceReport.governance.violations.some(violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX')
        );
        assert.ok(strictGovernanceReport.governance.summary.errors > 0);

        const allowedBreakingReport = analyzeOpenApiDiff(oldSpec, newSpec, { allowBreaking: true });
        assert.ok(
            !allowedBreakingReport.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG')
        );
    });

    test('applies governance config overrides in semantic diff report', () => {
        const report = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            operationId: 'getUsers',
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
                    '/users': {
                        get: {
                            responses: {
                                default: { description: 'fallback' },
                            },
                        },
                    },
                },
                components: { schemas: {} },
            } as any,
            {
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
            }
        );

        assert.ok(!report.governance.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(
            report.governance.violations.some(
                violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX' && violation.severity === 'error'
            )
        );
    });
});
