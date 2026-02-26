import assert from 'node:assert';
import { describe, test } from 'node:test';

import { convertArrayToObject } from '../convertArrayToObject';

describe('@unit: convertArrayToObject', () => {
    test('returns default shape for null', () => {
        const result = convertArrayToObject(null);

        assert.deepStrictEqual(result, {
            items: [],
            excludeCoreServiceFiles: undefined,
            request: undefined,
            customExecutorPath: undefined,
            useOptions: undefined,
            useCancelableRequest: undefined,
        });
    });

    test('returns default shape for empty array', () => {
        const result = convertArrayToObject([]);

        assert.deepStrictEqual(result, {
            items: [],
            excludeCoreServiceFiles: undefined,
            request: undefined,
            customExecutorPath: undefined,
            useOptions: undefined,
            useCancelableRequest: undefined,
        });
    });

    test('passes through object config unchanged', () => {
        const input = { input: './spec.json', output: './generated', httpClient: 'axios' };
        const result = convertArrayToObject(input);

        assert.strictEqual(result, input);
    });

    test('converts legacy array and keeps per-item request/customExecutorPath', () => {
        const input = [
            {
                input: 'url1',
                output: 'res1',
                request: 'req1',
                customExecutorPath: 'exec-1',
                httpClient: 'axios',
                useOptions: true,
            },
            {
                input: 'url2',
                output: 'res2',
                request: 'req2',
                customExecutorPath: 'exec-2',
                httpClient: 'axios',
                useOptions: true,
            },
        ];

        const result = convertArrayToObject(input);

        assert.deepStrictEqual(result, {
            httpClient: 'axios',
            useOptions: true,
            useUnionTypes: undefined,
            excludeCoreServiceFiles: undefined,
            includeSchemasFiles: undefined,
            interfacePrefix: undefined,
            enumPrefix: undefined,
            typePrefix: undefined,
            useCancelableRequest: undefined,
            logLevel: undefined,
            logTarget: undefined,
            sortByRequired: undefined,
            useSeparatedIndexes: undefined,
            validationLibrary: undefined,
            emptySchemaStrategy: undefined,
            request: undefined,
            customExecutorPath: undefined,
            items: [
                {
                    input: 'url1',
                    output: 'res1',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                    request: 'req1',
                    customExecutorPath: 'exec-1',
                },
                {
                    input: 'url2',
                    output: 'res2',
                    outputCore: undefined,
                    outputServices: undefined,
                    outputModels: undefined,
                    outputSchemas: undefined,
                    request: 'req2',
                    customExecutorPath: 'exec-2',
                },
            ],
        });
    });

    test('promotes request/customExecutorPath to root when they are equal for all items', () => {
        const input = [
            { input: 'url1', output: 'res1', request: 'req', customExecutorPath: 'exec' },
            { input: 'url2', output: 'res2', request: 'req', customExecutorPath: 'exec' },
        ];

        const result = convertArrayToObject(input);

        assert.strictEqual(result.request, 'req');
        assert.strictEqual(result.customExecutorPath, 'exec');
    });

    test('supports legacy "client" alias by normalizing it to httpClient', () => {
        const input = [
            { input: 'url1', output: 'res1', client: 'axios', useOptions: true },
            { input: 'url2', output: 'res2', client: 'axios', useOptions: true },
        ];

        const result = convertArrayToObject(input);

        assert.strictEqual(result.httpClient, 'axios');
        assert.strictEqual(result.useOptions, true);
    });

    test('throws on conflicting root-driven fields', () => {
        const input = [
            { input: 'url1', output: 'res1', useOptions: true },
            { input: 'url2', output: 'res2', useOptions: false },
        ];

        assert.throws(
            () => convertArrayToObject(input),
            /conflicting "useOptions" values/
        );
    });
});
