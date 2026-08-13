import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { SemanticDiffChange } from '../../../semanticDiff/analyzeOpenApiDiff';
import { adaptSemanticToStructural } from '../semanticToStructural';

describe('@unit: semanticToStructural adapter', () => {
    test('groups semantic changes by legacy severity and calculates stats', () => {
        const changes: SemanticDiffChange[] = [
            {
                type: 'model.property.removed',
                severity: 'breaking',
                path: '#/components/schemas/User/properties/oldName',
                message: 'removed',
                from: { type: 'string' },
            },
            {
                type: 'model.property.added',
                severity: 'non-breaking',
                path: '#/components/schemas/User/properties/newName',
                message: 'added',
                to: { type: 'string' },
            },
            {
                type: 'model.property.type.changed',
                severity: 'informational',
                path: '#/components/schemas/User/properties/age',
                message: 'type changed',
                from: 'integer',
                to: 'integer:int64',
            },
        ];

        const structural = adaptSemanticToStructural({ changes }, 2);

        assert.strictEqual(structural.diff.all.length, 3);
        assert.strictEqual(structural.diff.breaking.length, 1);
        assert.strictEqual(structural.diff.warnings.length, 1);
        assert.strictEqual(structural.diff.info.length, 1);
        assert.strictEqual(structural.stats.totalChanges, 3);
        assert.strictEqual(structural.stats.added, 1);
        assert.strictEqual(structural.stats.removed, 1);
        assert.strictEqual(structural.stats.changed, 1);
        assert.strictEqual(structural.stats.ignored, 2);
        assert.strictEqual(structural.stats.stabilityScore, 67);
    });

    test('uses provided miracles instead of rebuilding them', () => {
        const structural = adaptSemanticToStructural({
            changes: [],
            miracles: [
                {
                    oldPath: '$.old',
                    newPath: '$.new',
                    type: 'RENAME',
                    confidence: 1,
                    status: 'confirmed',
                },
            ],
        });

        assert.strictEqual(structural.miracles.length, 1);
        assert.strictEqual(structural.miracles[0].status, 'confirmed');
    });
});
