import assert from 'node:assert';
import { describe, test } from 'node:test';

import { prepareConfigData } from '../prepareConfigData';

describe('@unit: prepareConfigData', () => {
    test('serializes and formats config as JSON string', async () => {
        const formatted = await prepareConfigData({
            input: './test/spec/v3.json',
            output: './generated',
        });

        assert.match(formatted, /"input":\s*"\.\/test\/spec\/v3\.json"/);
        assert.match(formatted, /"output":\s*"\.\/generated"/);
        assert.ok(formatted.trim().startsWith('{'));
        assert.ok(formatted.trim().endsWith('}'));
    });
});
