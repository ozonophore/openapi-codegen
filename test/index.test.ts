import assert from 'node:assert';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs';
import { sync } from 'glob';
import path from 'path';

import { generate, HttpClient } from '../src';
import type { TRawOptions } from '../src/common/TRawOptions';
import { ModelsMode } from '../src/core/types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';
import { installSilenceLoggers } from '../src/test/helpers/silenceLoggers';
import { toMatchSnapshot } from './utils/toMatchSnapshot';

// Snapshot regression tests for core generation fixtures.
// Keep this file focused on broad output stability, not on feature-specific option behavior.
const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

const v3Spec = path.join(__dirname, 'spec', 'v3.json');

function defaultGenerateOptions(
    overrides: Pick<TRawOptions, 'input' | 'output'> & Partial<TRawOptions>,
): TRawOptions {
    return {
        httpClient: HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        validationLibrary: ValidationLibrary.NONE,
        enumPrefix: 'E',
        excludeCoreServiceFiles: false,
        interfacePrefix: 'I',
        sortByRequired: true,
        typePrefix: 'T',
        useCancelableRequest: false,
        useSeparatedIndexes: false,
        useHistory: false,
        ...overrides,
    };
}

function createVariantOutputDir(t: TestContext, label: string): string {
    const generatedRoot = path.join(process.cwd(), 'test', 'generated', 'option_variants');
    mkdirSync(generatedRoot, { recursive: true });
    const baseDir = path.join(generatedRoot, `${label}-`);
    const outputDir = mkdtempSync(baseDir);
    t.after(() => {
        rmSync(outputDir, { recursive: true, force: true });
        try {
            if (readdirSync(generatedRoot).length === 0) {
                rmSync(generatedRoot, { recursive: true, force: true });
            }
        } catch {
            // Ignore: directory may already be removed by another test cleanup.
        }
    });
    return outputDir;
}

describe('@unit: generate', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('v2: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'v2.json');
        await generate(defaultGenerateOptions({
            input,
            output: './test/generated/v2/',
        }));
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'v2');
        const files = sync(path.join(generatedDir, '**', '*.ts'));

        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'v2', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

    test('v3: generated files match snapshots', async () => {
        await generate(defaultGenerateOptions({
            input: v3Spec,
            output: './test/generated/v3/',
        }));
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'v3');
        const files = sync(path.join(generatedDir, '**', '*.ts'));

        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'v3', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

    test('v3: modelsMode=classes generates models.ts and BaseDto', async () => {
        const output = './test/generated/v3-classes/';

        await generate(defaultGenerateOptions({
            input: v3Spec,
            output,
            modelsMode: ModelsMode.CLASSES,
        }));

        const modelsFile = path.join(process.cwd(), 'test', 'generated', 'v3-classes', 'models', 'models.ts');
        const coreBaseDto = path.join(process.cwd(), 'test', 'generated', 'v3-classes', 'core', 'BaseDto.ts');

        const modelsContent = readFileSync(modelsFile, 'utf8');
        const baseDtoContent = readFileSync(coreBaseDto, 'utf8');

        assert.ok(modelsContent.includes('export class'), 'Expected models.ts to contain class exports');
        assert.ok(modelsContent.includes('Raw'), 'Expected models.ts to contain Raw interfaces');
        assert.ok(baseDtoContent.includes('abstract class BaseDto'), 'Expected BaseDto.ts to be generated');
    });

    test('v3withAlias: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'v3withAlias.yaml');
        await generate(defaultGenerateOptions({
            input,
            output: './test/generated/v3withAlias/',
        }));
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'v3withAlias');
        const files = sync(path.join(generatedDir, '**', '*.ts'));
        
        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'v3withAlias', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

    test('v3_withDifferentRefs: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'v3.withDifferentRefs.yml');
        await generate(defaultGenerateOptions({
            input,
            output: './test/generated/v3_withDifferentRefs/',
        }));
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'v3_withDifferentRefs');
        const files = sync(path.join(generatedDir, '**', '*.ts'));
        
        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'v3_withDifferentRefs', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

    test('lom_api: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'lom', 'lom_api.yaml');
        await generate(defaultGenerateOptions({
            input,
            output: './test/generated/lom_api/',
            validationLibrary: ValidationLibrary.JSONSCHEMA,
            customExecutorPath: './example/executor.ts',
        }));
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'lom_api');
        const files = sync(path.join(generatedDir, '**', '*.ts'));
        
        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'lom_api', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

});

