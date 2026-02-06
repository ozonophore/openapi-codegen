import assert from 'node:assert';
import { describe, test } from 'node:test';

import { resolveHelper } from '../../../common/utils/pathHelpers';
import { isSubDirectory } from '../isSubdirectory';

describe.skip('@unit: isSubDirectory', () => {
    test('should return correct result', () => {
        assert.strictEqual(isSubDirectory(resolveHelper('/'), resolveHelper('/')), false);
        assert.strictEqual(isSubDirectory(resolveHelper('.'), resolveHelper('.')), false);
        assert.strictEqual(isSubDirectory(resolveHelper('./project'), resolveHelper('./project')), false);
        assert.strictEqual(isSubDirectory(resolveHelper('./project'), resolveHelper('../')), false);
        assert.strictEqual(isSubDirectory(resolveHelper('./project'), resolveHelper('../../')), false);
        assert.ok(isSubDirectory(resolveHelper('./'), resolveHelper('./output')));
        assert.strictEqual(isSubDirectory(resolveHelper('./'), resolveHelper('../output')), false);
    });
});
