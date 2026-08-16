import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../common/Consts';
import { resolveGenerationOptions } from '../resolveGenerationOptions';
import { HttpClient } from '../types/enums/HttpClient.enum';

describe('@unit: resolveGenerationOptions', () => {
    test('item prefix and flags override root', () => {
        const items = resolveGenerationOptions({
            httpClient: HttpClient.FETCH,
            interfacePrefix: 'I',
            enumPrefix: 'E',
            typePrefix: 'T',
            useCancelableRequest: false,
            sortByRequired: false,
            useSeparatedIndexes: false,
            items: [
                {
                    input: './a.yaml',
                    output: './out-a',
                    interfacePrefix: 'X',
                    enumPrefix: 'Y',
                    typePrefix: 'Z',
                    useCancelableRequest: true,
                    sortByRequired: true,
                    useSeparatedIndexes: true,
                },
            ],
        });

        assert.equal(items[0]?.interfacePrefix, 'X');
        assert.equal(items[0]?.enumPrefix, 'Y');
        assert.equal(items[0]?.typePrefix, 'Z');
        assert.equal(items[0]?.useCancelableRequest, true);
        assert.equal(items[0]?.sortByRequired, true);
        assert.equal(items[0]?.useSeparatedIndexes, true);
    });

    test('missing item fields inherit root then defaults', () => {
        const items = resolveGenerationOptions({
            httpClient: HttpClient.FETCH,
            interfacePrefix: 'Api',
            sortByRequired: true,
            items: [{ input: './a.yaml', output: './out-a' }],
        });

        assert.equal(items[0]?.interfacePrefix, 'Api');
        assert.equal(items[0]?.sortByRequired, true);
        assert.equal(items[0]?.enumPrefix, COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix);
    });

    test('item miracles override root', () => {
        const items = resolveGenerationOptions({
            httpClient: HttpClient.FETCH,
            miracles: { enabled: false },
            items: [{ input: './a.yaml', output: './out-a', miracles: { enabled: true } } as never],
        });

        assert.equal(items[0]?.miracles?.enabled, true);
    });

    test('throws on invalid raw options without process.exit', () => {
        assert.throws(() => resolveGenerationOptions({ httpClient: HttpClient.FETCH } as never), /items|input/);
    });
});
