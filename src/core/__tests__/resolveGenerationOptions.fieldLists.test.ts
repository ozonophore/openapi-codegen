import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { resolveGenerationOptions } from '../resolveGenerationOptions';

const golden = JSON.parse(readFileSync(join(__dirname, 'fixtures/resolveGenerationOptions.golden.json'), 'utf8')) as Record<string, unknown>;

/** Same inputs used to generate the golden snapshot (bit-identical gate). */
const fixtureInputs: Record<string, unknown> = {
    flatMinimal: { input: './a.yaml', output: './out', httpClient: 'fetch' },
    flatWithFalsyStrings: {
        input: './a.yaml',
        output: './out',
        httpClient: 'fetch',
        request: '',
        customExecutorPath: '',
        interfacePrefix: '',
        useOptions: false,
        strictOpenapi: false,
    },
    itemsInherit: {
        httpClient: 'xhr',
        useOptions: true,
        request: './root-req.ts',
        plugins: ['./root.cjs'],
        interfacePrefix: 'RI',
        modelsMode: 'classes',
        modelsLayout: 'per-file',
        useHistory: true,
        diffReport: './root-diff.json',
        strictPluginMode: true,
        items: [
            { input: './a.yaml', output: './out-a' },
            {
                input: './b.yaml',
                output: './out-b',
                request: './b-req.ts',
                interfacePrefix: 'BI',
                plugins: ['./b.cjs'],
                strictPluginMode: false,
                modelsMode: 'interfaces',
            },
        ],
    },
    nestedAliases: {
        input: './a.yaml',
        output: './out',
        httpClient: 'fetch',
        models: { mode: 'classes', layout: 'per-file' },
        analyze: { useHistory: true, reportPath: './from-analyze.json' },
    },
};

describe('@unit: resolveGenerationOptions field lists', () => {
    for (const name of Object.keys(fixtureInputs)) {
        test(`golden: ${name}`, () => {
            const actual = resolveGenerationOptions(fixtureInputs[name] as Parameters<typeof resolveGenerationOptions>[0]);
            assert.deepEqual(actual, golden[name]);
        });
    }
});