describe('@unit: generate option variants', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('useOptions: generates options-object parameters', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'use-options');
        await generate(defaultGenerateOptions({ input: v3Spec, output, useOptions: true }));

        const parametersService = readFileSync(path.join(output, 'services', 'ParametersService.ts'), 'utf8');
        assert.match(parametersService, /public callWithParameters\(\s*\{[\s\S]*\}:\s*\{/);
    });

    test('useUnionTypes: emits union literals instead of nested enums', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'use-union-types');
        await generate(defaultGenerateOptions({ input: v3Spec, output, useUnionTypes: true }));

        const modelWithEnum = readFileSync(path.join(output, 'models', 'ModelWithEnum.ts'), 'utf8');
        assert.ok(modelWithEnum.includes("'Success' | 'Warning' | 'Error'"));
        assert.ok(!modelWithEnum.includes('export enum'));
    });

    test('useSeparatedIndexes: writes per-section indexes', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'use-separated-indexes');
        await generate(defaultGenerateOptions({ input: v3Spec, output, useSeparatedIndexes: true }));

        const rootIndex = readFileSync(path.join(output, 'index.ts'), 'utf8');
        assert.ok(existsSync(path.join(output, 'core', 'index.ts')));
        assert.ok(existsSync(path.join(output, 'services', 'index.ts')));
        assert.ok(rootIndex.includes("export *  from '././core'"));
        assert.ok(rootIndex.includes("export *  from '././services'"));
    });

    test('useCancelableRequest: wraps return types', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'use-cancelable-request');
        await generate(defaultGenerateOptions({ input: v3Spec, output, useCancelableRequest: true }));

        const responseService = readFileSync(path.join(output, 'services', 'ResponseService.ts'), 'utf8');
        assert.ok(existsSync(path.join(output, 'core', 'CancelablePromise.ts')));
        assert.ok(responseService.includes('CancelablePromise<'));
    });

    test('httpClient=xhr: uses XMLHttpRequest transport', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'http-client-xhr');
        await generate(defaultGenerateOptions({ input: v3Spec, output, httpClient: HttpClient.XHR }));

        const request = readFileSync(path.join(output, 'core', 'request.ts'), 'utf8');
        assert.ok(request.includes('XMLHttpRequest'));
    });

    test('excludeCoreServiceFiles: skips core and services', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'exclude-core-service-files');
        await generate(defaultGenerateOptions({ input: v3Spec, output, excludeCoreServiceFiles: true }));

        assert.ok(!existsSync(path.join(output, 'services')));
        assert.ok(!existsSync(path.join(output, 'core')));
        assert.ok(existsSync(path.join(output, 'models', 'ModelWithString.ts')));
    });

    test('custom prefixes: applied to model names', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'custom-prefixes');
        await generate(defaultGenerateOptions({
            input: v3Spec,
            output,
            interfacePrefix: 'X',
            enumPrefix: 'Y',
            typePrefix: 'Z',
        }));

        const modelWithString = readFileSync(path.join(output, 'models', 'ModelWithString.ts'), 'utf8');
        const enumWithNumbers = readFileSync(path.join(output, 'models', 'EnumWithNumbers.ts'), 'utf8');
        const modelThatExtends = readFileSync(path.join(output, 'models', 'ModelThatExtends.ts'), 'utf8');
        assert.ok(modelWithString.includes('export interface XModelWithString'));
        assert.ok(enumWithNumbers.includes('export enum YEnumWithNumbers'));
        assert.ok(modelThatExtends.includes('export type ZModelThatExtends'));
    });

    test('custom output paths: respects outputCore/Services/Models', async (t: TestContext) => {
        const output = createVariantOutputDir(t, 'custom-output-paths');
        const outputCore = path.join(output, 'lib', 'core');
        const outputServices = path.join(output, 'lib', 'services');
        const outputModels = path.join(output, 'lib', 'models');
        await generate(defaultGenerateOptions({
            input: v3Spec,
            output,
            outputCore,
            outputServices,
            outputModels,
        }));

        assert.ok(existsSync(path.join(output, 'createClient.ts')));
        assert.ok(existsSync(path.join(outputCore, 'request.ts')));
        assert.ok(existsSync(path.join(outputServices, 'ResponseService.ts')));
        assert.ok(existsSync(path.join(outputModels, 'ModelWithString.ts')));
    });
});
