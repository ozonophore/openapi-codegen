import assert from 'node:assert';
import { describe, test } from 'node:test';

import { forEachOperationInSpec, isExplicitSuccessResponseCode, OPENAPI_HTTP_METHODS } from '../openApiOperationWalker';

describe('@unit: openApiOperationWalker', () => {
    test('OPENAPI_HTTP_METHODS includes standard HTTP verbs', () => {
        assert.deepStrictEqual(OPENAPI_HTTP_METHODS, ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
    });

    test('isExplicitSuccessResponseCode accepts numeric 2xx and 2xx range keys', () => {
        assert.strictEqual(isExplicitSuccessResponseCode('200'), true);
        assert.strictEqual(isExplicitSuccessResponseCode(' 201 '), true);
        assert.strictEqual(isExplicitSuccessResponseCode('2xx'), true);
        assert.strictEqual(isExplicitSuccessResponseCode(' 2XX '), true);
        assert.strictEqual(isExplicitSuccessResponseCode('default'), false);
        assert.strictEqual(isExplicitSuccessResponseCode('404'), false);
        assert.strictEqual(isExplicitSuccessResponseCode('20'), false);
    });

    test('forEachOperationInSpec visits each operation with path and pathItem context', () => {
        const spec = {
            paths: {
                '/pets': {
                    parameters: [{ name: 'limit', in: 'query' }],
                    get: { operationId: 'listPets', responses: { '200': {} } },
                    post: { operationId: 'createPet', responses: { '201': {} } },
                },
                '/pets/{id}': {
                    get: { operationId: 'getPet', responses: { '200': {} } },
                    trace: { operationId: 'tracePet', responses: { '200': {} } },
                },
            },
        };

        const visited: Array<{ path: string; method: string; operationId?: string; hasPathItem: boolean }> = [];

        forEachOperationInSpec(spec, ({ path, method, operation, pathItem }) => {
            visited.push({
                path,
                method,
                operationId: operation.operationId as string | undefined,
                hasPathItem: pathItem === spec.paths[path as keyof typeof spec.paths],
            });
        });

        assert.deepStrictEqual(visited, [
            { path: '/pets', method: 'get', operationId: 'listPets', hasPathItem: true },
            { path: '/pets', method: 'post', operationId: 'createPet', hasPathItem: true },
            { path: '/pets/{id}', method: 'get', operationId: 'getPet', hasPathItem: true },
            { path: '/pets/{id}', method: 'trace', operationId: 'tracePet', hasPathItem: true },
        ]);
    });

    test('forEachOperationInSpec skips invalid operations and missing paths', () => {
        const spec = {
            paths: {
                '/broken': {
                    get: null,
                    post: 'not-an-object',
                    put: { operationId: 'validPut' },
                },
            },
        };

        const visited: string[] = [];
        forEachOperationInSpec(spec, ({ method, operation }) => {
            visited.push(`${method}:${String(operation.operationId)}`);
        });

        assert.deepStrictEqual(visited, ['put:validPut']);

        forEachOperationInSpec({}, () => {
            assert.fail('callback should not run for empty spec');
        });
    });
});
