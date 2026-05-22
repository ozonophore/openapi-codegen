import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Client } from '../../types/shared/Client.model';
import type { Model } from '../../types/shared/Model.model';
import { prepareDtoModels } from '../prepareDtoModels';

const createPrimitiveModel = (name: string, type: string): Model => ({
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

const createInterfaceModel = (name: string, properties: Model[]): Model => ({
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

describe('@unit: prepareDtoModels', () => {
    test('builds dto init/toJSON for references and arrays of references', () => {
        const profile = createInterfaceModel('IProfile', [createPrimitiveModel('bio', 'string')]);

        const profileRef: Model = {
            ...createPrimitiveModel('profile', 'IProfile'),
            export: 'reference',
            type: 'IProfile',
            isRequired: true,
        };

        const profilesArray: Model = {
            ...createPrimitiveModel('profiles', 'IProfile'),
            export: 'array',
            link: { ...createPrimitiveModel('IProfile', 'IProfile'), export: 'reference', type: 'IProfile' },
            isRequired: false,
        };

        const user = createInterfaceModel('IUser', [profileRef, profilesArray]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [user, profile],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const preparedUser = prepared.models.find(model => model.name === 'IUser');
        assert.ok(preparedUser);

        const preparedProfile = prepared.models.find(model => model.name === 'IProfile');
        assert.ok(preparedProfile);
        assert.strictEqual(preparedProfile?.rawName, 'IProfileRaw');
        assert.strictEqual(preparedProfile?.dtoName, 'IProfileDto');

        const profileProperty = preparedUser?.properties.find(prop => prop.name === 'profile');
        assert.ok(profileProperty);
        assert.strictEqual(profileProperty?.dtoType, 'IProfileDto');
        assert.strictEqual(profileProperty?.rawType, 'IProfileRaw');
        assert.strictEqual(profileProperty?.dtoInit, 'new IProfileDto(data.profile)');
        assert.strictEqual(profileProperty?.dtoToJSON, 'this.profile.toJSON()');

        const profilesProperty = preparedUser?.properties.find(prop => prop.name === 'profiles');
        assert.ok(profilesProperty);
        assert.strictEqual(profilesProperty?.dtoType, 'IProfileDto[]');
        assert.strictEqual(profilesProperty?.rawType, 'IProfileRaw[]');
        assert.strictEqual(profilesProperty?.dtoInit, 'data.profiles ? fromArray(IProfileDto, data.profiles) : undefined');
        assert.strictEqual(profilesProperty?.dtoToJSON, 'this.profiles ? this.profiles.map(item => item.toJSON()) : undefined');
    });

    test('attaches dto getters from confirmed miracles', () => {
        const user = createInterfaceModel('IUser', [createPrimitiveModel('fullName', 'string')]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [user],
            services: [],
            miracles: [
                {
                    type: 'RENAME',
                    oldPath: '$.components.schemas.User.properties.oldName',
                    newPath: '$.components.schemas.User.properties.fullName',
                    confidence: 1,
                    status: 'confirmed',
                    modelName: 'IUser',
                    oldProperty: 'oldName',
                    newProperty: 'fullName',
                },
            ],
        };

        const prepared = prepareDtoModels(client);
        const preparedUser = prepared.models.find(model => model.name === 'IUser');
        assert.ok(preparedUser?.dtoGetters);
        assert.strictEqual(preparedUser?.dtoGetters?.length, 1);
        assert.strictEqual(preparedUser?.dtoGetters?.[0].oldName, 'oldName');
        assert.strictEqual(preparedUser?.dtoGetters?.[0].newName, 'fullName');
    });

    test('resolves one-of and dictionary property types', () => {
        const tag = createPrimitiveModel('tag', 'string');
        const tagRef: Model = {
            ...createPrimitiveModel('value', 'string'),
            export: 'reference',
            type: 'string',
            isRequired: true,
        };
        const oneOfProp: Model = {
            ...createPrimitiveModel('payload', 'string | number'),
            export: 'one-of',
            properties: [createPrimitiveModel('a', 'string'), createPrimitiveModel('b', 'number')],
            isRequired: true,
        };
        const dictProp: Model = {
            ...createPrimitiveModel('tags', 'Record<string, string>'),
            export: 'dictionary',
            link: tagRef,
            isRequired: false,
        };
        const container = createInterfaceModel('IContainer', [oneOfProp, dictProp]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [container, tag],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const preparedContainer = prepared.models.find(model => model.name === 'IContainer');
        const preparedOneOf = preparedContainer?.properties.find(prop => prop.name === 'payload');
        const preparedDict = preparedContainer?.properties.find(prop => prop.name === 'tags');

        assert.ok(preparedOneOf?.dtoType?.includes('|'));
        assert.match(preparedDict?.dtoType ?? '', /Record<string, string>/);
    });

    test('resolves enum property types in dtoType', () => {
        const statusEnum: Model = {
            ...createPrimitiveModel('Status', 'string'),
            export: 'enum',
            enum: [
                { name: 'Active', value: "'active'", type: 'string', description: null },
                { name: 'Inactive', value: "'inactive'", type: 'string', description: null },
            ],
        };
        const statusProp: Model = {
            ...createPrimitiveModel('status', 'string'),
            export: 'enum',
            enum: statusEnum.enum,
            isRequired: true,
        };
        const model = createInterfaceModel('IUser', [statusProp]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [model, statusEnum],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const property = prepared.models[0]?.properties[0];

        assert.match(property?.dtoType ?? '', /active/);
        assert.match(property?.dtoType ?? '', /inactive/);
    });

    test('uses optional toJSON for non-required reference properties', () => {
        const profile = createInterfaceModel('IProfile', [createPrimitiveModel('bio', 'string')]);
        const profileRef: Model = {
            ...createPrimitiveModel('profile', 'IProfile'),
            export: 'reference',
            type: 'IProfile',
            isRequired: false,
        };
        const user = createInterfaceModel('IUser', [profileRef]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [user, profile],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const property = prepared.models.find(m => m.name === 'IUser')?.properties[0];

        assert.match(property?.dtoInit ?? '', /\? new IProfileDto/);
        assert.match(property?.dtoToJSON ?? '', /\? this.profile.toJSON/);
    });

    test('uses bracket accessor for quoted property names', () => {
        const quotedProp = createPrimitiveModel("'weird-name'", 'string');
        const model = createInterfaceModel('IQuoted', [quotedProp]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [model],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const property = prepared.models[0]?.properties[0];

        assert.strictEqual(property?.dtoInit, "data['weird-name']");
        assert.strictEqual(property?.dtoTarget, "['weird-name']");
    });
});
