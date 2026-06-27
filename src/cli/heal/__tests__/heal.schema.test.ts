import assert from 'node:assert';
import test from 'node:test';

import { healSchema } from '../../schemas/heal.schema';

test('@unit: healSchema validates required fields', () => {
    const invalid = healSchema.safeParse({ specUrl: '', localSpec: '' });
    assert.equal(invalid.success, false);

    const valid = healSchema.safeParse({
        specUrl: 'https://api.example.com/openapi.json',
        localSpec: './spec.yaml',
        once: true,
    });
    assert.equal(valid.success, true);
});
