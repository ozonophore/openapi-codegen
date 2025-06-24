import assert from 'node:assert';
import test, { describe } from 'node:test';

import { HttpClient } from '../../types/Enums';
import { registerHandlebarTemplates } from '../registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    test('@unit: should return correct templates', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });
        assert.notEqual(templates.index, undefined);
        assert.notEqual(templates.exports.model, undefined);
        assert.notEqual(templates.exports.schema, undefined);
        assert.notEqual(templates.exports.service, undefined);
        assert.notEqual(templates.core.settings, undefined);
        assert.notEqual(templates.core.apiError, undefined);
        assert.notEqual(templates.core.apiRequestOptions, undefined);
        assert.notEqual(templates.core.apiResult, undefined);
        assert.notEqual(templates.core.request, undefined);
    });
});
