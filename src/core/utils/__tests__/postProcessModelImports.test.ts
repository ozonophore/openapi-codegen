import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Model } from '../../types/shared/Model.model';
import { postProcessModelImports } from '../postProcessModelImports';

function createModel(overrides: Partial<Model> = {}): Model {
    return {
        name: 'ISimpleDto',
        alias: '',
        path: 'path/alias_request/SimpleDto',
        export: 'interface',
        type: 'ISimpleDto',
        base: 'ISimpleDto',
        template: null,
        link: null,
        description: null,
        isDefinition: true,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        ...overrides,
    };
}

describe('@unit: postProcessModelImports', () => {
    test('keeps same-name imports when path differs and removes only self import', () => {
        const model = createModel({
            imports: [
                { name: 'ISimpleDto', alias: 'ISimpleDto$1', path: './path/alias_response/SimpleDto' },
                { name: 'ISimpleDto', alias: 'ISimpleDto$2', path: './path/common_request/SimpleDto' },
                { name: 'ISimpleDto', alias: '', path: './SimpleDto' },
            ],
        });

        const result = postProcessModelImports(model);

        assert.deepStrictEqual(
            result.map(item => `${item.name}:${item.alias}:${item.path}`),
            [
                'ISimpleDto:ISimpleDto$1:./path/alias_response/SimpleDto',
                'ISimpleDto:ISimpleDto$2:./path/common_request/SimpleDto',
            ],
        );
    });

    test('removes self import by path even if import name differs from model name', () => {
        const model = createModel({
            name: 'IModelWithCircularReference',
            path: 'ModelWithCircularReference',
            imports: [
                { name: 'SomeOtherName', alias: '', path: './ModelWithCircularReference' },
                { name: 'IAnotherModel', alias: '', path: './AnotherModel' },
            ],
        });

        const result = postProcessModelImports(model);

        assert.deepStrictEqual(
            result.map(item => `${item.name}:${item.path}`),
            ['IAnotherModel:./AnotherModel'],
        );
    });

    test('removes self import when model path has nested directory', () => {
        const model = createModel({
            name: 'IModelWithCircularReference',
            path: 'schemas/base/ModelWithCircularReference',
            imports: [{ name: 'IModelWithCircularReference', alias: '', path: './ModelWithCircularReference' }],
        });

        const result = postProcessModelImports(model);

        assert.deepStrictEqual(result, []);
    });
});
