import assert from 'node:assert';
import { describe, test } from 'node:test';

import { endpointAdditionScenario, removedEndpointScenario } from '../../../semanticDiff/__tests__/fixtures/diffScenarios';
import { analyzeOpenApiDiff } from '../../../semanticDiff/analyzeOpenApiDiff';
import { adaptSemanticToChangeDetection } from '../semanticToChangeDetection';

describe('@unit: semanticToChangeDetection adapter', () => {
    test('maps breaking semantic changes to breaking SpecChange with migrationRequired', () => {
        const report = analyzeOpenApiDiff(removedEndpointScenario.oldSpec, removedEndpointScenario.newSpec);
        const result = adaptSemanticToChangeDetection(report);

        assert.equal(result.hasChanges, true);
        assert.equal(result.autoApplicable, false);
        assert.equal(result.requiresUserReview, true);
        assert.ok(result.changes.every(change => change.migrationRequired === (change.type === 'breaking')));
        assert.ok(result.changes.some(change => change.type === 'breaking' && change.path.startsWith('#/paths/')));
    });

    test('maps non-breaking additions to addition type with autoApplicable result', () => {
        const report = analyzeOpenApiDiff(endpointAdditionScenario.oldSpec, endpointAdditionScenario.newSpec);
        const result = adaptSemanticToChangeDetection(report);

        assert.equal(result.autoApplicable, true);
        assert.equal(result.requiresUserReview, false);
        assert.ok(result.changes.some(change => change.type === 'addition'));
        assert.ok(result.changes.every(change => !change.migrationRequired));
    });

    test('builds summary from semantic summary counters', () => {
        const report = analyzeOpenApiDiff(removedEndpointScenario.oldSpec, removedEndpointScenario.newSpec);
        const result = adaptSemanticToChangeDetection(report);

        assert.match(result.summary, /breaking change\(s\)/);
        assert.ok(result.suggestedActions.includes(result.summary));
    });

    test('includes top breaking change messages in suggestedActions', () => {
        const report = analyzeOpenApiDiff(removedEndpointScenario.oldSpec, removedEndpointScenario.newSpec);
        const result = adaptSemanticToChangeDetection(report);
        const breakingMessages = report.changes.filter(change => change.severity === 'breaking').map(change => change.message);

        assert.ok(breakingMessages.length > 0);
        assert.ok(result.suggestedActions.some(action => breakingMessages.includes(action)));
        assert.ok(result.suggestedActions.includes('Review all breaking changes carefully before upgrading'));
    });

    test('maps informational severity to non-breaking SpecChange type', () => {
        const report = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {},
                components: {
                    schemas: {
                        User: {
                            type: 'object',
                            properties: {
                                age: { type: 'integer', format: 'int32' },
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
                                age: { type: 'integer', format: 'int32' },
                            },
                        },
                    },
                },
            } as any
        );

        const result = adaptSemanticToChangeDetection(report);

        assert.equal(result.hasChanges, false);
        assert.equal(result.summary, 'No changes detected');
        assert.equal(result.autoApplicable, true);
    });

    test('maps non-breaking property changes without migrationRequired', () => {
        const report = analyzeOpenApiDiff(
            {
                openapi: '3.0.0',
                paths: {},
                components: {
                    schemas: {
                        User: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                            },
                            required: ['name'],
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
                                name: { type: 'string' },
                            },
                            required: [],
                        },
                    },
                },
            } as any
        );

        const result = adaptSemanticToChangeDetection(report);
        const requiredChange = result.changes.find(change => change.path.includes('/required/'));

        assert.ok(requiredChange);
        assert.equal(requiredChange.type, 'non-breaking');
        assert.equal(requiredChange.migrationRequired, false);
        assert.equal(result.autoApplicable, true);
    });
});
