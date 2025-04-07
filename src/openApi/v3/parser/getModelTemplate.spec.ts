import { getModelTemplate } from './getModelTemplate';

describe('getModelTemplate', () => {
    it('should return generic for template type', () => {
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
        expect(template).toEqual('<T>');
    });

    it('should return empty for primary type', () => {
        const template = getModelTemplate({
            type: 'string',
            base: 'string',
            template: null,
            imports: [],
            path: '',
        });
        expect(template).toEqual('');
    });
});
