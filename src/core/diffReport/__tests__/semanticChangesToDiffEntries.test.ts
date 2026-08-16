import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { SemanticDiffChange } from '../../semanticDiff/analyzeOpenApiDiff';
import { semanticChangesToDiffEntries, semanticChangeToJsonPath, semanticChangeTypeToAction, semanticSeverityToDiffSeverity } from '../semanticChangesToDiffEntries';

describe('@unit: semanticChangesToDiffEntries', () => {
    test('maps property type change to legacy diff entry', () => {
        const change: SemanticDiffChange = {
            type: 'model.property.type.changed',
            severity: 'breaking',
            path: '#/components/schemas/User/properties/age',
            message: 'Property "age" type changed',
            from: 'string',
            to: 'integer',
        };

        const [entry] = semanticChangesToDiffEntries([change]);
        assert.strictEqual(entry.action, 'changed');
        assert.strictEqual(entry.severity, 'breaking');
        assert.strictEqual(entry.path, '$.components.schemas.User.properties.age.type');
        assert.strictEqual(entry.from, 'string');
        assert.strictEqual(entry.to, 'integer');
        assert.strictEqual(entry.note, change.message);
    });

    test('maps operation removed with metadata payload', () => {
        const change: SemanticDiffChange = {
            type: 'operation.removed',
            severity: 'breaking',
            path: '#/paths/GET /pets',
            message: 'Operation removed',
            from: {
                operationId: 'listPets',
                summary: 'List pets',
                tags: ['pets'],
            },
        };

        const [entry] = semanticChangesToDiffEntries([change]);
        assert.strictEqual(entry.action, 'removed');
        assert.strictEqual(entry.path, "$.paths['/pets'].get");
        assert.deepStrictEqual(entry.from, change.from);
    });

    test('maps required flag change via fromRequired/toRequired', () => {
        const change: SemanticDiffChange = {
            type: 'model.property.required.changed',
            severity: 'breaking',
            path: '#/components/schemas/User/required/email',
            message: 'required changed',
            fromRequired: false,
            toRequired: true,
        };

        const [entry] = semanticChangesToDiffEntries([change]);
        assert.strictEqual(entry.action, 'changed');
        assert.strictEqual(entry.from, false);
        assert.strictEqual(entry.to, true);
    });

    test('exposes semantic mapping helpers', () => {
        assert.strictEqual(semanticChangeTypeToAction('model.property.removed'), 'removed');
        assert.strictEqual(semanticSeverityToDiffSeverity('non-breaking'), 'warning');
        assert.strictEqual(
            semanticChangeToJsonPath({
                type: 'model.property.type.changed',
                severity: 'breaking',
                path: '#/components/schemas/User/properties/age',
                message: 'type',
            }),
            '$.components.schemas.User.properties.age.type'
        );
    });
});
