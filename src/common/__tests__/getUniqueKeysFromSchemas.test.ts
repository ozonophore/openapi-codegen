import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getUniqueKeysFromSchemas } from '../VersionedSchema/Utils/getUniqueKeysFromSchemas';
import { mockJoiSchema } from './__mock__/mockJoiSchema';

describe('getUniqueKeysFromSchemas', () => {
    test('@unit: must return unique keys from the schema', async () => {
        const schema = mockJoiSchema(['name', 'age'], true);
        const result = getUniqueKeysFromSchemas([schema as any]);
        assert.deepEqual(result, new Set(['name', 'age']));
    });

    test('@unit: should return an empty set for an empty list of schemas', async () => {
        const result = getUniqueKeysFromSchemas([]);
        assert.deepEqual(result, new Set());
    });
});
