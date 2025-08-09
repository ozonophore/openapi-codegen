import assert from 'node:assert';
import { describe, test } from 'node:test';

import Joi from 'joi';

import {optionsSchemaV2} from '../VersionedSchema/OptionsSchemaV2';
import {mergeObjectSchemas} from '../VersionedSchema/Utils/mergeObjectSchemas';

describe('mergeObjectSchemas', () => {
    test('@unit: should combine multiple schemas correctly', () => {
        const schema1 = Joi.object({ a: Joi.string().required() });
        const schema2 = Joi.object({ b: Joi.number().optional() });
        const mergedSchema = mergeObjectSchemas(schema1, schema2);

        const validData = { a: 'test', b: 123 };
        const invalidData = { a: 'test', b: 'not a number' };

        assert.equal(mergedSchema.validate(validData).error, null, 'Valid data should pass validation');
        assert.notEqual(mergedSchema.validate(invalidData).error, null, 'Invalid data should fail validation');
    });

    test('@unit: should work with real schemas from OptionSchemas', () => {
        const validData = {
            input: 'source/path',
            httpClient: 'axios',
            output: 'output/path',
            useOptions: true,
        };
        const invalidData = {
            input: 'source/path',
            httpClient: 'invalid-client',
        };

        assert.equal(optionsSchemaV2.validate(validData).error, null, 'Valid data should pass optionsSchemaV2 validation');
        assert.notEqual(optionsSchemaV2.validate(invalidData).error, null, 'Invalid data should fail optionsSchemaV2 validation');
    });
});