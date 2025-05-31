import { getAbsolutePath } from './getAbsolutePath';

describe('getAbsolutePath', () => {
    it('The absolute reference in the definition Ref replaces the part after the # in the parentRef', () => {
        const result = getAbsolutePath('#/components/schemas/ErrorCode', 'models.yaml#/components/schemas/ErrorData');
        expect(result).toBe('models.yaml#/components/schemas/ErrorCode');
    });

    it('The absolute parentRef reference returns the definition Ref as it is', () => {
        const result = getAbsolutePath('relative/path', '#/components/schemas/ErrorData');
        expect(result).toBe('relative/path');
    });

    it('The relative path is combined with the directory', () => {
        const result = getAbsolutePath('relative/path', 'models.yaml#/components/schemas/ErrorData');
        expect(result).toBe('models.yaml#/components/schemas/relative/path');
    });

    it('If definitionRef is missing and parentRef starts with #/, an empty string is returned.', () => {
        const result = getAbsolutePath(undefined, '#/components/schemas/ErrorData');
        expect(result).toBe('');
    });

    it('If the definition Ref is missing, parentRef is returned.', () => {
        const result = getAbsolutePath(undefined, 'models.yaml#/components/schemas/ErrorData');
        expect(result).toBe('models.yaml#/components/schemas/ErrorData');
    });
});
