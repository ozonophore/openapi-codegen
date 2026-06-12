import assert from 'node:assert';
import { describe, test } from 'node:test';

import { mergeMarauderBlock, mergeMarauderBlockDeep } from '../mergeMarauderBlock';

describe('@unit: mergeMarauderBlock', () => {
    test('returns base when override is undefined', () => {
        const base = { severity: 'high' };
        assert.deepStrictEqual(mergeMarauderBlock(base), base);
    });

    test('shallow merge preserves sibling keys when override sets one field', () => {
        assert.deepStrictEqual(mergeMarauderBlock({ severity: 'high', enabled: true }, { enabled: false }), { severity: 'high', enabled: false });
    });
});

describe('@unit: mergeMarauderBlockDeep', () => {
    test('preserves base severity when override sets excludeCategories only', () => {
        assert.deepStrictEqual(mergeMarauderBlockDeep({ enabled: true, severity: 'high', excludeCategories: ['missing-pagination'] }, { excludeCategories: ['deprecated-endpoints'] }), {
            enabled: true,
            severity: 'high',
            excludeCategories: ['deprecated-endpoints'],
        });
    });

    test('concatenates detectionRules when both sides provide arrays', () => {
        const baseRule = { name: 'base' };
        const overrideRule = { name: 'override' };

        assert.deepStrictEqual(mergeMarauderBlockDeep({ detectionRules: [baseRule] }, { detectionRules: [overrideRule] }), { detectionRules: [baseRule, overrideRule] });
    });

    test('uses override detectionRules when base has none', () => {
        const rule = { name: 'cli' };
        assert.deepStrictEqual(mergeMarauderBlockDeep({}, { detectionRules: [rule] }), { detectionRules: [rule] });
    });
});
