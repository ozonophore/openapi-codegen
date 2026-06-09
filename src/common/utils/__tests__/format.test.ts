import assert from 'node:assert';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { APP_LOGGER } from '../../Consts';
import { format } from '../format';

describe('@unit: format', () => {
    let warnMessages: string[] = [];
    let infoMessages: string[] = [];
    let errorWithHintCalls: Array<{ code: string; message?: string; error?: unknown }> = [];
    let tempDir: string | null = null;

    const originalWarn = APP_LOGGER.warn.bind(APP_LOGGER);
    const originalInfo = APP_LOGGER.info.bind(APP_LOGGER);
    const originalErrorWithHint = APP_LOGGER.errorWithHint.bind(APP_LOGGER);

    beforeEach(() => {
        warnMessages = [];
        infoMessages = [];
        errorWithHintCalls = [];
        tempDir = null;

        APP_LOGGER.warn = (msg: string) => {
            warnMessages.push(msg);
        };
        APP_LOGGER.info = (msg: string) => {
            infoMessages.push(msg);
        };
        APP_LOGGER.errorWithHint = options => {
            errorWithHintCalls.push({
                code: options.code,
                message: options.message,
                error: options.error,
            });
        };
    });

    afterEach(async () => {
        APP_LOGGER.warn = originalWarn;
        APP_LOGGER.info = originalInfo;
        APP_LOGGER.errorWithHint = originalErrorWithHint;
        if (tempDir) {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    describe('default behavior (no prettierConfigPath)', () => {
        test('formats valid TypeScript with built-in options', async () => {
            const input = `const x={a:1,b:2}`;
            const result = await format(input);
            assert.ok(result.includes('const x'), 'should include variable declaration');
            assert.ok(result.trim().length > 0, 'should produce non-empty output');
        });

        test('uses typescript parser by default', async () => {
            const input = `interface IFoo { bar: string; }`;
            const result = await format(input);
            assert.ok(result.includes('IFoo'), 'should preserve interface name');
        });

        test('respects custom parser argument', async () => {
            const input = `{"key":"value"}`;
            const result = await format(input, 'json');
            assert.ok(result.includes('"key"'), 'should format as JSON');
        });

        test('does not call warn or info when prettierConfigPath is omitted', async () => {
            await format(`const a = 1;`);
            assert.strictEqual(warnMessages.length, 0, 'should not warn');
            assert.strictEqual(infoMessages.length, 0, 'should not log info');
        });
    });

    describe('prettierConfigPath', () => {
        test('resolves existing config file and logs info', async () => {
            tempDir = await mkdtemp(join(tmpdir(), 'format-test-'));
            const configPath = join(tempDir, '.prettierrc');
            await writeFile(configPath, JSON.stringify({ singleQuote: false, tabWidth: 2 }));

            const result = await format(`const x=1`, undefined, configPath);
            assert.ok(result.includes('const x'), 'should produce formatted output');
            assert.ok(
                infoMessages.some(m => m.includes('Prettier config resolved')),
                'should log resolved config path'
            );
        });

        test('falls back to built-in options and warns when config file does not exist', async () => {
            tempDir = await mkdtemp(join(tmpdir(), 'format-test-'));
            const missingConfigPath = join(tempDir, 'missing-prettier.json');

            const result = await format(`const x = 1;`, undefined, missingConfigPath);
            assert.ok(result.trim().length > 0, 'should produce non-empty output');
            assert.ok(
                warnMessages.some(m => m.includes('missing-prettier.json')),
                'should warn about missing config path'
            );
        });
    });

    describe('error handling', () => {
        test('throws an Error and calls APP_LOGGER.errorWithHint when prettier fails', async () => {
            const invalidInput = `{{{{{{{ this is not valid typescript ;;; !!!`;
            await assert.rejects(
                () => format(invalidInput, 'typescript'),
                (err: Error) => {
                    assert.ok(err instanceof Error, 'should throw an Error');
                    assert.ok(err.message.includes('Could not format'), 'message should mention formatting failure');
                    return true;
                }
            );
            assert.ok(
                errorWithHintCalls.some(c => c.code === 'PRETTIER_FORMAT_FAILED'),
                'should call errorWithHint with PRETTIER_FORMAT_FAILED code'
            );
        });
    });
});
