import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { Model } from '../../types/shared/Model.model';
import { buildNamespacedModelArtifactRelativePath, buildNamespacedSchemaArtifactRelativePath } from '../reuseHelpers';

const model = {
    name: 'EEnumWithNumbers',
    path: 'EnumWithNumbers',
    export: 'enum',
    alias: 'EnumWithNumbers',
    properties: [],
    enum: [],
} as unknown as Model;

describe('@unit: namespaced reuse artifact paths', () => {
    test('includes schemaHash so same spec+options with different schemas do not collide', () => {
        const optionsHash = 'ad54fccb0b7c57249fb874959e8ad371';
        const pathA = buildNamespacedModelArtifactRelativePath(model, 'v3', optionsHash, 'f961a08442c9c5fa6f7b9cdc1708c3dd');
        const pathB = buildNamespacedModelArtifactRelativePath(model, 'v3', optionsHash, '4e98c7f5aaaaaaaaaaaaaaaaaaaaaaaa');
        assert.notEqual(pathA, pathB);
        assert.match(pathA, /EnumWithNumbers__v3__f961a084__/);
        assert.match(pathB, /EnumWithNumbers__v3__4e98c7f5__/);
    });

    test('schema namespaced paths also include schemaHash', () => {
        const optionsHash = 'ad54fccb0b7c57249fb874959e8ad371';
        const pathA = buildNamespacedSchemaArtifactRelativePath(model, 'v3', optionsHash, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        const pathB = buildNamespacedSchemaArtifactRelativePath(model, 'v3', optionsHash, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
        assert.notEqual(pathA, pathB);
        assert.match(pathA, /EnumWithNumbersSchema__v3__aaaaaaaa__/);
    });
});
