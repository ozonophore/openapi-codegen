import assert from 'node:assert';
import { describe, test } from 'node:test';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ModelsMode } from '../../types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import type { Model } from '../../types/shared/Model.model';
import { registerHandlebarTemplates } from '../registerHandlebarTemplates';

const requestContext = {
    httpClient: HttpClient.FETCH,
    server: 'https://api.example.com',
    version: '1.0.0',
    useCancelableRequest: false,
    useSeparatedIndexes: false,
};

const schemaModel: Model = {
    name: 'UserSchema',
    alias: '',
    path: 'schemas',
    export: 'interface',
    type: 'UserSchema',
    base: 'UserSchema',
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
    properties: [
        {
            name: 'id',
            alias: '',
            path: 'schemas',
            export: 'generic',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: true,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        },
    ],
};

const exportClientContext = {
    outputCore: './generated/core',
    useCustomRequest: false,
    services: [],
};

const exportModelsContext = {
    models: [schemaModel],
    httpClient: HttpClient.FETCH,
    useUnionTypes: false,
    useOptions: false,
    outputCore: '../core',
    modelsMode: ModelsMode.CLASSES,
};

describe('@unit: templateRendering', () => {
    for (const httpClient of Object.values(HttpClient)) {
        for (const useCancelableRequest of [false, true] as const) {
            test(`renders request template for ${httpClient} (cancelable=${useCancelableRequest})`, () => {
                const templates = registerHandlebarTemplates({
                    httpClient,
                    useOptions: false,
                    useUnionTypes: false,
                    validationLibrary: ValidationLibrary.NONE,
                });

                const output = templates.core.request({
                    ...requestContext,
                    httpClient,
                    useCancelableRequest,
                });

                assert.ok(output.length > 100);
                assert.match(output, /function request/i);
            });
        }
    }

    test('renders exportClient and exportModels templates', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
        });

        const clientOutput = templates.exports.client(exportClientContext);
        const modelsOutput = templates.exports.models(exportModelsContext);

        assert.match(clientOutput, /createClient|RequestExecutor/i);
        assert.match(modelsOutput, /BaseDto|fromArray/);
    });

    test('renders schema export with validation library context', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.ZOD,
        });

        const output = templates.exports.schema({
            ...schemaModel,
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.ZOD,
        });

        assert.ok(output.length > 20);
        assert.match(output, /UserSchema/i);
    });
});
