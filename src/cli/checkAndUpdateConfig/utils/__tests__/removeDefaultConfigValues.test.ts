import assert from 'node:assert';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../../common/Consts';
import { HttpClient } from '../../../../core/types/enums/HttpClient.enum';
import { removeDefaultConfigValues } from '../removeDefaultConfigValues';

describe('@unit: removeDefaultConfigValues', () => {
    test('removes keys that match COMMON_DEFAULT_OPTIONS_VALUES', () => {
        const cleaned = removeDefaultConfigValues({
            input: './spec.json',
            output: './generated',
            httpClient: COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            sortByRequired: COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
        });

        assert.deepStrictEqual(cleaned, {
            input: './spec.json',
            output: './generated',
        });
    });

    test('keeps custom values that differ from defaults', () => {
        const cleaned = removeDefaultConfigValues({
            input: './spec.json',
            output: './generated',
            httpClient: HttpClient.AXIOS,
            interfacePrefix: 'Api',
        });

        assert.strictEqual(cleaned.httpClient, HttpClient.AXIOS);
        assert.strictEqual(cleaned.interfacePrefix, 'Api');
        assert.strictEqual(cleaned.input, './spec.json');
    });

    test('removes nested Marauder defaults while keeping overrides', () => {
        const cleaned = removeDefaultConfigValues({
            input: './spec.json',
            output: './generated',
            autoSelect: { enabled: false, strict: false, preferSmallBundles: false, preferStandards: false },
            anomalyDetection: { enabled: true, severity: 'medium', reportFormat: 'json', reportPath: './anomaly-report.json', failOnAnomalies: false, maxNestingDepth: 5 },
        });

        assert.strictEqual(cleaned.autoSelect, undefined);
        assert.deepStrictEqual(cleaned.anomalyDetection, { enabled: true });
    });

    test('cleans per-item Marauder defaults inside items[]', () => {
        const cleaned = removeDefaultConfigValues({
            items: [
                {
                    input: './a.json',
                    output: './generated/a',
                    anomalyDetection: { enabled: true, severity: 'medium', reportFormat: 'json', reportPath: './anomaly-report.json', failOnAnomalies: false, maxNestingDepth: 5 },
                },
                {
                    input: './b.json',
                    output: './generated/b',
                },
            ],
            httpClient: HttpClient.FETCH,
        });

        assert.ok(Array.isArray(cleaned.items));
        assert.deepStrictEqual(cleaned.items[0].anomalyDetection, { enabled: true });
        assert.strictEqual('anomalyDetection' in cleaned.items[1], false);
    });
});
