import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Import } from '../../types/shared/Import.model';
import type { Model } from '../../types/shared/Model.model';
import type { Operation } from '../../types/shared/Operation.model';
import type { OperationParameter } from '../../types/shared/OperationParameter.model';
import type { OperationResponse } from '../../types/shared/OperationResponse.model';
import type { Service } from '../../types/shared/Service.model';
import { finalizeServiceImports } from '../serviceHelpers';

function createModel(overrides: Partial<Model> = {}): Model {
    return {
        name: 'Model',
        alias: '',
        path: 'Model',
        export: 'reference',
        type: 'Model',
        base: 'Model',
        template: null,
        link: null,
        description: null,
        isDefinition: false,
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

function createOperationParameter(overrides: Partial<OperationParameter> = {}): OperationParameter {
    return {
        ...createModel(overrides),
        in: 'query',
        prop: 'value',
        mediaType: null,
        ...overrides,
    };
}

function createOperationResponse(overrides: Partial<OperationResponse> = {}): OperationResponse {
    return {
        ...createModel(overrides),
        in: 'response',
        code: 200,
        ...overrides,
    };
}

describe('@unit: serviceHelpers', () => {
    test('finalizeServiceImports should assign duplicate aliases and propagate to params/results', () => {
        const importFooA: Import = { name: 'Foo', alias: '', path: 'models/a/Foo' };
        const importFooB: Import = { name: 'Foo', alias: '', path: 'models/b/Foo' };

        const paramFooA = createOperationParameter({
            name: 'paramFooA',
            path: './models/a/Foo',
            type: 'Foo',
            base: 'Foo',
            imports: [{ ...importFooA }],
        });
        const paramFooBArray = createOperationParameter({
            name: 'paramFooBArray',
            export: 'array',
            type: 'Foo',
            base: 'Foo',
            imports: [{ ...importFooB }],
            link: createModel({
                path: './models/b/Foo',
                type: 'Foo',
                base: 'Foo',
                imports: [{ ...importFooB }],
            }),
        });
        const resultFooB = createOperationResponse({
            name: 'resultFooB',
            path: './models/b/Foo',
            type: 'Foo',
            base: 'Foo',
            imports: [{ ...importFooB }],
        });

        const operation: Operation = {
            service: 'PetService',
            name: 'getPet',
            summary: null,
            description: null,
            deprecated: false,
            method: 'GET',
            path: '/pets/{id}',
            imports: [],
            parameters: [paramFooA, paramFooBArray],
            parametersPath: [],
            parametersQuery: [],
            parametersForm: [],
            parametersCookie: [],
            parametersHeader: [],
            parametersBody: null,
            errors: [],
            results: [resultFooB],
            responseHeader: null,
        };

        const service: Service = {
            name: 'PetService',
            originName: 'PetService',
            operations: [operation],
            imports: [importFooA, importFooB],
        };

        finalizeServiceImports(service);

        const aliasByPath = new Map(service.imports.map(item => [item.path, item.alias]));
        const aliasA = aliasByPath.get('models/a/Foo');
        const aliasB = aliasByPath.get('models/b/Foo');

        assert.ok(aliasA);
        assert.ok(aliasB);
        assert.notEqual(aliasA, aliasB);

        assert.equal(paramFooA.base, aliasA);
        assert.equal(paramFooA.type, aliasA);
        assert.equal(paramFooBArray.base, aliasB);
        assert.equal(paramFooBArray.type, aliasB);
        assert.equal(paramFooBArray.link?.base, aliasB);
        assert.equal(paramFooBArray.link?.type, aliasB);
        assert.equal(operation.results[0].base, aliasB);
        assert.equal(operation.results[0].type, aliasB);
    });
});
