import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getUniqueKeysFromSchemas } from '../../VersionedSchema/Utils/getUniqueKeysFromSchemas';
import { mockJoiSchema } from './__mock__/mockJoiSchema';

describe('@unit: getUniqueKeysFromSchemas', () => {
    test('must return unique keys from the schema', async () => {
        const schema = mockJoiSchema(['name', 'age'], true);
        const result = getUniqueKeysFromSchemas([schema as any]);
        assert.deepEqual(result, new Set(['name', 'age']));
    });

    test('should return an empty set for an empty list of schemas', async () => {
        const result = getUniqueKeysFromSchemas([]);
        assert.deepEqual(result, new Set());
    });
});
