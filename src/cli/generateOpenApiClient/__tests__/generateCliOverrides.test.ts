import assert from 'node:assert';
import { describe, test } from 'node:test';

import { mergeNestedCliOptions } from '../../utils/parseNestedCliOptions';
import { mergeGenerateCliOverrides, pickDirectFlatCliInput } from '../generateCliOverrides';

describe('@unit: generateCliOverrides', () => {
    test('pickDirectFlatCliInput excludes root-only keys and uses Zod-validated Marauder fields', () => {
        const picked = pickDirectFlatCliInput(
            {
                input: './spec.json',
                output: './out',
                httpClient: 'fetch',
                autoSelect: true,
                specAnalysis: true,
                anomalyDetection: true,
                tsconfigPath: './tsconfig.json',
                eslintConfigPath: './eslint.config.js',
                openapiConfig: './openapi.config.json',
            },
            {
                input: './validated-spec.json',
                output: './validated-out',
                autoSelect: { enabled: true, strict: true },
                specAnalysis: { enabled: true },
                anomalyDetection: { enabled: true },
            } as any
        );

        assert.strictEqual('openapiConfig' in picked, false);
        assert.strictEqual('tsconfigPath' in picked, false);
        assert.strictEqual('eslintConfigPath' in picked, false);
        assert.strictEqual(picked.httpClient, 'fetch');
        assert.strictEqual(picked.input, './validated-spec.json');
        assert.deepStrictEqual(picked.autoSelect, { enabled: true, strict: true });
        assert.deepStrictEqual(picked.specAnalysis, { enabled: true });
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
                specAnalysis: { enabled: true, severity: 'high', excludeCategories: ['deeply-nested-schema'] },
            } as any,
            { specAnalysis: { excludeCategories: ['missing-operation-id'] } } as any
        );

        assert.deepStrictEqual(merged.specAnalysis, {
            enabled: true,
            severity: 'high',
            excludeCategories: ['missing-operation-id'],
        });
    });

    test('mergeGenerateCliOverrides preserves config cacheStrategy when CLI omits flag', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                cacheStrategy: 'entity',
            } as any,
            { input: './spec.json', output: './out' } as any
        );

        assert.strictEqual(merged.cacheStrategy, 'entity');
    });

    test('mergeGenerateCliOverrides preserves config reuseOnConflict when CLI omits flag', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                reuseOnConflict: 'namespace',
            } as any,
            { input: './spec.json', output: './out' } as any
        );

        assert.strictEqual(merged.reuseOnConflict, 'namespace');
    });

    test('nested CLI exclude-categories does not wipe config severity', () => {
        const mergedCli = mergeNestedCliOptions({ input: './spec.json', output: './out' }, { specAnalysis: { excludeCategories: 'deeply-nested-schema' } });

        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                specAnalysis: { enabled: true, severity: 'high' },
            } as any,
            mergedCli as any
        );

        assert.deepStrictEqual(merged.specAnalysis, {
            enabled: true,
            severity: 'high',
            excludeCategories: 'deeply-nested-schema',
        });
    });

    test('mergeGenerateCliOverrides resolves specAnalysis from CLI and deprecated anomalyDetection alias', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                anomalyDetection: { enabled: false, failOnAnomalies: true },
            } as any,
            {
                specAnalysis: { enabled: true },
                anomalyDetection: { severity: 'high' },
            } as any
        );

        assert.deepStrictEqual(merged.specAnalysis, {
            enabled: true,
            failOnHigh: true,
            severity: 'high',
        });
    });

    test('mergeGenerateCliOverrides preserves config modelsMode when CLI omits flag', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                modelsMode: 'classes',
                modelsLayout: 'per-file',
            } as any,
            { input: './spec.json', output: './out' } as any
        );

        assert.strictEqual(merged.modelsMode, 'classes');
        assert.strictEqual(merged.modelsLayout, 'per-file');
    });

    test('mergeGenerateCliOverrides lets explicit CLI modelsMode win over config', () => {
        const merged = mergeGenerateCliOverrides(
            {
                input: './spec.json',
                output: './out',
                modelsMode: 'classes',
            } as any,
            { modelsMode: 'interfaces' } as any
        );

        assert.strictEqual(merged.modelsMode, 'interfaces');
    });
});
