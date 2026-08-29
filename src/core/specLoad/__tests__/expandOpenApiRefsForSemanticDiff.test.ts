import assert from 'node:assert';
import { describe, test } from 'node:test';

import { expandOpenApiRefsForSemanticDiff, type SemanticRefResolver } from '../expandOpenApiRefsForSemanticDiff';

const sourceFile = '/tmp/openapi/api.yaml';

function createResolver(entries: Record<string, unknown>): SemanticRefResolver {
    return {
        exists: ref => Object.prototype.hasOwnProperty.call(entries, ref),
        get: ref => entries[ref],
    };
}

describe('@unit: expandOpenApiRefsForSemanticDiff', () => {
    test('expands local refs without mutating the original document', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { $ref: '#/components/schemas/UserId' },
                        },
                    },
                    UserId: { type: 'string', format: 'uuid' },
                },
            },
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.User.properties.id, { type: 'string', format: 'uuid' });
        assert.deepStrictEqual(spec.components.schemas.User.properties.id, { $ref: '#/components/schemas/UserId' });
    });

    test('expands external file refs through the resolver', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: './schemas/User.yaml' },
                },
            },
        };
        const resolver = createResolver({
            '/tmp/openapi/schemas/User.yaml': {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
        });

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.User, {
            type: 'object',
            properties: {
                name: { type: 'string' },
            },
        });
    });

    test('expands external file fragment refs through the resolver', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: './schemas/common.yaml#/components/schemas/User' },
                },
            },
        };
        const resolver = createResolver({
            '/tmp/openapi/schemas/common.yaml#/components/schemas/User': {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        });

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.User, {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'string' },
            },
        });
    });

    test('expands path item refs', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {
                '/users': { $ref: '#/components/pathItems/Users' },
            },
            components: {
                pathItems: {
                    Users: {
                        get: {
                            operationId: 'listUsers',
                            responses: {
                                '200': { description: 'ok' },
                            },
                        },
                    },
                },
            },
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { sourceFile });

        assert.deepStrictEqual(expanded.paths['/users'], {
            get: {
                operationId: 'listUsers',
                responses: {
                    '200': { description: 'ok' },
                },
            },
        });
    });

    test('keeps unresolved refs stable', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    Missing: { $ref: './missing.yaml#/Missing' },
                },
            },
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.Missing, { $ref: './missing.yaml#/Missing' });
    });

    test('keeps circular refs stringify-safe', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    Node: {
                        type: 'object',
                        properties: {
                            child: { $ref: '#/components/schemas/Node' },
                        },
                    },
                },
            },
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { sourceFile });
        const child = expanded.components.schemas.Node.properties.child as unknown as { properties: { child: unknown } };

        assert.deepStrictEqual(child.properties.child, { $ref: '#/components/schemas/Node' });
        assert.doesNotThrow(() => JSON.stringify(expanded));
    });

    test('joins a drive-letter parent without treating it as a URL', () => {
        const driveSource = 'D:/tmp/openapi/api.yaml';
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: './schemas/User.yaml' },
                },
            },
        };
        const resolver = createResolver({
            'D:/tmp/openapi/schemas/User.yaml': {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
        });

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile: driveSource });

        assert.deepStrictEqual(expanded.components.schemas.User, {
            type: 'object',
            properties: {
                name: { type: 'string' },
            },
        });
    });

    test('intern-matches Windows parser keys for ./schemas/User.yaml', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: './schemas/User.yaml' },
                },
            },
        };
        const parserKey = '\\tmp\\openapi\\schemas\\User.yaml';
        const entries: Record<string, unknown> = {
            [parserKey]: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
        };
        const resolver: SemanticRefResolver = {
            exists: ref => Object.prototype.hasOwnProperty.call(entries, ref),
            get: ref => entries[ref],
            paths: () => Object.keys(entries),
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.User, {
            type: 'object',
            properties: {
                name: { type: 'string' },
            },
        });
    });

    test('intern-matches Windows parser keys for ./schemas/common.yaml#/…', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: './schemas/common.yaml#/components/schemas/User' },
                },
            },
        };
        const parserKey = '\\tmp\\openapi\\schemas\\common.yaml#/components/schemas/User';
        const entries: Record<string, unknown> = {
            [parserKey]: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        };
        const resolver: SemanticRefResolver = {
            exists: ref => Object.prototype.hasOwnProperty.call(entries, ref),
            get: ref => entries[ref],
            paths: () => Object.keys(entries),
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.User, {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'string' },
            },
        });
    });

    test('keeps intern-unmatched file $ref as a stable $ref object', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    Missing: { $ref: './schemas/User.yaml' },
                },
            },
        };
        const entries: Record<string, unknown> = {
            '\\tmp\\other\\Pet.yaml': { type: 'object' },
        };
        const resolver: SemanticRefResolver = {
            exists: ref => Object.prototype.hasOwnProperty.call(entries, ref),
            get: ref => entries[ref],
            paths: () => Object.keys(entries),
        };

        const expanded = expandOpenApiRefsForSemanticDiff(spec, { refs: resolver, sourceFile });

        assert.deepStrictEqual(expanded.components.schemas.Missing, { $ref: './schemas/User.yaml' });
    });
});
