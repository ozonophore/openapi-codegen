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
});
