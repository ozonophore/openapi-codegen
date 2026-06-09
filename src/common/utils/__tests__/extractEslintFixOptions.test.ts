import assert from 'node:assert';
import { describe, test } from 'node:test';

import { extractEslintFixOptions } from '../../TEslintFixOptions';

describe('@unit: extractEslintFixOptions', () => {
    test('reads eslint paths from top-level raw options', () => {
        const result = extractEslintFixOptions({
            httpClient: 'fetch',
            tsconfigPath: './tsconfig.json',
            eslintConfigPath: './eslint.config.mjs',
            items: [{ input: './a.yaml', output: './out/a' }],
        } as never);

        assert.strictEqual(result.tsconfigPath, './tsconfig.json');
        assert.strictEqual(result.eslintConfigPath, './eslint.config.mjs');
    });

    test('returns undefined paths when not set', () => {
        const result = extractEslintFixOptions({
            httpClient: 'fetch',
            items: [{ input: './a.yaml', output: './out/a' }],
        } as never);

        assert.strictEqual(result.tsconfigPath, undefined);
        assert.strictEqual(result.eslintConfigPath, undefined);
    });
});
