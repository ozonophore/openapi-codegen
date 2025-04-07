import { getOutputPaths } from './getOutputPaths';
import { join } from './path';

// mock - process.cwd()
const mockCwd = '/projects/my-project';
jest.spyOn(process, 'cwd').mockImplementation(() => mockCwd);

describe('getOutputPaths', () => {
    it('should return correct paths with custom locations', () => {
        const result = getOutputPaths({
            output: 'dist',
            outputCore: 'src/core',
            outputServices: 'generated/services',
            outputModels: 'models',
            outputSchemas: 'schemas',
        });

        expect(result).toEqual({
            output: join(mockCwd, 'dist'),
            outputCore: join(mockCwd, 'src/core'),
            outputServices: join(mockCwd, 'generated/services'),
            outputModels: join(mockCwd, 'models'),
            outputSchemas: join(mockCwd, 'schemas'),
        });
    });

    it('should ensure default paths are inside main output', () => {
        const { output, ...subPaths } = getOutputPaths({ output: 'dist' });

        Object.values(subPaths).forEach(subPath => {
            expect(subPath.startsWith(output)).toBe(true);
        });
    });
    it('should normalize redundant slashes', () => {
        const result = getOutputPaths({
            output: 'dist//generated/',
            outputCore: 'src//core/',
        });

        expect(result.output).toBe(join(mockCwd, 'dist/generated'));
        expect(result.outputCore).toBe(join(mockCwd, 'src/core'));
    });
});

describe('Boundary cases', () => {
    it('should accept direct cwd subfolder', () => {
        expect(() => getOutputPaths({ output: 'subfolder' })).not.toThrow();
    });

    it('should reject exactly cwd path', () => {
        expect(() => getOutputPaths({ output: mockCwd })).toThrow();
    });
});

describe('should throw errors for invalid paths', () => {
    const testCases = [
        { param: 'output', value: '../outside' },
        { param: 'outputCore', value: '/absolute/path' },
        { param: 'outputSchemas', value: '../../invalid' },
        { param: 'outputModels', value: mockCwd },
        { param: 'outputServices', value: 'dist/../..' },
    ];

    testCases.forEach(({ param, value }) => {
        it(`should throw for invalid ${param}`, () => {
            const params = { output: 'valid/output', [param]: value };

            expect(() => getOutputPaths(params)).toThrow(/is not a subdirectory of the current working directory/i);
        });
    });
});
