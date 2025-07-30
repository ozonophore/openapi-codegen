import assert from 'node:assert';
import { describe, test } from 'node:test';

import { EVersionedSchemaType } from '../../common/VersionedSchema/Enums';
import {determineBestMatchingSchemaVersion} from '../VersionedSchema/Utils/determineBestMatchingSchemaVersion';
import { mockJoiSchema } from './__mock__/mockJoiSchema';

describe('determineBestMatchingSchemaVersion', () => {
    test('@unit: it should return the latest version if there is an exact match.', async () => {
      const schemas = [
        { schema: mockJoiSchema(['name'], true), version: '1.0', type: EVersionedSchemaType.OPTIONS },
        { schema: mockJoiSchema(['name', 'age'], true), version: '2.0', type: EVersionedSchemaType.OPTIONS },
      ];
      const input = { name: 'John', age: 30 };
      const result = determineBestMatchingSchemaVersion(input, schemas as any);
      assert.deepEqual(result, {
        lastVersionIndex: 1,
        latestVersion: '2.0',
        firstVersion: '1.0',
      });
    });

    test('@unit: should return the best scheme in the absence of exact matches.', async () => {
      const schemas = [
        { schema: mockJoiSchema(['name'], false, [{ path: 'age', type: 'string' }]), version: '1.0', type: EVersionedSchemaType.OPTIONS },
        { schema: mockJoiSchema(['name', 'age'], true), version: '2.0', type: EVersionedSchemaType.OPTIONS },
      ];
      const input = { name: 'John', age: 30 };
      const result = determineBestMatchingSchemaVersion(input, schemas as any);
      assert.deepEqual(result, {
        lastVersionIndex: 1,
        latestVersion: '2.0',
        firstVersion: '2.0',
      });
    });
});
