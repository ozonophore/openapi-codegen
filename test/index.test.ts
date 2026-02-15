import { describe, test } from 'node:test';

import { readFileSync } from 'fs';
import { sync } from 'glob';
import path from 'path';

import { generate, HttpClient } from '../src';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';
import { toMatchSnapshot } from './utils/toMatchSnapshot';

// Snapshot regression tests for core generation fixtures.
// Keep this file focused on broad output stability, not on feature-specific option behavior.
const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

describe('@unit: generate', () => {
    test('v2: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'v2.json');
        await generate({
            input,
            output: './test/generated/v2/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
            enumPrefix: "E",
            excludeCoreServiceFiles: false,
            interfacePrefix: "I",
            sortByRequired: true,
            typePrefix: "T",
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });
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
        const input = path.join(__dirname, 'spec', 'v3.json');
        await generate({
            input,
            output: './test/generated/v3/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
            enumPrefix: "E",
            excludeCoreServiceFiles: false,
            interfacePrefix: "I",
            sortByRequired: true,
            typePrefix: "T",
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });
        const generatedDir = path.join(process.cwd(), 'test', 'generated', 'v3');
        const files = sync(path.join(generatedDir, '**', '*.ts'));

        files.forEach(file => {
            const rel = path.relative(generatedDir, file);
            const snapPath = path.join(process.cwd(), 'test', '__snapshots__', 'v3', rel + '.snap');
            const content = readFileSync(file, 'utf8').toString();
            toMatchSnapshot(content, snapPath);
        });
    });

    test('v3withAlias: generated files match snapshots', async () => {
        const input = path.join(__dirname, 'spec', 'v3withAlias.yaml');
        await generate({
            input,
            output: './test/generated/v3withAlias/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
            enumPrefix: "E",
            excludeCoreServiceFiles: false,
            interfacePrefix: "I",
            sortByRequired: true,
            typePrefix: "T",
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });
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
        await generate({
            input,
            output: './test/generated/v3_withDifferentRefs/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
            enumPrefix: "E",
            excludeCoreServiceFiles: false,
            interfacePrefix: "I",
            sortByRequired: true,
            typePrefix: "T",
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });
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
        await generate({
            input,
            output: './test/generated/lom_api/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.JSONSCHEMA,
            enumPrefix: "E",
            excludeCoreServiceFiles: false,
            interfacePrefix: "I",
            sortByRequired: true,
            typePrefix: "T",
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });
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
