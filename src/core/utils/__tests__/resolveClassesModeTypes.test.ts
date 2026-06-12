import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Client } from '../../types/shared/Client.model';
import type { OperationResponse } from '../../types/shared/OperationResponse.model';
import type { Service } from '../../types/shared/Service.model';
import { prepareDtoModels } from '../prepareDtoModels';
import { resolveClassesModeTypes } from '../resolveClassesModeTypes';

const createArrayResult = (itemBase: string, itemPath: string): OperationResponse => ({
    in: 'response',
    name: '',
    alias: '',
    path: '',
    code: 200,
    description: null,
    export: 'array',
    type: itemBase,
    base: itemBase,
    template: null,
    link: null,
    isDefinition: false,
    isReadOnly: false,
    isRequired: false,
    isNullable: false,
    imports: [{ name: itemBase, alias: '', path: `./${itemPath}` }],
    enum: [],
    enums: [],
    properties: [],
});

describe('@unit: resolveClassesModeTypes', () => {
    test('resolves array result types and imports to aliased export names', () => {
        const ingredientCanonical = {
            name: 'IIngredient',
            alias: '',
            path: 'components/schemas-v2/Ingredient',
            export: 'interface' as const,
            type: 'IIngredient',
            base: 'IIngredient',
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
        };
        const ingredient = {
            name: 'IIngredient',
            alias: 'IIngredient$2',
            path: 'components/schemas/Ingredient',
            export: 'interface' as const,
            type: 'IIngredient',
            base: 'IIngredient',
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
        };

        const service: Service = {
            name: 'IngredientsService',
            originName: 'Ingredients',
            imports: [{ name: 'IIngredient', alias: '', path: './components/schemas/Ingredient' }],
            operations: [
                {
                    service: 'IngredientsService',
                    name: 'listSequenceIngredients',
                    summary: null,
                    description: null,
                    deprecated: false,
                    method: 'GET',
                    path: '/sequences/{sequenceId}/ingredients',
                    parameters: [],
                    parametersPath: [],
                    parametersQuery: [],
                    parametersForm: [],
                    parametersHeader: [],
                    parametersCookie: [],
                    parametersBody: null,
                    imports: [],
                    errors: [],
                    results: [createArrayResult('IIngredient', 'components/schemas/Ingredient')],
                    responseHeader: null,
                    responseType: null,
                },
            ],
        };

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [ingredientCanonical, ingredient],
            services: [service],
        };

        const prepared = resolveClassesModeTypes(prepareDtoModels(client));
        const operation = prepared.services[0]?.operations[0];

        assert.strictEqual(prepared.services[0]?.imports[0].name, 'IIngredient$2');
        assert.strictEqual(operation?.results[0].base, 'IIngredient$2');
        assert.strictEqual(operation?.results[0].type, 'IIngredient$2');
    });
});
