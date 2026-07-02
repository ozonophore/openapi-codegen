import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { AnomalyDetector } from '../AnomalyDetector';

describe('@unit: AnomalyDetector', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('detects circular schema references', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    NodeA: { $ref: '#/components/schemas/NodeB' },
                    NodeB: { $ref: '#/components/schemas/NodeA' },
                },
            },
        };

        const report = new AnomalyDetector().detectAndReport(spec as any, { enabled: true, severity: 'low' });
        const circular = report.anomalies.find(anomaly => anomaly.type === 'circular-references');

        assert.ok(circular);
        assert.ok(circular!.affectedPaths?.some(path => path.includes('NodeA')));
    });

    test('detects deeply nested schemas above configured depth', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    Deep: {
                        type: 'object',
                        properties: {
                            level1: {
                                type: 'object',
                                properties: {
                                    level2: {
                                        type: 'object',
                                        properties: {
                                            level3: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const report = new AnomalyDetector().detectAndReport(spec as any, {
            enabled: true,
            severity: 'low',
            maxNestingDepth: 1,
        });
        const deep = report.anomalies.find(anomaly => anomaly.type === 'deeply-nested-objects');

        assert.ok(deep);
        assert.ok(deep!.affectedPaths?.some(item => item.includes('Deep')));
    });

    test('detects inconsistent success response types within a resource group', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {
                '/pets': {
                    get: {
                        responses: {
                            '200': {
                                content: {
                                    'application/json': {
                                        schema: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                },
                '/pets/summary': {
                    get: {
                        responses: {
                            '200': {
                                content: {
                                    'application/json': {
                                        schema: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: { schemas: {} },
        };

        const report = new AnomalyDetector().detectAndReport(spec as any, { enabled: true, severity: 'low' });
        const inconsistent = report.anomalies.find(anomaly => anomaly.type === 'inconsistent-response-types');

        assert.ok(inconsistent);
        assert.ok(inconsistent!.affectedPaths?.length);
    });

    test('detects schema property type inconsistencies across schemas', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                    Pet: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                        },
                    },
                },
            },
        };

        const report = new AnomalyDetector().detectAndReport(spec as any, { enabled: true, severity: 'low' });
        const inconsistent = report.anomalies.find(anomaly => anomaly.type === 'schema-inconsistencies');

        assert.ok(inconsistent);
        assert.ok(inconsistent!.affectedPaths?.some(path => path.includes('id')));
    });
});
