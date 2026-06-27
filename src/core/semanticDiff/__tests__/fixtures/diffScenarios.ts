import type { CommonOpenApi } from '../../../types/shared/CommonOpenApi.model';

function createMinimalSpec(paths: Record<string, unknown> = {}, components?: { schemas: Record<string, unknown> }): CommonOpenApi {
    return {
        openapi: '3.0.0',
        info: {
            title: 'Test API',
            version: '1.0.0',
        },
        paths,
        ...(components ? { components } : {}),
    } as unknown as CommonOpenApi;
}

export const endpointAdditionScenario = {
    oldSpec: createMinimalSpec({}),
    newSpec: createMinimalSpec({
        '/pets': {
            get: {
                operationId: 'listPets',
                responses: {
                    '200': {
                        description: 'OK',
                    },
                },
            },
        },
    }),
};

export const removedEndpointScenario = {
    oldSpec: createMinimalSpec({
        '/pets': {
            get: {
                operationId: 'listPets',
                responses: {
                    '200': {
                        description: 'OK',
                    },
                },
            },
        },
    }),
    newSpec: createMinimalSpec({}),
};

export const breakingModelAndOperationRemovalsScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/pets': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Pet: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {},
        },
    } as unknown as CommonOpenApi,
};

export const propertyTypeAndEnumScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        age: { type: 'number' },
                        role: { enum: ['user', 'admin'] },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        age: { type: 'integer' },
                        role: { enum: ['admin'] },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const operationRemovedWithMetadataScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/pets': {
                get: {
                    operationId: 'listPets',
                    summary: 'List pets',
                    description: 'Returns pets',
                    tags: ['pets'],
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
};

export const propertyRequiredTypeAndEnumScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        age: { type: 'number' },
                        role: { enum: ['user', 'admin'] },
                    },
                    required: ['age'],
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        age: { type: 'integer' },
                        role: { enum: ['admin'] },
                    },
                    required: [],
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const nonBreakingAdditionsScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/ping': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Ping: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {
            '/ping': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                        '201': { description: 'created' },
                    },
                },
            },
            '/pong': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Ping: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                        meta: { type: 'string' },
                    },
                },
                Pong: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const wideningAndNarrowingTransitionsScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                Account: {
                    type: 'object',
                    properties: {
                        tier: { enum: ['basic', 'pro'] },
                        score: { type: 'integer' },
                        state: { oneOf: [{ type: 'string' }, { type: 'number' }] },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                Account: {
                    type: 'object',
                    properties: {
                        tier: { enum: ['basic', 'pro', 'enterprise'] },
                        score: { type: 'number' },
                        state: { oneOf: [{ type: 'string' }] },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const refAndFormatWideningScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        profile: { $ref: '#/components/schemas/ProfileV1' },
                        count: { type: 'integer', format: 'int32' },
                        ratio: { type: 'number', format: 'float' },
                    },
                },
                ProfileV1: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                },
                ProfileV2: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        profile: { $ref: '#/components/schemas/ProfileV2' },
                        count: { type: 'integer', format: 'int64' },
                        ratio: { type: 'number', format: 'double' },
                    },
                },
                ProfileV1: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                },
                ProfileV2: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const formatNarrowingScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        count: { type: 'integer', format: 'int64' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        count: { type: 'integer', format: 'int32' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
};

export const successResponsePayloadChangesScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/users/{id}': {
                get: {
                    responses: {
                        '200': {
                            description: 'ok',
                            content: {
                                'application/json': {
                                    schema: { type: 'integer' },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {},
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {
            '/users/{id}': {
                get: {
                    responses: {
                        '200': {
                            description: 'ok',
                            content: {
                                'application/json': {
                                    schema: { type: 'number' },
                                },
                            },
                        },
                        '201': {
                            description: 'created',
                            content: {
                                'application/json': {
                                    schema: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {},
        },
    } as unknown as CommonOpenApi,
};

export const stableDedupOrderingScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/z': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Zeta: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                    },
                },
                Alpha: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                    },
                },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: {
            schemas: {},
        },
    } as unknown as CommonOpenApi,
};

export const semverMajorScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/users': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {},
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
};

export const semverMinorScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {},
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {
            '/users': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
};

export const semverPatchScenario = {
    oldSpec: {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
            '/users': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
            '/users': {
                get: {
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
};

export const infoVersionMajorScenario = {
    oldSpec: createMinimalSpec(),
    newSpec: {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '2.0.0' },
        paths: {},
    } as unknown as CommonOpenApi,
};

export const infoVersionMinorScenario = {
    oldSpec: createMinimalSpec(),
    newSpec: {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.1.0' },
        paths: {},
    } as unknown as CommonOpenApi,
};

export const securitySchemeChangesScenario = {
    oldSpec: {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
            schemas: {},
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer' },
                apiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
            },
        },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
            schemas: {},
            securitySchemes: {
                bearerAuth: { type: 'oauth2', flows: {} },
                oauth2Auth: { type: 'oauth2', flows: {} },
            },
        },
    } as unknown as CommonOpenApi,
};

export const governanceBreakingScenario = {
    oldSpec: {
        openapi: '3.0.0',
        paths: {
            '/users': {
                get: {
                    operationId: 'getUsers',
                    responses: {
                        '200': { description: 'ok' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
    newSpec: {
        openapi: '3.0.0',
        paths: {
            '/users': {
                get: {
                    responses: {
                        default: { description: 'fallback' },
                    },
                },
            },
        },
        components: { schemas: {} },
    } as unknown as CommonOpenApi,
};
