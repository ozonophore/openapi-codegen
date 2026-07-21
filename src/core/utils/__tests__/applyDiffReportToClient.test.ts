import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Context } from '../../Context';
import type { Client } from '../../types/shared/Client.model';
import type { Model } from '../../types/shared/Model.model';
import { applyDiffReportToClient } from '../applyDiffReportToClient';
import { OpenApiVersion } from '../getOpenApiVersion';
import type { DiffReport } from '../loadDiffReport';

const createPropertyModel = (name: string, type: string): Model => ({
    name,
    alias: '',
    path: 'models',
    export: 'generic',
    type,
    base: type,
    template: null,
    link: null,
    description: null,
    isDefinition: false,
    isReadOnly: false,
    isRequired: false,
    isNullable: false,
    imports: [],
    enum: [],
    enums: [],
    properties: [],
});

const createObjectModel = (name: string, properties: Model[]): Model => ({
    name,
    alias: '',
    path: 'models',
    export: 'interface',
    type: name,
    base: name,
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
    properties,
});

describe('@unit: applyDiffReportToClient (TYPE_COERCION miracles)', () => {
    test('marks needsCoercion from TYPE_COERCION miracle', () => {
        const userModel = createObjectModel('IUser', [createPropertyModel('age', 'number')]);
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [userModel],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'number' },
                        },
                    },
                },
            },
        };

        const report: DiffReport = {
            diff: {
                all: [
                    {
                        action: 'changed',
                        path: '$.components.schemas.User.properties.age.type',
                        severity: 'warning',
                        from: 'string',
                        to: 'number',
                    },
                ],
            },
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.age',
                    newPath: '$.components.schemas.User.properties.age',
                    type: 'TYPE_COERCION',
                    confidence: 1,
                    status: 'auto-generated',
                },
            ],
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
        });

        const updatedModel = result.models[0];
        const property = updatedModel.properties.find(prop => prop.name === 'age');

        assert.ok(property?.needsCoercion, 'Expected needsCoercion to be true');
        assert.strictEqual(property?.coercionFrom, 'string');
        assert.strictEqual(property?.coercionTo, 'number');
        assert.ok(updatedModel.hasCoercion, 'Expected model.hasCoercion to be true');
    });

    test('marks needsCoercion for $ref alias schema via Context resolver', () => {
        const userBodyDef = {
            type: 'object',
            properties: {
                age: { type: 'number' },
            },
        };

        const mockContext = {
            get: (ref: string) => {
                if (ref === '#/components/schemas/User') {
                    return userBodyDef;
                }
                return undefined;
            },
        } as unknown as Context;

        const userModel = createObjectModel('IUser', [createPropertyModel('age', 'number')]);
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [userModel],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: '#/components/schemas/UserBody' },
                    UserBody: userBodyDef,
                },
            },
        };

        const report: DiffReport = {
            diff: {
                all: [
                    {
                        action: 'changed',
                        path: '$.components.schemas.User.properties.age.type',
                        severity: 'warning',
                        from: 'string',
                        to: 'number',
                    },
                ],
            },
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.age',
                    newPath: '$.components.schemas.User.properties.age',
                    type: 'TYPE_COERCION',
                    confidence: 1,
                    status: 'auto-generated',
                },
            ],
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            context: mockContext,
        });

        const updatedModel = result.models[0];
        const property = updatedModel.properties.find(prop => prop.name === 'age');

        assert.ok(property?.needsCoercion, 'Expected needsCoercion to be true for $ref schema');
        assert.strictEqual(property?.coercionFrom, 'string');
        assert.strictEqual(property?.coercionTo, 'number');
        assert.ok(updatedModel.hasCoercion, 'Expected model.hasCoercion to be true');
    });

    test('marks needsCoercion on property via applyModelDiffs with $ref schema', () => {
        const userBodyDef = {
            type: 'object',
            properties: {
                age: { type: 'number' },
            },
        };

        const mockContext = {
            get: (ref: string) => {
                if (ref === '#/components/schemas/User') {
                    return userBodyDef;
                }
                return undefined;
            },
        } as unknown as Context;

        const userModel = createObjectModel('IUser', [createPropertyModel('age', 'number')]);
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [userModel],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: { $ref: '#/components/schemas/UserBody' },
                    UserBody: userBodyDef,
                },
            },
        };

        const report: DiffReport = {
            diff: {
                all: [
                    {
                        action: 'changed',
                        path: '$.components.schemas.User.properties.age.type',
                        severity: 'warning',
                        from: 'string',
                        to: 'number',
                    },
                ],
            },
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            context: mockContext,
        });

        const updatedModel = result.models[0];
        const property = updatedModel.properties.find(prop => prop.name === 'age');

        assert.ok(property?.needsCoercion, 'Expected needsCoercion from applyModelDiffs');
        assert.strictEqual(property?.coercionFrom, 'string');
        assert.strictEqual(property?.coercionTo, 'number');
        assert.ok(updatedModel.hasCoercion, 'Expected model.hasCoercion to be true');
    });

    test('applies model diffs to all models with the same schema name', () => {
        const sequence1 = createObjectModel('ISequence', [createPropertyModel('pathway_id', 'string')]);
        const sequence2 = createObjectModel('ISequence', [createPropertyModel('pathwayId', 'string')]);
        sequence2.alias = 'ISequence$2';

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [sequence1, sequence2],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    Sequence: {
                        type: 'object',
                        properties: {
                            pathway_id: { type: 'string' },
                            pathwayId: { type: 'string' },
                        },
                    },
                },
            },
        };

        const report: DiffReport = {
            diff: {
                all: [
                    {
                        action: 'removed',
                        path: '$.components.schemas.Sequence.properties.legacyField',
                        severity: 'warning',
                    },
                ],
            },
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
        });

        const updated1 = result.models.find(model => model.name === 'ISequence' && !model.alias);
        const updated2 = result.models.find(model => model.alias === 'ISequence$2');

        assert.strictEqual(updated1?.ghostProperties?.length, 1);
        assert.strictEqual(updated1?.ghostProperties?.[0].name, 'legacyField');
        assert.strictEqual(updated2?.ghostProperties?.length, 1);
        assert.strictEqual(updated2?.ghostProperties?.[0].name, 'legacyField');
    });

    test('skips miracles when miraclesConfig.enabled is false', () => {
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [createObjectModel('IUser', [createPropertyModel('fullName', 'string')])],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            fullName: { type: 'string' },
                        },
                    },
                },
            },
        };

        const report: DiffReport = {
            diff: { all: [] },
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.name',
                    newPath: '$.components.schemas.User.properties.fullName',
                    type: 'RENAME',
                    confidence: 1,
                    status: 'confirmed',
                    modelName: 'IUser',
                    oldProperty: 'name',
                    newProperty: 'fullName',
                },
            ],
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            miraclesConfig: { enabled: false },
        });

        assert.strictEqual(result.miracles?.length ?? 0, 0);
    });

    test('filters auto-generated miracles by confidence threshold', () => {
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [createObjectModel('IUser', [createPropertyModel('fullName', 'string')])],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            fullName: { type: 'string' },
                        },
                    },
                },
            },
        };

        const report: DiffReport = {
            diff: { all: [] },
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.name',
                    newPath: '$.components.schemas.User.properties.fullName',
                    type: 'RENAME',
                    confidence: 0.8,
                    status: 'auto-generated',
                    modelName: 'IUser',
                    oldProperty: 'name',
                    newProperty: 'fullName',
                },
            ],
        };

        const filtered = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            miraclesConfig: { confidence: 1 },
        });
        assert.strictEqual(filtered.miracles?.length ?? 0, 0);

        const allowed = applyDiffReportToClient({
            client: { ...client, models: [createObjectModel('IUser', [createPropertyModel('fullName', 'string')])] },
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: {
                ...report,
                miracles: [{ ...report.miracles![0], confidence: 1 }],
            },
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            miraclesConfig: { confidence: 1 },
        });
        assert.strictEqual(allowed.miracles?.length, 1);
    });

    test('filters miracles by types allowlist', () => {
        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [createObjectModel('IUser', [createPropertyModel('age', 'number')])],
            services: [],
        };

        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'number' },
                        },
                    },
                },
            },
        };

        const report: DiffReport = {
            diff: { all: [] },
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.name',
                    newPath: '$.components.schemas.User.properties.fullName',
                    type: 'RENAME',
                    confidence: 1,
                    status: 'confirmed',
                },
                {
                    oldPath: '$.components.schemas.User.properties.age',
                    newPath: '$.components.schemas.User.properties.age',
                    type: 'TYPE_COERCION',
                    confidence: 1,
                    status: 'confirmed',
                },
            ],
        };

        const result = applyDiffReportToClient({
            client,
            openApi,
            openApiVersion: OpenApiVersion.V3,
            diffReport: report,
            prefix: { interface: 'I', enum: 'E', type: 'T' },
            miraclesConfig: { types: ['TYPE_COERCION'] },
        });

        assert.strictEqual(result.miracles?.length, 1);
        assert.strictEqual(result.miracles?.[0].type, 'TYPE_COERCION');
    });
});
