import assert from 'node:assert';
import { describe, test } from 'node:test';

import { convertArrayToObject } from 'common/Utils';

describe('convertArrayToObject', () => {
    test('@unit: Empty array', () => {
        const input: any[] = [];
        const result = convertArrayToObject(input);
        const expected = {
            items: [],
            exportCore: undefined,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            request: undefined,
            useOptions: undefined,
            useCancelableRequest: undefined,
        };
        assert.deepStrictEqual(result, expected);
    });

    test('@unit: An array with one element', () => {
        const input = [
            {
                input: 'url1',
                output: 'res1',
                exportCore: true,
                request: 'req1',
                useOptions: true,
            },
        ];
        const expected = {
            httpClient: undefined,
            useOptions: true,
            useUnionTypes: undefined,
            exportCore: true,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            clean: undefined,
            request: 'req1',
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
            ],
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });
    test('@unit: Multiple elements with the same outer margins', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true, request: 'req1', useOptions: true },
            { input: 'url2', output: 'res2', exportCore: true, request: 'req1', useOptions: true },
        ];
        const expected = {
            httpClient: undefined,
            useOptions: true,
            useUnionTypes: undefined,
            exportCore: true,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            clean: undefined,
            request: 'req1',
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
                {
                    input: 'url2',
                    output: 'res2',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
            ],
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('@unit: Multiple elements with different external margins', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true, request: 'req1', useOptions: true },
            { input: 'url2', output: 'res2', exportCore: false, request: 'req2', useOptions: false },
        ];
        const expected = {
            httpClient: undefined,
            useOptions: true,
            useUnionTypes: undefined,
            exportCore: true,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            clean: undefined,
            request: 'req1',
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
                {
                    input: 'url2',
                    output: 'res2',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
            ],
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('@unit: No optional fields', () => {
        const input = [
            { input: 'url1', output: 'res1' },
            { input: 'url2', output: 'res2' },
        ];
        const expected = {
            httpClient: undefined,
            useOptions: undefined,
            useUnionTypes: undefined,
            exportCore: undefined,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            clean: undefined,
            request: undefined,
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
                {
                    input: 'url2',
                    output: 'res2',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
            ],
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('@unit: Mixed presence of optional fields', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true },
            { input: 'url2', output: 'res2', request: 'req2' },
        ];
        const expected = {
            httpClient: undefined,
            useOptions: undefined,
            useUnionTypes: undefined,
            exportCore: true,
            exportServices: undefined,
            exportModels: undefined,
            exportSchemas: undefined,
            clean: undefined,
            request: undefined,
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
                {
                    input: 'url2',
                    output: 'res2',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                },
            ],
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });
});
