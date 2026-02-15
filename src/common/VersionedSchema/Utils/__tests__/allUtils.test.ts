/* eslint-disable simple-import-sort/imports */
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { z } from 'zod';

import { EVersionedSchemaType } from '../../Enums';
import { buildVersionedSchema } from '../buildVersionedSchema';
import { createDefaultFieldsMigration } from '../createDefaultFieldsMigration';
import { createFieldTransformationMigration } from '../createFieldTransformationMigration';
import { createTrivialMigration } from '../createTrivialMigration';
import { determineBestMatchingSchemaVersion } from '../determineBestMatchingSchemaVersion';
import { generateKeyMappingForInvalidKeys } from '../generateKeyMappingForInvalidKeys';
import { getCurrentErrorMessage } from '../getCurrentErrorMessage';
import { getKeyByMapValue } from '../getKeyByMapValue';
import { getLatestVersionFromMigrationPlans } from '../getLatestVersionFromMigrationPlans';
import { getUniqueKeysFromSchemas } from '../getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from '../getUniqueObjectKeys';
import { replaceInvalidKeysWithMappedNames } from '../replaceInvalidKeysWithMappedNames';
import { validateAndSuggestKeyCorrections } from '../validateAndSuggestKeyCorrections';

describe('@unit: buildVersionedSchema', () => {
    test('builds schema metadata without refine', () => {
        const base = z.object({ input: z.string() });
        const result = buildVersionedSchema({
            base,
            version: 'v1',
            type: EVersionedSchemaType.OPTIONS,
        });

        assert.strictEqual(result.baseSchema, base);
        assert.strictEqual(result.version, 'v1');
        assert.strictEqual(result.type, EVersionedSchemaType.OPTIONS);
        assert.deepStrictEqual(result.schema.parse({ input: 'ok' }), { input: 'ok' });
    });

    test('applies refine when provided', () => {
        const base = z.object({ input: z.string(), output: z.string() });
        const schema = buildVersionedSchema({
            base,
            version: 'v2',
            type: EVersionedSchemaType.OPTIONS,
            refine: (data, ctx) => {
                if (data.input === data.output) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'input and output must be different',
                        path: ['output'],
                    });
                }
            },
        }).schema;

        const result = schema.safeParse({ input: 'same', output: 'same' });
        assert.strictEqual(result.success, false);
    });
});

describe('@unit: migration plan helpers', () => {
    test('createDefaultFieldsMigration merges default values', () => {
        const plan = createDefaultFieldsMigration('v1', 'v2', { enabled: true });
        assert.strictEqual(plan.fromVersion, 'v1');
        assert.strictEqual(plan.toVersion, 'v2');
        assert.deepStrictEqual(plan.migrate({ name: 'demo' }), { name: 'demo', enabled: true });
        assert.match(plan.description ?? '', /enabled/);
    });

    test('createFieldTransformationMigration keeps custom migrate and custom description', () => {
        const plan = createFieldTransformationMigration(
            'v1',
            'v2',
            ({ oldField, ...rest }: { oldField: string; other: number }) => ({ ...rest, newField: oldField }),
            'rename oldField'
        );

        assert.strictEqual(plan.fromVersion, 'v1');
        assert.strictEqual(plan.toVersion, 'v2');
        assert.strictEqual(plan.description, 'rename oldField');
        assert.deepStrictEqual(plan.migrate({ oldField: 'x', other: 1 }), { other: 1, newField: 'x' });
    });

    test('createTrivialMigration copies object as-is', () => {
        const plan = createTrivialMigration('v3', 'v4');
        const source = { a: 1 };
        const migrated = plan.migrate(source);

        assert.deepStrictEqual(migrated, source);
        assert.notStrictEqual(migrated, source);
        assert.match(plan.description ?? '', /Trivial migration/);
    });
});

