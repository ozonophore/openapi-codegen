import assert from 'node:assert';
import { describe, test } from 'node:test';

import * as Handlebars from 'handlebars/runtime';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { registerHandlebarHelpers } from '../registerHandlebarHelpers';

describe('@unit: registerHandlebarHelpers', () => {
    test('should register the helpers', () => {
        registerHandlebarHelpers({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });
        const helpers = Object.keys(Handlebars.helpers);
        assert.ok(helpers.some(item => item === 'equals'));
        assert.ok(helpers.some(item => item === 'notEquals'));
        assert.ok(helpers.some(item => item === 'containsSpaces'));
        assert.ok(helpers.some(item => item === 'union'));
        assert.ok(helpers.some(item => item === 'intersection'));
    });
});
