import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { findInternParserKey, internParserKey, internParserKeysEqual } from '../parserKeyMatch';

describe('@unit: parserKeyMatch', () => {
    test('backslash and slash intern-match as the same opened file', () => {
        assert.equal(internParserKeysEqual('C:\\proj\\schemas\\User.yaml', 'C:/proj/schemas/User.yaml'), true);
        assert.equal(internParserKey('C:\\proj\\schemas\\User.yaml'), 'C:/proj/schemas/User.yaml');
    });

    test('drive-letter case and percent-encoding intern-match', () => {
        assert.equal(internParserKeysEqual('c:/proj/api.yaml', 'C:/proj/api.yaml'), true);
        assert.equal(internParserKeysEqual('/home/dev/foo%20bar.yaml', '/home/dev/foo bar.yaml'), true);
        assert.equal(findInternParserKey(['/home/dev/foo bar.yaml'], '/home/dev/foo%20bar.yaml'), '/home/dev/foo bar.yaml');
    });

    test('different basenames do not intern-match', () => {
        assert.equal(internParserKeysEqual('/home/dev/other/Pet.yaml', '/home/dev/schemas/Pet.yaml'), false);
        assert.equal(findInternParserKey(['/home/dev/other/Pet.yaml'], '/home/dev/schemas/Pet.yaml'), undefined);
    });
});
