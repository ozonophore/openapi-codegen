import assert from 'node:assert';
import { describe, test } from 'node:test';

import { mergeNestedCliOptions } from '../../utils/parseNestedCliOptions';
import { mergeGenerateCliOverrides, pickDirectFlatCliInput } from '../generateCliOverrides';

describe('@unit: generateCliOverrides', () => {
    test('pickDirectFlatCliInput excludes root-only keys and uses Zod-transformed Marauder fields', () => {
        const picked = pickDirectFlatCliInput(
            {
                input: './spec.json',
                output: './out',
                httpClient: 'fetch',
                autoSelect: true,
                anomalyDetection: true,
                exploitAnomalies: true,
                tsconfigPath: './tsconfig.json',
                eslintConfigPath: './eslint.config.js',
                openapiConfig: './openapi.config.json',
            },
            {
                input: './validated-spec.json',
                output: './validated-out',
                autoSelect: { enabled: true, strict: true },
                anomalyDetection: { enabled: true },
                anomalyExploitation: { enabled: true },
            } as any
        );

        assert.strictEqual('openapiConfig' in picked, false);
        assert.strictEqual('exploitAnomalies' in picked, false);
        assert.strictEqual('tsconfigPath' in picked, false);
        assert.strictEqual('eslintConfigPath' in picked, false);
        assert.strictEqual(picked.httpClient, 'fetch');
        assert.strictEqual(picked.input, './validated-spec.json');
        assert.deepStrictEqual(picked.autoSelect, { enabled: true, strict: true });
        assert.deepStrictEqual(picked.anomalyExploitation, { enabled: true });
    });

    test('mergeGenerateCliOverrides deep-merges Marauder flags from CLI', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                autoSelect: { enabled: false, strict: true },
            } as any,
            { autoSelect: { enabled: true } } as any
        );

        assert.deepStrictEqual(merged.autoSelect, { enabled: true, strict: true });
    });

    test('mergeGenerateCliOverrides preserves config severity when CLI sets excludeCategories only', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                anomalyDetection: { enabled: true, severity: 'high', excludeCategories: ['missing-pagination'] },
            } as any,
            { anomalyDetection: { excludeCategories: ['deprecated-endpoints'] } } as any
        );

        assert.deepStrictEqual(merged.anomalyDetection, {
            enabled: true,
            severity: 'high',
            excludeCategories: ['deprecated-endpoints'],
        });
    });

    test('nested CLI exclude-categories does not wipe config severity', () => {
        const mergedCli = mergeNestedCliOptions({ input: './spec.json', output: './out' }, { anomalyDetection: { excludeCategories: 'missing-pagination' } });

        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                anomalyDetection: { enabled: true, severity: 'high' },
            } as any,
            mergedCli as any
        );

        assert.deepStrictEqual(merged.anomalyDetection, {
            enabled: true,
            severity: 'high',
            excludeCategories: 'missing-pagination',
        });
    });

    test('mergeGenerateCliOverrides fans out exploitAnomalies via pre-transformed CLI options', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                anomalyDetection: { enabled: false, failOnAnomalies: true },
                anomalyExploitation: { enabled: false, strategy: 'balanced' },
            } as any,
            {
                anomalyDetection: { enabled: true },
                anomalyExploitation: { enabled: true },
            } as any
        );

        assert.deepStrictEqual(merged.anomalyDetection, { enabled: true, failOnAnomalies: true });
        assert.deepStrictEqual(merged.anomalyExploitation, { enabled: true, strategy: 'balanced' });
    });
});