describe('@unit: determineBestMatchingSchemaVersion', () => {
    const mk = (schema: z.ZodTypeAny, version: string) => ({
        schema,
        baseSchema: z.object({}),
        version,
        type: EVersionedSchemaType.OPTIONS,
    });

    test('throws on empty schema list', () => {
        assert.throws(
            () => determineBestMatchingSchemaVersion({}, []),
            /cannot be empty/i
        );
    });

    test('returns latest from multiple valid matches', () => {
        const versionedSchemas = [
            mk(z.object({ a: z.string() }), 'v1'),
            mk(z.object({ a: z.string(), b: z.string().optional() }), 'v2'),
        ];

        const result = determineBestMatchingSchemaVersion({ a: 'ok' }, versionedSchemas);

        assert.deepStrictEqual(result, {
            lastVersionIndex: 1,
            latestVersion: 'v2',
            firstVersion: 'v1',
        });
    });

    test('falls back to the best key/error balance when no full match', () => {
        const versionedSchemas = [
            mk(z.object({ a: z.string() }), 'v1'),
            mk(z.object({ b: z.string() }), 'v2'),
        ];

        const result = determineBestMatchingSchemaVersion({ a: 1 }, versionedSchemas);

        assert.deepStrictEqual(result, {
            lastVersionIndex: 0,
            latestVersion: 'v1',
            firstVersion: 'v1',
        });
    });
});

describe('@unit: key mapping and validation helpers', () => {
    test('generateKeyMappingForInvalidKeys maps close invalid keys', () => {
        const mapping = generateKeyMappingForInvalidKeys(
            ['nmae', 'title', 'unknown'],
            new Set(['name', 'title'])
        );

        assert.deepStrictEqual(Array.from(mapping.entries()), [['nmae', 'name']]);
    });

    test('validateAndSuggestKeyCorrections throws with suggestion', () => {
        assert.throws(
            () => validateAndSuggestKeyCorrections(['nmae'], new Set(['name'])),
            /Perhaps you meant "name"/,
        );
    });

    test('validateAndSuggestKeyCorrections does not throw for valid keys', () => {
        assert.doesNotThrow(() => validateAndSuggestKeyCorrections(['name'], new Set(['name'])));
    });
});

describe('@unit: getCurrentErrorMessage and getKeyByMapValue', () => {
    test('getKeyByMapValue finds key by value', () => {
        const key = getKeyByMapValue(new Map([['nmae', '--name']]), '--name');
        assert.strictEqual(key, 'nmae');
    });

    test('getCurrentErrorMessage does nothing when no issues', () => {
        assert.doesNotThrow(() => {
            getCurrentErrorMessage({ issues: [], message: '' } as any, new Map());
        });
    });

    test('getCurrentErrorMessage throws deduplicated transformed message', () => {
        const error = {
            message: '--name is invalid',
            issues: [
                { path: ['name'], message: 'wrong value' },
                { path: ['name'], message: 'wrong value' },
            ],
        } as any;

        assert.throws(
            () => getCurrentErrorMessage(error, new Map([['nmae', '--name']])),
            /nmae is invalid/,
        );
    });
});

describe('@unit: collection helpers', () => {
    test('getLatestVersionFromMigrationPlans returns toVersion of last plan', () => {
        const version = getLatestVersionFromMigrationPlans([
            createTrivialMigration('v1', 'v2'),
            createTrivialMigration('v2', 'v3'),
        ]);

        assert.strictEqual(version, 'v3');
    });

    test('getLatestVersionFromMigrationPlans throws for empty list', () => {
        assert.throws(() => getLatestVersionFromMigrationPlans([]), /empty/i);
    });

    test('getUniqueKeysFromSchemas returns keys from root and nested objects', () => {
        const keys = getUniqueKeysFromSchemas([
            z.object({
                a: z.string(),
                nested: z.object({ inner: z.number() }),
            }),
            z.object({ b: z.boolean() }),
        ]);

        assert.deepStrictEqual(Array.from(keys).sort(), ['a', 'b', 'inner', 'nested']);
    });

    test('getUniqueObjectKeys returns unique keys for nested object and arrays', () => {
        const keys = getUniqueObjectKeys({
            a: 1,
            nested: { b: 2 },
            items: [{ c: 3 }, { a: 4 }],
        });

        assert.deepStrictEqual(keys, ['a', 'nested', 'b', 'items', 'c']);
    });

    test('replaceInvalidKeysWithMappedNames replaces keys recursively for arrays', () => {
        const replaced = replaceInvalidKeysWithMappedNames(
            [{ nmae: 'a' }, { nmae: 'b', extra: [{ nmae: 'c' }] }],
            new Map([['nmae', 'name']])
        );

        assert.deepStrictEqual(replaced, [
            { name: 'a' },
            { name: 'b', extra: [{ name: 'c' }] },
        ]);
    });
});
