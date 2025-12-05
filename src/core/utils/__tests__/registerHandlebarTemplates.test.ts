import assert from 'node:assert';
import test, { describe } from 'node:test';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { registerHandlebarTemplates } from '../registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    test('@unit: should return correct templates', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });
        assert.notEqual(templates.indexes.full, undefined);
        assert.notEqual(templates.indexes.models, undefined);
        assert.notEqual(templates.indexes.schemas, undefined);
        assert.notEqual(templates.indexes.services, undefined);
        assert.notEqual(templates.indexes.simple, undefined);
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
