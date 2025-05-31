import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getModelTemplate } from '../getModelTemplate';

describe('getModelTemplate', () => {
    test('@unit: should return generic for template type', () => {
        const template = getModelTemplate({
            type: 'Link<Model>',
            base: 'Link',
            template: 'Model',
            imports: [
                {
                    name: 'Model',
                    alias: 'Model',
                    path: 'Model',
                },
            ],
            path: 'Model',
        });
        assert.strictEqual(template, '<T>');
    });

    test('@unit: should return empty for primary type', () => {
        const template = getModelTemplate({
            type: 'string',
            base: 'string',
            template: null,
            imports: [],
            path: '',
        });
        assert.strictEqual(template, '');
    });
});
