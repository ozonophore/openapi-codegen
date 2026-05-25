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
});
