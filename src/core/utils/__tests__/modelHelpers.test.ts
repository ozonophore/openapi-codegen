import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Import } from '../../types/shared/Import.model';
import type { Model } from '../../types/shared/Model.model';
import { resolveModelImports, setDuplicateModelAliases } from '../modelHelpers';

function createModel(overrides: Partial<Model> = {}): Model {
    return {
        name: 'Model',
        alias: '',
        path: 'Model',
        export: 'reference',
        type: 'Model',
        base: 'Model',
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
        ...overrides,
    };
}

describe('@unit: modelHelpers', () => {
    test('resolveModelImports should propagate duplicate aliases to nested model types', () => {
        const importFooA: Import = { name: 'Foo', alias: '', path: './a/Foo' };
        const importFooB: Import = { name: 'Foo', alias: '', path: './b/Foo' };

        const propertyFooA = createModel({
            name: 'fooA',
            path: './a/Foo',
            type: 'Foo',
            base: 'Foo',
            imports: [importFooA],
        });
        const propertyFooBArray = createModel({
            name: 'fooBArray',
            export: 'array',
            type: 'Foo',
            base: 'Foo',
            imports: [importFooB],
            link: createModel({
                path: './b/Foo',
                type: 'Foo',
                base: 'Foo',
                imports: [importFooB],
            }),
        });
        const enumRefFooA = createModel({
            name: 'FooEnumRef',
            path: './a/Foo',
            type: 'Foo',
            base: 'Foo',
            imports: [importFooA],
        });

        const fooModelA = createModel({
            name: 'Foo',
            path: 'a/Foo',
            type: 'Foo',
            base: 'Foo',
            export: 'interface',
        });
        const fooModelB = createModel({
            name: 'Foo',
            path: 'b/Foo',
            type: 'Foo',
            base: 'Foo',
            export: 'interface',
        });
        const wrapper = createModel({
            name: 'Wrapper',
            path: 'wrapper/Wrapper',
            export: 'interface',
            type: 'any',
            base: 'any',
            imports: [importFooA, importFooB],
            properties: [propertyFooA, propertyFooBArray],
            enums: [enumRefFooA],
        });

        const models = [fooModelA, fooModelB, wrapper];
        setDuplicateModelAliases(models);
        resolveModelImports(models, '/tmp/generated/models');

        const wrapperImportAliases = wrapper.imports.map(item => item.alias).filter(Boolean);
        assert.deepStrictEqual(wrapperImportAliases, ['Foo$1', 'Foo$2']);

        assert.equal(propertyFooA.base, 'Foo$1');
        assert.equal(propertyFooA.type, 'Foo$1');
        assert.equal(propertyFooBArray.base, 'Foo$2');
        assert.equal(propertyFooBArray.type, 'Foo$2');
        assert.equal(propertyFooBArray.link?.base, 'Foo$2');
        assert.equal(propertyFooBArray.link?.type, 'Foo$2');
        assert.equal(enumRefFooA.base, 'Foo$1');
        assert.equal(enumRefFooA.type, 'Foo$1');

        assert.equal(wrapper.alias, '');
    });

    test('resolveModelImports should propagate alias when nested import object is not reused after dedup', () => {
        const importFooRoot: Import = { name: 'Foo', alias: '', path: './a/Foo' };
        const importFooNested: Import = { name: 'Foo', alias: '', path: './a/Foo' };

        const fooModel = createModel({
            name: 'Foo',
            path: 'a/Foo',
            export: 'interface',
            type: 'Foo',
            base: 'Foo',
        });
        const duplicateFooModel = createModel({
            name: 'Foo',
            path: 'b/Foo',
            export: 'interface',
            type: 'Foo',
            base: 'Foo',
        });

        const nestedRef = createModel({
            name: 'nestedRef',
            path: './a/Foo',
            export: 'reference',
            type: 'Foo',
            base: 'Foo',
            imports: [importFooNested],
        });

        const wrapper = createModel({
            name: 'Wrapper',
            path: 'wrapper/Wrapper',
            export: 'all-of',
            type: 'any',
            base: 'any',
            imports: [importFooRoot],
            properties: [
                createModel({
                    name: 'properties',
                    export: 'interface',
                    type: 'any',
                    base: 'any',
                    properties: [nestedRef],
                }),
            ],
        });

        const models = [fooModel, duplicateFooModel, wrapper];
        setDuplicateModelAliases(models);
        resolveModelImports(models, '/tmp/generated/models');

        assert.equal(wrapper.imports[0].path, '../a/Foo');
        assert.equal(wrapper.imports[0].alias, 'Foo$1');
        assert.equal(nestedRef.base, 'Foo$1');
        assert.equal(nestedRef.type, 'Foo$1');
    });
});
