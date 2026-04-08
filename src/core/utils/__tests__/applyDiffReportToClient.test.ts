import assert from 'node:assert';
import { describe, test } from 'node:test';

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
});
