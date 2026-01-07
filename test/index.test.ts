import { describe, test } from 'node:test';

import { readFileSync } from 'fs';
import { sync } from 'glob';
import path from 'path';

import { generate, HttpClient } from '../src';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';
import { toMatchSnapshot } from './utils/toMatchSnapshot';

describe('@unit: generate', () => {
    test('v2: generated files match snapshots', async () => {
        await generate({
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.JSONSCHEMA,
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
        await generate({
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.JSONSCHEMA,
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
});
