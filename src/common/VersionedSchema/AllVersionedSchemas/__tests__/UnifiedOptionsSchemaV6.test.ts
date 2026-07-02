import assert from 'node:assert';
import { describe, test } from 'node:test';

import { unifiedItemSchemaV6 } from '../UnifiedOptionsSchemaV6';

describe('@unit: unifiedItemSchemaV6', () => {
    test('accepts per-item Marauder overrides', () => {
        const parsed = unifiedItemSchemaV6.safeParse({
            input: './spec.json',
            output: './generated',
            specAnalysis: { enabled: true, failOnHigh: true },
            anomalyDetection: { enabled: true, failOnAnomalies: true },
        });

        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.specAnalysis?.enabled, true);
            assert.strictEqual(parsed.data.specAnalysis?.failOnHigh, true);
            assert.strictEqual(parsed.data.anomalyDetection?.enabled, true);
        }
    });
});
