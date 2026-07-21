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
        assert.strictEqual(profilesProperty?.dtoType, 'IProfileDto[] | undefined');
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

    test('assigns unique raw/dto names for duplicate models with aliases', () => {
        const ingredient1 = createInterfaceModel('IIngredient', [createPrimitiveModel('id', 'string')]);
        ingredient1.path = 'components/schemas-v2/Ingredient';
        const ingredient2 = createInterfaceModel('IIngredient', [createPrimitiveModel('pathwayId', 'string')]);
        ingredient2.alias = 'IIngredient$2';
        ingredient2.path = 'components/schemas/Ingredient';

        const ref: Model = {
            ...createPrimitiveModel('items', 'IIngredient'),
            export: 'reference',
            type: 'IIngredient$2',
            isRequired: true,
        };
        const container = createInterfaceModel('IContainer', [ref]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [container, ingredient1, ingredient2],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const prepared1 = prepared.models.find(model => model.name === 'IIngredient' && !model.alias);
        const prepared2 = prepared.models.find(model => model.alias === 'IIngredient$2');

        assert.strictEqual(prepared1?.rawName, 'IIngredientRaw');
        assert.strictEqual(prepared1?.dtoName, 'IIngredientDto');
        assert.strictEqual(prepared2?.rawName, 'IIngredient$2Raw');
        assert.strictEqual(prepared2?.dtoName, 'IIngredient$2Dto');

        const itemsProperty = prepared.models.find(model => model.name === 'IContainer')?.properties[0];
        assert.strictEqual(itemsProperty?.rawType, 'IIngredient$2Raw');
        assert.strictEqual(itemsProperty?.dtoType, 'IIngredient$2Dto');
    });

    test('dtoImports resolve $N export names from import path', () => {
        const ingredient1 = createInterfaceModel('IIngredient', [createPrimitiveModel('id', 'string')]);
        ingredient1.path = 'components/schemas-v2/Ingredient';
        const ingredient2 = createInterfaceModel('IIngredient', [createPrimitiveModel('pathwayId', 'string')]);
        ingredient2.alias = 'IIngredient$2';
        ingredient2.path = 'components/schemas/Ingredient';

        const container = createInterfaceModel('IContainer', [
            {
                ...createPrimitiveModel('items', 'IIngredient'),
                export: 'reference',
                type: 'IIngredient$2',
                isRequired: true,
            },
        ]);
        container.imports = [{ name: 'IIngredient', alias: '', path: './components/schemas/Ingredient' }];

        const prepared = prepareDtoModels({
            version: '1.0.0',
            server: 'http://localhost',
            models: [container, ingredient1, ingredient2],
            services: [],
        });

        const dtoImports = prepared.models.find(model => model.name === 'IContainer')?.dtoImports;
        assert.ok(dtoImports?.some(entry => entry.rawName === 'IIngredient$2Raw' && entry.dtoName === 'IIngredient$2Dto'));
        assert.ok(!dtoImports?.some(entry => entry.rawName === 'IIngredientRaw' && entry.path.includes('schemas/Ingredient')));
    });

    test('does not emit new for primitive alias references', () => {
        const typeAlias: Model = {
            ...createPrimitiveModel('TType', 'string'),
            name: 'TType',
            path: 'schemas/Type',
            export: 'generic',
            isDefinition: true,
        };

        const ref: Model = {
            ...createPrimitiveModel('value', 'TType'),
            export: 'reference',
            type: 'TType',
            isRequired: true,
        };
        const wrapper = createInterfaceModel('IWrapper', [ref]);

        const prepared = prepareDtoModels({
            version: '1.0.0',
            server: 'http://localhost',
            models: [wrapper, typeAlias],
            services: [],
        });

        const property = prepared.models.find(model => model.name === 'IWrapper')?.properties[0];
        assert.strictEqual(property?.dtoInit, 'data.value');
        assert.ok(!property?.dtoInit?.includes('new '));
        assert.strictEqual(property?.dtoToJSON, undefined);
    });

    test('maps dictionary-of-reference values to Dto instances', () => {
        const profile = createInterfaceModel('IProfile', [createPrimitiveModel('bio', 'string')]);
        profile.path = 'schemas/Profile';

        const dict: Model = {
            ...createPrimitiveModel('byId', 'IProfile'),
            export: 'dictionary',
            link: { ...createPrimitiveModel('IProfile', 'IProfile'), export: 'reference', type: 'IProfile' },
            isRequired: false,
        };
        const user = createInterfaceModel('IUser', [dict]);

        const prepared = prepareDtoModels({
            version: '1.0.0',
            server: 'http://localhost',
            models: [user, profile],
            services: [],
        });

        const property = prepared.models.find(model => model.name === 'IUser')?.properties[0];
        assert.match(property?.dtoInit ?? '', /Object\.fromEntries.*new IProfileDto/);
        assert.match(property?.dtoToJSON ?? '', /Object\.fromEntries.*toJSON/);
    });

    test('adds undefined fallback for optional dto fields without defaults', () => {
        const optionalProp = createPrimitiveModel('detail', 'string');
        optionalProp.isRequired = false;
        const model = createInterfaceModel('IProblem', [optionalProp]);

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [model],
            services: [],
        };

        const prepared = prepareDtoModels(client);
        const property = prepared.models[0]?.properties[0];

        assert.match(property?.dtoType ?? '', /undefined/);
        assert.strictEqual(property?.dtoInit, 'data.detail ?? undefined');
    });

    test('attaches dto getters for aliased duplicate models', () => {
        const sequence = createInterfaceModel('ISequence', [createPrimitiveModel('pathwayId', 'string')]);
        sequence.alias = 'ISequence$2';

        const client: Client = {
            version: '1.0.0',
            server: 'http://localhost',
            models: [sequence],
            services: [],
            miracles: [
                {
                    type: 'RENAME',
                    oldPath: '$.components.schemas.Sequence.properties.pathway_id',
                    newPath: '$.components.schemas.Sequence.properties.pathwayId',
                    confidence: 1,
                    status: 'confirmed',
                    modelName: 'ISequence$2',
                    oldProperty: 'pathway_id',
                    newProperty: 'pathwayId',
                },
            ],
        };

        const prepared = prepareDtoModels(client);
        const preparedSequence = prepared.models.find(model => model.alias === 'ISequence$2');

        assert.ok(preparedSequence?.dtoGetters);
        assert.strictEqual(preparedSequence?.dtoGetters?.[0].oldName, 'pathway_id');
        assert.strictEqual(preparedSequence?.dtoGetters?.[0].newName, 'pathwayId');
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

        assert.strictEqual(property?.dtoInit, "data['weird-name'] ?? undefined");
        assert.strictEqual(property?.dtoTarget, "['weird-name']");
    });
});
