import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { cleanupCodegenTempDir } from '../codegenTempDir';
import { prepareTempTsConfig } from '../prepareTempTsConfig';

describe('@unit: prepareTempTsConfig', () => {
    let tempDir: string;

    afterEach(async () => {
        if (tempDir) {
            await cleanupCodegenTempDir(tempDir);
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('replaces base include with narrow output globs only', async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-eslint-'));
        const baseTsconfigPath = path.join(tempDir, 'tsconfig.json');
        fs.writeFileSync(
            baseTsconfigPath,
            JSON.stringify({
                compilerOptions: { target: 'ES2020', strict: true },
                include: ['src/**/*'],
            })
        );

        const tempPath = await prepareTempTsConfig({
            baseTsconfigPath,
            includeGlobs: ['./generated/models/**/*.ts', './generated/services/**/*.ts'],
            cwd: tempDir,
        });

        const parsed = JSON.parse(fs.readFileSync(tempPath, 'utf8')) as {
            include: string[];
            compilerOptions: {
                target?: unknown;
                noEmit?: boolean;
                skipLibCheck?: boolean;
                incremental?: boolean;
            };
        };

        assert.deepStrictEqual(parsed.include, [path.join(tempDir, 'generated/models/**/*.ts'), path.join(tempDir, 'generated/services/**/*.ts')]);
        assert.notDeepEqual(parsed.include, [path.join(tempDir, 'src/**/*')]);
        assert.strictEqual(parsed.compilerOptions.target, 'ES2020');
        assert.strictEqual(parsed.compilerOptions.noEmit, true);
        assert.strictEqual(parsed.compilerOptions.skipLibCheck, true);
        assert.strictEqual(parsed.compilerOptions.incremental, false);
    });

    test('preserves raw lib entries from the base tsconfig', async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-eslint-'));
        const baseTsconfigPath = path.join(tempDir, 'tsconfig.json');
        fs.writeFileSync(
            baseTsconfigPath,
            JSON.stringify({
                compilerOptions: {
                    target: 'ES2022',
                    lib: ['es6', 'es2017', 'dom'],
                },
            })
        );

        const tempPath = await prepareTempTsConfig({
            baseTsconfigPath,
            includeGlobs: ['./generated/**/*.ts'],
            cwd: tempDir,
        });

        const parsed = JSON.parse(fs.readFileSync(tempPath, 'utf8')) as {
            compilerOptions: { lib?: string[] };
        };

        assert.deepStrictEqual(parsed.compilerOptions.lib, ['es6', 'es2017', 'dom']);
    });

    test('writes enum compiler options as tsconfig string literals', async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-eslint-'));
        const baseTsconfigPath = path.join(tempDir, 'tsconfig.json');
        fs.writeFileSync(
            baseTsconfigPath,
            JSON.stringify({
                compilerOptions: {
                    target: 'ES2022',
                    module: 'commonjs',
                    moduleResolution: 'node',
                },
            })
        );

        const tempPath = await prepareTempTsConfig({
            baseTsconfigPath,
            includeGlobs: ['./generated/**/*.ts'],
            cwd: tempDir,
        });

        const parsed = JSON.parse(fs.readFileSync(tempPath, 'utf8')) as {
            compilerOptions: { target?: string; module?: string; moduleResolution?: string };
        };

        assert.strictEqual(parsed.compilerOptions.target, 'ES2022');
        assert.strictEqual(parsed.compilerOptions.module, 'commonjs');
        assert.strictEqual(parsed.compilerOptions.moduleResolution, 'node');
    });
});
