import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { getRefFromSchema } from '../getRefFromSchema';

const ContextMock = {
    get: (): any => undefined,
};

describe('@unit: getRefFromSchema', () => {
    test.skip('should obtain refs from all schemas', () => {
        mock.method(ContextMock, 'get', ($ref: string): any => {
            if ($ref === '#/components/requestBodies/SimpleRequestBodyWithModelWithCircularReference') {
                return {
                    SimpleRequestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ModelWithCircularReference',
                                },
                            },
                        },
                    },
                };
            } else if ($ref === '#/components/requestBodies/SimpleRequestBody') {
                return {
                    SimpleRequestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SimpleInteger',
                                },
                            },
                        },
                    },
                };
            } else if ($ref === '#/components/schemas/SimpleInteger') {
                return {
                    description: 'This is a simple number',
                    type: 'integer',
                };
            } else if ($ref === '#/components/schemas/ModelWithString') {
                return {
                    description: 'This is a simple string',
                    type: 'string',
                };
            } else if ($ref === '#/components/schemas/SimpleRef') {
                return {
                    $ref: '#/components/schemas/ModelWithString',
                };
            } else if ($ref === '#/components/schemas/ModelWithCircularReference') {
                return {
                    type: 'object',
                    properties: {
                        prop: {
                            $ref: '#/components/schemas/ModelWithCircularReference',
                        },
                        simpleProp: {
                            $ref: '#/components/schemas/SimpleRef',
                        },
                    },
                };
            }
            if ($ref === '#/components/schemas/ArrayWithArray') {
                return {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ModelWithString',
                        },
                    },
                };
            }
        });

        const refs = getRefFromSchema(ContextMock as any, {
            openapi: '3.0.0',
            info: {
                version: 'v1.0',
            },
            paths: {
                '/api/first': {
                    $ref: '#/components/requestBodies/SimpleRequestBody',
                },
                '/api/second': {
                    $ref: '#/components/requestBodies/SimpleRequestBodyWithModelWithCircularReference',
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
                            '400': {
                                description: '400 server error',
                            },
                            '500': {
                                description: '500 server error',
                            },
                        },
                    },
                },
            },
        });

        assert.ok(refs.some(item => item === '#/components/schemas/SimpleInteger'));
        assert.ok(refs.some(item => item === '#/components/schemas/ModelWithString'));
        assert.ok(refs.some(item => item === '#/components/schemas/SimpleRef'));
        assert.ok(refs.some(item => item === '#/components/schemas/ArrayWithArray'));
        assert.ok(refs.some(item => item === '#/components/schemas/ModelWithCircularReference'));
    });
});
