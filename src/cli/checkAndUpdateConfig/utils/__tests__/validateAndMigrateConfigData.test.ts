import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../../common/Consts';
import { ELogLevel, ELogOutput } from '../../../../common/Enums';
import { EmptySchemaStrategy } from '../../../../core/types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../../../../core/types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../../../core/types/enums/ValidationLibrary.enum';
import { validateAndMigrateConfigData } from '../validateAndMigrateConfigData';

const flatConfig = {
    input: './test/spec/v3.json',
    output: './generated',
    httpClient: HttpClient.FETCH,
    validationLibrary: ValidationLibrary.NONE,
    logLevel: ELogLevel.ERROR,
    logTarget: ELogOutput.CONSOLE,
    emptySchemaStrategy: EmptySchemaStrategy.KEEP,
};

describe('@unit: validateAndMigrateConfigData', () => {
    test('accepts current flat object config', () => {
        const result = validateAndMigrateConfigData({ ...flatConfig });

        assert.strictEqual(result.isActualConfigVersion, true);
        assert.strictEqual(result.migratedData.input, flatConfig.input);
        assert.strictEqual(result.migratedData.output, flatConfig.output);
    });

    test('marks deprecated array format as outdated', () => {
        const warnMock = mock.method(APP_LOGGER, 'warn', () => undefined);

        const legacyArray = [
            { input: './a.json', output: './generated/a', httpClient: HttpClient.AXIOS, useOptions: true },
            { input: './b.json', output: './generated/b', httpClient: HttpClient.AXIOS, useOptions: true },
        ];

        const result = validateAndMigrateConfigData(legacyArray);

        assert.strictEqual(result.isActualConfigVersion, false);
        assert.ok(Array.isArray(result.migratedData.items));
        assert.strictEqual(result.migratedData.items.length, 2);
        assert.strictEqual(warnMock.mock.callCount(), 1);

        warnMock.mock.restore();
    });

    test('migrates multi-options config with items', () => {
        const multiConfig = {
            items: [
                { input: './api/v1.json', output: './generated/v1' },
                { input: './api/v2.json', output: './generated/v2' },
            ],
            httpClient: HttpClient.AXIOS,
        };

        const result = validateAndMigrateConfigData(multiConfig);

        assert.ok(result.migratedData.items);
        assert.strictEqual(result.migratedData.items.length, 2);
        assert.strictEqual(result.migratedData.httpClient, HttpClient.AXIOS);
    });

    test('detects default values when config matches defaults', () => {
        const withDefaults = {
            ...flatConfig,
            httpClient: HttpClient.FETCH,
            sortByRequired: false,
        };

        const result = validateAndMigrateConfigData(withDefaults);

        assert.strictEqual(result.hasDefaultValues, true);
        assert.strictEqual(result.migratedData.httpClient, undefined);
    });

    test('marks legacy OPTIONS-shaped config as outdated', () => {
        const legacyConfig = {
            input: './test/spec/v3.json',
            output: './generated',
            httpClient: HttpClient.FETCH,
        };

        const result = validateAndMigrateConfigData(legacyConfig);

        assert.strictEqual(result.isActualConfigVersion, true);
    });

    test('strips nested Marauder defaults from migrated config', () => {
        const withMarauderDefaults = {
            ...flatConfig,
            autoSelect: { enabled: false },
            anomalyDetection: { enabled: false },
        };

        const result = validateAndMigrateConfigData(withMarauderDefaults);

        assert.strictEqual(result.hasDefaultValues, true);
        assert.strictEqual(result.migratedData.autoSelect, undefined);
        assert.strictEqual(result.migratedData.anomalyDetection, undefined);
    });
});
