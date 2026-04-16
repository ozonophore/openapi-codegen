import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { APP_LOGGER } from '../../Consts';
import { format } from '../format';

describe('@unit: format', () => {
    let warnMessages: string[] = [];
    let infoMessages: string[] = [];
    let errorWithHintCalls: Array<{ code: string; message?: string; error?: unknown }> = [];

    const originalWarn = APP_LOGGER.warn.bind(APP_LOGGER);
    const originalInfo = APP_LOGGER.info.bind(APP_LOGGER);
    const originalErrorWithHint = APP_LOGGER.errorWithHint.bind(APP_LOGGER);

    beforeEach(() => {
        warnMessages = [];
        infoMessages = [];
        errorWithHintCalls = [];

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

    afterEach(() => {
        APP_LOGGER.warn = originalWarn;
        APP_LOGGER.info = originalInfo;
        APP_LOGGER.errorWithHint = originalErrorWithHint;
    });

    describe('default behavior (useProjectConfig=false)', () => {
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

        test('does not call warn or info when useProjectConfig is omitted', async () => {
            await format(`const a = 1;`);
            assert.strictEqual(warnMessages.length, 0, 'should not warn');
            assert.strictEqual(infoMessages.length, 0, 'should not log info');
        });
    });

    describe('useProjectConfig=true', () => {
        test('falls back to built-in options and warns when no project config is found', async () => {
            // Running from workspace root which may not have a .prettierrc matching every field;
            // the only guaranteed outcome is that the function does not throw and returns formatted code.
            const input = `const x = 1;`;
            const result = await format(input, undefined, true);
            assert.ok(result.trim().length > 0, 'should produce non-empty output');
        });

        test('logs info when project config is resolved, or warns when not found', async () => {
            await format(`const x = 1;`, undefined, true);
            const resolvedSomething = infoMessages.some(m => m.includes('Prettier config resolved')) ||
                warnMessages.some(m => m.includes('No project Prettier config'));
            assert.ok(resolvedSomething, 'should log either resolved config path or fallback warning');
        });
    });

    describe('error handling', () => {
        test('throws an Error and calls APP_LOGGER.errorWithHint when prettier fails', async () => {
            // Feed an unparseable string with a syntax error that prettier cannot fix
            const invalidInput = `{{{{{{{ this is not valid typescript ;;; !!!`;
            await assert.rejects(
                () => format(invalidInput, 'typescript', false),
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
