import assert from 'node:assert';
import { describe, test, type TestContext } from 'node:test';

import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs';
import path from 'path';

import { generate, HttpClient } from '../src';
import { EmptySchemaStrategy } from '../src/core/types/enums/EmptySchemaStrategy.enum';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';

// Focused behavioral tests for emptySchemaStrategy across validation libraries.
// Assertions are targeted to stable snippets/files instead of full snapshots.
const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

type StrategyCase = {
    label: string;
    validationLibrary: ValidationLibrary;
    semanticNeedle: string;
    keepNeedle: string;
};

const cases: StrategyCase[] = [
    {
        label: 'zod',
        validationLibrary: ValidationLibrary.ZOD,
        semanticNeedle: 'z.object({}).catchall(z.unknown())',
        keepNeedle: 'z.object({});',
    },
    {
        label: 'joi',
        validationLibrary: ValidationLibrary.JOI,
        semanticNeedle: 'Joi.object().unknown(true)',
        keepNeedle: 'Joi.object({});',
    },
    {
        label: 'yup',
        validationLibrary: ValidationLibrary.YUP,
        semanticNeedle: 'yup.object().noUnknown(false)',
        keepNeedle: 'yup.object({});',
    },
    {
        label: 'jsonschema',
        validationLibrary: ValidationLibrary.JSONSCHEMA,
        semanticNeedle: 'additionalProperties: true',
        keepNeedle: 'properties: {},',
    },
];

function createOutputPath(t: TestContext, label: string, strategy: EmptySchemaStrategy): string {
    const generatedRoot = path.join(process.cwd(), 'test', 'generated', 'empty_schema_strategy');
    mkdirSync(generatedRoot, { recursive: true });
    const baseDir = path.join(generatedRoot, `${label}-${strategy}-`);
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

function getLomSchemaPath(outputPath: string): string {
    return path.join(outputPath, 'schemas', 'LomApiSchema.ts');
}

function getRootIndexPath(outputPath: string): string {
    return path.join(outputPath, 'index.ts');
}

describe('@unit: emptySchemaStrategy', () => {
    for (const testCase of cases) {
        test(`${testCase.label}: keep`, async (t: TestContext) => {
            const output = createOutputPath(t, testCase.label, EmptySchemaStrategy.KEEP);
            await generate({
                input: path.join(__dirname, 'spec', 'lom', 'lom_api.yaml'),
                output,
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                validationLibrary: testCase.validationLibrary,
                emptySchemaStrategy: EmptySchemaStrategy.KEEP,
                enumPrefix: 'E',
                excludeCoreServiceFiles: false,
                interfacePrefix: 'I',
                sortByRequired: true,
                typePrefix: 'T',
                useCancelableRequest: false,
                useSeparatedIndexes: false,
            });

            const content = readFileSync(getLomSchemaPath(output), 'utf8');
            assert.ok(content.includes(testCase.keepNeedle));
        });

        test(`${testCase.label}: semantic`, async (t: TestContext) => {
            const output = createOutputPath(t, testCase.label, EmptySchemaStrategy.SEMANTIC);
            await generate({
                input: path.join(__dirname, 'spec', 'lom', 'lom_api.yaml'),
                output,
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                validationLibrary: testCase.validationLibrary,
                emptySchemaStrategy: EmptySchemaStrategy.SEMANTIC,
                enumPrefix: 'E',
                excludeCoreServiceFiles: false,
                interfacePrefix: 'I',
                sortByRequired: true,
                typePrefix: 'T',
                useCancelableRequest: false,
                useSeparatedIndexes: false,
            });

            const content = readFileSync(getLomSchemaPath(output), 'utf8');
            assert.ok(content.includes(testCase.semanticNeedle));
        });

        test(`${testCase.label}: skip`, async (t: TestContext) => {
            const output = createOutputPath(t, testCase.label, EmptySchemaStrategy.SKIP);
            await generate({
                input: path.join(__dirname, 'spec', 'lom', 'lom_api.yaml'),
                output,
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                validationLibrary: testCase.validationLibrary,
                emptySchemaStrategy: EmptySchemaStrategy.SKIP,
                enumPrefix: 'E',
                excludeCoreServiceFiles: false,
                interfacePrefix: 'I',
                sortByRequired: true,
                typePrefix: 'T',
                useCancelableRequest: false,
                useSeparatedIndexes: false,
            });

            const schemaPath = getLomSchemaPath(output);
            assert.ok(!existsSync(schemaPath));

            const rootIndex = readFileSync(getRootIndexPath(output), 'utf8');
            assert.ok(!rootIndex.includes('LomApiSchema'));
        });
    }
});
