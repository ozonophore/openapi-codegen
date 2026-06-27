import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { endpointAdditionScenario, removedEndpointScenario } from '../../semanticDiff/__tests__/fixtures/diffScenarios';
import { ChangeDetector } from '../ChangeDetector';

describe('@unit: ChangeDetector', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('addition is auto-applicable', () => {
        const detector = new ChangeDetector();
        const result = detector.detectChanges(endpointAdditionScenario.oldSpec, endpointAdditionScenario.newSpec);

        assert.equal(result.autoApplicable, true);
        assert.equal(result.requiresUserReview, false);
        assert.ok(result.changes.some(change => change.type === 'addition'));
    });

    test('removed endpoint is breaking and requires review', () => {
        const detector = new ChangeDetector();
        const result = detector.detectChanges(removedEndpointScenario.oldSpec, removedEndpointScenario.newSpec);

        assert.equal(result.autoApplicable, false);
        assert.equal(result.requiresUserReview, true);
        assert.ok(result.changes.some(change => change.type === 'breaking' && change.description.includes('was removed')));
    });
});
