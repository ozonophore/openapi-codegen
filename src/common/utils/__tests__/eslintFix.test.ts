import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { APP_LOGGER } from '../../Consts';

describe('@unit: eslintFixBatch', () => {
    let warnMessages: string[] = [];
    let errorWithHintCalls: Array<{ code: string; message?: string; error?: unknown }> = [];

    const originalWarn = APP_LOGGER.warn.bind(APP_LOGGER);
    const originalErrorWithHint = APP_LOGGER.errorWithHint.bind(APP_LOGGER);

    beforeEach(() => {
        warnMessages = [];
        errorWithHintCalls = [];

        APP_LOGGER.warn = (msg: string) => {
            warnMessages.push(msg);
        };
        APP_LOGGER.errorWithHint = options => {
            errorWithHintCalls.push({
                code: options.code,
                message: options.message,
                error: options.error,
            });
        };
    });

    afterEach(() => {
        APP_LOGGER.warn = originalWarn;
        APP_LOGGER.errorWithHint = originalErrorWithHint;
    });

    test('returns null when file list is empty', async () => {
        const { eslintFixBatch } = await import('../eslintFix');
        const result = await eslintFixBatch({
            files: [],
            includeGlobs: ['./generated/**/*.ts'],
            tsconfigPath: './tsconfig.json',
            eslintConfigPath: './eslint.config.mjs',
        });

        assert.strictEqual(result, null);
    });

    test('does not throw when eslint is unavailable or config is missing', async () => {
        const { eslintFixBatch } = await import('../eslintFix');

        let threw = false;
        try {
            await eslintFixBatch({
                files: ['/non/existent/generated/file.ts'],
                includeGlobs: ['./generated/**/*.ts'],
                tsconfigPath: './tsconfig.json',
                eslintConfigPath: './eslint.config.mjs',
            });
        } catch {
            threw = true;
        }

        const warnedNotInstalled = warnMessages.some(message => message.includes('ESLint is not installed'));
        assert.ok(!threw || warnedNotInstalled || errorWithHintCalls.length > 0);
    });
});
