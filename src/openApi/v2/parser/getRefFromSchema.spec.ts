import RefParser from 'json-schema-ref-parser';

import { Context as ContextApp } from '../../../core/Context';
import { Parser } from '../Parser';
import { getRefFromSchema } from './getRefFromSchema';

describe('getRefFromSchema', () => {
    it('should obtain refs from all schemas', async () => {

        const object = {
            openapi: '3.0.0',
            info: {
                version: 'v1.0',
            },
            paths: {
                '/api/first': {
                    $ref: '#/components/requestBodies/SimpleRequestBody',
                },
                'api/third': {
                    get: {
                        operationId: 'ComplexTypes',
                        parameters: [
                            {
                                description: 'Parameter containing object',
                                name: 'parameterObject',
                                in: 'query',
                                required: true,
                                schema: {
                                    type: 'object',
                                    properties: {
                                        first: {
                                            type: 'object',
                                            properties: {
                                                second: {
                                                    type: 'object',
                                                    properties: {
                                                        third: {
                                                            type: 'string',
                                                            arrayWithArray: {
                                                                $ref: '#/components/schemas/ArrayWithArray',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                description: 'Parameter containing reference',
                                name: 'parameterReference',
                                in: 'query',
                                required: true,
                                schema: {
                                    $ref: '#/components/schemas/ModelWithString',
                                },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Successful response',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/ModelWithString',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                requestBodies: {
                    SimpleRequestBody: {
                        type: 'string',
                    },
                    SimpleRequestBodyWithModelWithCircularReference: {
                        type: 'string',
                    },
                },
                schemas: {
                    ModelWithString: {
                        type: 'string',
                    },
                    SimpleInteger: {
                        type: 'integer',
                    },
                    SimpleRef: {
                        type: 'string',
                    },
                    ArrayWithArray: {
                        type: 'string',
                    },
                    ModelWithCircularReference: {
                        $ref: '#/components/schemas/ModelWithCircularReference',
                    },
                },
            },
        };

        const contextApp = new ContextApp(object, { output: './distr' });
        const parser = new RefParser();
        contextApp.addRefs(await parser.resolve(object));
        const refs = new Parser(contextApp).getRefFromSchema(object);

        expect(refs).toEqual(expect.arrayContaining(['#/components/schemas/ModelWithString', '#/components/schemas/ArrayWithArray']));
    });
});
