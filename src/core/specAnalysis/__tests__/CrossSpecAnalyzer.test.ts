import assert from 'node:assert';
import { describe, test } from 'node:test';

import { hashSchema } from '../../reuseStore/ArtifactFingerprinter';
import { buildManifestFromParsedSpecs, runCrossSpecAnalysis } from '../CrossSpecAnalyzer';
import { SpecFindingCategoryEnum } from '../types';

describe('@unit: CrossSpecAnalyzer', () => {
    test('reports cross-spec name hash conflict across three specs', () => {
        const userSchemaA = { type: 'object', properties: { id: { type: 'string' } } };
        const userSchemaB = { type: 'object', properties: { id: { type: 'integer' } } };
        const paginationSchema = { type: 'object', properties: { page: { type: 'integer' } } };

        const manifest = buildManifestFromParsedSpecs(
            [
                { specItem: 'lom_api', schemas: { User: userSchemaA, Pagination: paginationSchema } },
                { specItem: 'billing_api', schemas: { User: userSchemaB } },
                { specItem: 'admin_api', schemas: { Pagination: paginationSchema } },
            ],
            hashSchema
        );

        const items = [
            { name: 'lom_api', input: './lom.yaml', outputModels: './src/models', outputSchemas: './src/schemas' },
            { name: 'billing_api', input: './billing.yaml', outputModels: './src/models', outputSchemas: './src/schemas' },
            { name: 'admin_api', input: './admin.yaml', outputModels: './src/other-models', outputSchemas: './src/other-schemas' },
        ];

        const findings = runCrossSpecAnalysis(manifest, items);
        const conflict = findings.find(finding => finding.category === SpecFindingCategoryEnum.CrossSpecNameHashConflict);
        const reuse = findings.find(finding => finding.category === SpecFindingCategoryEnum.CrossSpecReuseOpportunity);
        const outputCollision = findings.find(finding => finding.category === SpecFindingCategoryEnum.SharedOutputCollisionRisk);

        assert.ok(conflict);
        assert.ok(conflict!.description.includes('User'));
        assert.ok(reuse);
        assert.ok(reuse!.description.includes('Pagination'));
        assert.ok(outputCollision);
        assert.ok(outputCollision!.description.includes('./src/models'));
    });
});
