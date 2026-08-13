import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { SemanticDiffChange } from '../../semanticDiff/analyzeOpenApiDiff';
import { buildMiraclesFromSemanticChanges, parseSchemaPropertyPointer } from '../buildMiraclesFromSemanticChanges';

describe('@unit: buildMiraclesFromSemanticChanges', () => {
    test('parses schema property pointer', () => {
        const parsed = parseSchemaPropertyPointer('#/components/schemas/User/properties/first_name');
        assert.ok(parsed);
        assert.strictEqual(parsed.schemaName, 'User');
        assert.strictEqual(parsed.propertyName, 'first_name');
        assert.strictEqual(parsed.jsonPath, '$.components.schemas.User.properties.first_name');
    });

    test('creates RENAME miracle between removed and added property', () => {
        const changes: SemanticDiffChange[] = [
            {
                type: 'model.property.removed',
                severity: 'breaking',
                path: '#/components/schemas/User/properties/first_name',
                message: 'removed',
                from: { type: 'string' },
            },
            {
                type: 'model.property.added',
                severity: 'non-breaking',
                path: '#/components/schemas/User/properties/firstName',
                message: 'added',
                to: { type: 'string' },
            },
        ];

        const miracles = buildMiraclesFromSemanticChanges(changes);
        assert.strictEqual(miracles.length, 1);
        assert.strictEqual(miracles[0].type, 'RENAME');
        assert.strictEqual(miracles[0].oldPath, '$.components.schemas.User.properties.first_name');
        assert.strictEqual(miracles[0].newPath, '$.components.schemas.User.properties.firstName');
        assert.ok(miracles[0].confidence >= 0.8);
    });

    test('creates TYPE_COERCION miracle for scalar type changes', () => {
        const changes: SemanticDiffChange[] = [
            {
                type: 'model.property.type.changed',
                severity: 'breaking',
                path: '#/components/schemas/User/properties/age',
                message: 'type changed',
                from: 'string',
                to: 'integer',
            },
        ];

        const miracles = buildMiraclesFromSemanticChanges(changes);
        assert.strictEqual(miracles.length, 1);
        assert.strictEqual(miracles[0].type, 'TYPE_COERCION');
        assert.strictEqual(miracles[0].oldPath, '$.components.schemas.User.properties.age');
    });

    test('returns empty list when rename candidates do not match', () => {
        const changes: SemanticDiffChange[] = [
            {
                type: 'model.property.removed',
                severity: 'breaking',
                path: '#/components/schemas/User/properties/id',
                message: 'removed',
                from: { type: 'string' },
            },
            {
                type: 'model.property.added',
                severity: 'non-breaking',
                path: '#/components/schemas/Account/properties/accountId',
                message: 'added',
                to: { type: 'string' },
            },
        ];

        const miracles = buildMiraclesFromSemanticChanges(changes);
        assert.deepStrictEqual(miracles, []);
    });
});
