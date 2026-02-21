/* eslint-disable simple-import-sort/imports */
import test from 'node:test';
import assert from 'node:assert';

import { ValidationLibrary } from '../../../../core/types/enums/ValidationLibrary.enum';
import { EMigrationMode } from '../../../Enums';
import { allMigrationPlans } from '../../AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../../AllVersionedSchemas/AllVersionedSchemas';
import { EVersionedSchemaType } from '../../Enums';
import { multiOptionsMigrationPlan } from '../../MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsMigrationPlans } from '../../OptionsVersioned/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../OptionsVersioned/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../migrateDataToLatestSchemaVersion';

test('@unit: migrateDataToLatestSchemaVersion (options → latest options)', () => {
    const rawInput = {
        input: './spec.json',
        output: './dist',
        httpClient: 'fetch',
    };

    const result = migrateDataToLatestSchemaVersion({
        rawInput,
        migrationPlans: optionsMigrationPlans,
        versionedSchemas: optionsVersionedSchemas,
        migrationMode: EMigrationMode.VALIDATE_CONFIG,
    });

    assert.ok(result);
    assert.strictEqual(result?.schemaType, EVersionedSchemaType.OPTIONS);
    assert.strictEqual(result?.schemaVersion, 'v4');
    assert.strictEqual(result?.value.httpClient, 'fetch');
    assert.strictEqual(result?.value.httpClient, 'fetch');
});

test('@unit: migrateDataToLatestSchemaVersion (multi-options → latest multi-options)', () => {
    const rawInput = {
        httpClient: 'fetch',
        items: [{ input: './spec.json', output: './dist' }],
    };

    const result = migrateDataToLatestSchemaVersion({
        rawInput,
        migrationPlans: multiOptionsMigrationPlan,
        versionedSchemas: multiOptionsVersionedSchema,
        migrationMode: EMigrationMode.VALIDATE_CONFIG,
    });

    assert.ok(result);
    assert.strictEqual(result?.schemaType, EVersionedSchemaType.MULTI_OPTIONS);
    assert.strictEqual(result?.schemaVersion, 'v5');
    assert.strictEqual(result?.value.httpClient, 'fetch');

    const item = result?.value.items?.[0];
    assert.ok(item);
    assert.strictEqual(item?.input, './spec.json');
    assert.strictEqual(item?.output, './dist');
});

test('@unit: migrateDataToLatestSchemaVersion (unified schemas)', () => {
    const rawInput = {
        input: './spec.json',
        output: './dist',
        httpClient: 'fetch',
        validationLibrary: ValidationLibrary.NONE,
    };

    const result = migrateDataToLatestSchemaVersion({
        rawInput,
        migrationPlans: allMigrationPlans,
        versionedSchemas: allVersionedSchemas,
        migrationMode: EMigrationMode.VALIDATE_CONFIG,
    });

    assert.ok(result);
    assert.strictEqual(result?.schemaType, EVersionedSchemaType.UNIFIED_OPTIONS);
    assert.strictEqual(result?.schemaVersion, 'UNIFIED_OPTIONS_v4');
    assert.strictEqual(result?.value.httpClient, 'fetch');
    assert.strictEqual(result?.value.validationLibrary, ValidationLibrary.NONE);
});

test('@unit: migrateDataToLatestSchemaVersion (all schemas: chooses old options branch before unified)', () => {
    const rawInput = {
        input: './spec.json',
        output: './dist',
        httpClient: 'fetch',
        exportCore: true,
    };

    const result = migrateDataToLatestSchemaVersion({
        rawInput,
        migrationPlans: allMigrationPlans,
        versionedSchemas: allVersionedSchemas,
        migrationMode: EMigrationMode.VALIDATE_CONFIG,
    });

    assert.ok(result);
    assert.strictEqual(result?.schemaType, EVersionedSchemaType.UNIFIED_OPTIONS);
    assert.strictEqual(result?.schemaVersion, 'UNIFIED_OPTIONS_v4');
    assert.ok(result?.guessedVersion.latestVersion.startsWith('OPTIONS_'));
});
