import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { GradualMigrationPlanner } from '../GradualMigrationPlanner';

describe('@unit: GradualMigrationPlanner', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('rollbackThreshold 10 appears in canary rollbackCondition and rollbackPlan triggers', () => {
        const planner = new GradualMigrationPlanner();
        const plan = planner.planMigration('old-client', 'new-client', {
            strategy: 'canary',
            rollbackThreshold: 10,
        });

        for (const phase of plan.phases) {
            assert.match(phase.rollbackCondition ?? '', /> 10%/);
        }

        assert.ok(plan.rollbackPlan.triggers.some(trigger => trigger.includes('> 10%')));
    });

    test("checkpointFrequency '30m' appears in canary phase checkpoints", () => {
        const planner = new GradualMigrationPlanner();
        const plan = planner.planMigration('old-client', 'new-client', {
            strategy: 'canary',
            checkpointFrequency: '30m',
        });

        for (const phase of plan.phases) {
            assert.ok(phase.checkpoints?.some(checkpoint => checkpoint.includes('30m')));
        }
    });

    test('enableMetrics false clears metricsToCheck in postMigrationValidation', () => {
        const planner = new GradualMigrationPlanner();
        const plan = planner.planMigration('old-client', 'new-client', {
            enableMetrics: false,
        });

        assert.ok(plan.postMigrationValidation.length > 0);
        for (const check of plan.postMigrationValidation) {
            assert.deepEqual(check.metricsToCheck, []);
        }
    });

    test('breaking changes auto-tune canary phase count and add preflight check', () => {
        const planner = new GradualMigrationPlanner();
        const breakingChanges = [
            {
                type: 'model.property.type.changed',
                severity: 'breaking' as const,
                path: '#/components/schemas/User/properties/age',
                message: 'type changed',
            },
            {
                type: 'model.property.removed',
                severity: 'breaking' as const,
                path: '#/components/schemas/User/properties/first_name',
                message: 'removed',
            },
        ];

        const plan = planner.planMigration('old-client', 'new-client', { strategy: 'canary', phaseCount: 4 }, breakingChanges);

        assert.strictEqual(plan.strategy, 'canary');
        assert.strictEqual(plan.phases.length, 5);
        assert.ok(plan.preflightChecks.some(check => check.description.includes('Breaking changes detected: 2')));
    });

    test('breaking changes >= 3 switch to shadow strategy', () => {
        const planner = new GradualMigrationPlanner();
        const breakingChanges = Array.from({ length: 3 }, (_, index) => ({
            type: 'model.property.removed',
            severity: 'breaking' as const,
            path: `#/components/schemas/User/properties/field${index}`,
            message: `removed ${index}`,
        }));

        const plan = planner.planMigration('old-client', 'new-client', { strategy: 'canary', phaseCount: 4 }, breakingChanges);

        assert.strictEqual(plan.strategy, 'shadow');
        assert.strictEqual(plan.phases.length, 6);
    });
});
