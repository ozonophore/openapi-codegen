import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Context } from '../Context';
import { createResolvedContext } from '../createResolvedContext';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

describe('@unit: createResolvedContext', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('resolves existing fixture and returns usable context', async () => {
        const { context, openApi } = await createResolvedContext({
            input: 'test/spec/v3.yml',
            output: getOutputPaths({ output: './generated' }),
        });
        assert.ok(openApi && typeof openApi === 'object');
        assert.doesNotThrow(() => context.values());
        assert.ok(context.getAllCanonicalRefs().length >= 0);
    });

    test('fails when spec file is missing', async () => {
        await assert.rejects(
            () =>
                createResolvedContext({
                    input: 'test/generated/does-not-exist-openapi.yaml',
                    output: getOutputPaths({ output: './generated' }),
                }),
            /OpenAPI spec not found/
        );
    });

    test('fails when path is empty', async () => {
        await assert.rejects(
            () =>
                createResolvedContext({
                    input: '',
                    output: getOutputPaths({ output: './generated' }),
                }),
            /OpenAPI spec path is empty/
        );
    });

    test('Context values throws until refs attached', () => {
        const context = new Context({ input: 'x.yml', output: getOutputPaths({ output: './generated' }) });
        assert.throws(() => context.values(), /Context must be initialized/);
    });

    test('initializes virtual map for a minimal local spec', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'resolved-ctx-'));
        const specPath = path.join(tmpDir, 'mini.yaml');
        writeFileSync(
            specPath,
            `openapi: "3.0.0"
info:
  title: Mini
  version: "1.0.0"
paths: {}
`,
            'utf8'
        );

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });
        assert.equal((openApi as { info?: { title?: string } }).info?.title, 'Mini');
        assert.doesNotThrow(() => context.values());
    });
});
