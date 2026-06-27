import assert from 'node:assert';
import { describe, test } from 'node:test';

import { unifiedItemSchemaV6 } from '../UnifiedOptionsSchemaV6';

describe('@unit: unifiedItemSchemaV6', () => {
    test('accepts per-item Marauder overrides', () => {
        const parsed = unifiedItemSchemaV6.safeParse({
            input: './spec.json',
            output: './generated',
            anomalyDetection: { enabled: true, failOnAnomalies: true },
            anomalyExploitation: { enabled: true, strategy: 'balanced' },
        });

        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.anomalyDetection?.enabled, true);
            assert.strictEqual(parsed.data.anomalyDetection?.failOnAnomalies, true);
            assert.strictEqual(parsed.data.anomalyExploitation?.enabled, true);
        }
    });
});
