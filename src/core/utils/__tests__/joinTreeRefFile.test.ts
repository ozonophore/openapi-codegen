import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isAbsoluteSourceFile, joinTreeRefFile } from '../joinTreeRefFile';

describe('@unit: joinTreeRefFile', () => {
    test('does not invent a drive for a drive-less Parent', () => {
        assert.equal(joinTreeRefFile('/tmp/openapi/api.yaml', './schemas/User.yaml'), '/tmp/openapi/schemas/User.yaml');
        assert.ok(!joinTreeRefFile('/tmp/openapi/api.yaml', './schemas/User.yaml').match(/^[A-Za-z]:/));
    });

    test('keeps a drive-letter Parent', () => {
        assert.equal(joinTreeRefFile('D:/tmp/openapi/api.yaml', './schemas/User.yaml'), 'D:/tmp/openapi/schemas/User.yaml');
        assert.equal(joinTreeRefFile('C:/proj/schemas/Owner.yaml', 'Pet.yaml'), 'C:/proj/schemas/Pet.yaml');
    });

    test('folds backslashes before join', () => {
        assert.equal(joinTreeRefFile('\\tmp\\openapi\\api.yaml', '.\\schemas\\User.yaml'), '/tmp/openapi/schemas/User.yaml');
    });

    test('collapses parent up-segments', () => {
        assert.equal(joinTreeRefFile('/home/dev/schemas/Owner.yaml', '../common.yaml'), '/home/dev/common.yaml');
    });

    test('isAbsoluteSourceFile is not the process path.isAbsolute', () => {
        assert.equal(isAbsoluteSourceFile('/tmp/openapi/api.yaml'), true);
        assert.equal(isAbsoluteSourceFile('D:/tmp/openapi/api.yaml'), true);
        assert.equal(isAbsoluteSourceFile('./schemas/User.yaml'), false);
        assert.equal(isAbsoluteSourceFile('schemas/User.yaml'), false);
    });
});
