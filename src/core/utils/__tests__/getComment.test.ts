import assert from 'node:assert';
import { describe, test } from 'node:test';

import { EOL } from 'os';

import { getComment } from '../getComment';

describe('@unit: getComment', () => {
    test('should parse comments', () => {
        const multiline = 'Testing multiline comments.' + EOL + ' * This must go to the next line.' + EOL + ' * ' + EOL + ' * This will contain a break.';
        assert.strictEqual(getComment(''), null);
        assert.strictEqual(getComment('Hello'), 'Hello');
        assert.strictEqual(getComment('Hello World!'), 'Hello World!');
        assert.strictEqual(getComment('Testing */escape/*'), 'Testing *_/escape/*');
        assert.strictEqual(getComment('Testing multiline comments.\nThis must go to the next line.\n\nThis will contain a break.'), multiline);
        assert.strictEqual(getComment('Testing multiline comments.\r\nThis must go to the next line.\r\n\r\nThis will contain a break.'), multiline);
    });
});
