import assert from 'node:assert';
import { describe, test } from 'node:test';

import { convertArrayToObject } from '../convertArrayToObject';

describe('@unit: convertArrayToObject', () => {
    test('Empty array', () => {
        const input: any[] = [];
        const result = convertArrayToObject(input);
        const expected = {
            items: [],
            excludeCoreServiceFiles: undefined,
            request: undefined,
            useOptions: undefined,
            useCancelableRequest: undefined,
        };
        assert.deepStrictEqual(result, expected);
    });

    test('An array with one element', () => {
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
            enumPrefix: undefined,
            excludeCoreServiceFiles: undefined,
            httpClient: undefined,
            interfacePrefix: undefined,
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
            logLevel: undefined,
            logTarget: undefined,
            request: 'req1',
            sortByRequired: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            useOptions: true,
            useSeparatedIndexes: undefined,
            useUnionTypes: undefined,
            validationLibrary: undefined
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });
    test('Multiple elements with the same outer margins', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true, request: 'req1', useOptions: true },
            { input: 'url2', output: 'res2', exportCore: true, request: 'req1', useOptions: true },
        ];
        const expected = {
            enumPrefix: undefined,
            excludeCoreServiceFiles: undefined,
            httpClient: undefined,
            interfacePrefix: undefined,
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
            logLevel: undefined,
            logTarget: undefined,
            request: 'req1',
            sortByRequired: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            useOptions: true,
            useSeparatedIndexes: undefined,
            useUnionTypes: undefined,
            validationLibrary: undefined
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('Multiple elements with different external margins', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true, request: 'req1', useOptions: true },
            { input: 'url2', output: 'res2', exportCore: false, request: 'req2', useOptions: false },
        ];
        const expected = {
            enumPrefix: undefined,
            excludeCoreServiceFiles: undefined,
            httpClient: undefined,
            interfacePrefix: undefined,
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
            logLevel: undefined,
            logTarget: undefined,
            request: 'req1',
            sortByRequired: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            useOptions: true,
            useSeparatedIndexes: undefined,
            useUnionTypes: undefined,
            validationLibrary: undefined
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('No optional fields', () => {
        const input = [
            { input: 'url1', output: 'res1' },
            { input: 'url2', output: 'res2' },
        ];
        const expected = {
            enumPrefix: undefined,
            excludeCoreServiceFiles: undefined,
            httpClient: undefined,
            interfacePrefix: undefined,
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
            logLevel: undefined,
            logTarget: undefined,
            request: undefined,
            sortByRequired: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            useOptions: undefined,
            useSeparatedIndexes: undefined,
            useUnionTypes: undefined,
            validationLibrary: undefined
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });

    test('Mixed presence of optional fields', () => {
        const input = [
            { input: 'url1', output: 'res1', exportCore: true },
            { input: 'url2', output: 'res2', request: 'req2' },
        ];
        const expected = {
            enumPrefix: undefined,
            excludeCoreServiceFiles: undefined,
            httpClient: undefined,
            interfacePrefix: undefined,
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
            logLevel: undefined,
            logTarget: undefined,
            request: undefined,
            sortByRequired: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            useOptions: undefined,
            useSeparatedIndexes: undefined,
            useUnionTypes: undefined,
            validationLibrary: undefined
        };
        const result = convertArrayToObject(input);
        assert.deepStrictEqual(result, expected);
    });
});
