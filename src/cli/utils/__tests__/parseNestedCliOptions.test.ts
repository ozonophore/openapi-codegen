import assert from 'node:assert';
import { describe, test } from 'node:test';

import { mergeNestedCliOptions, parseNestedCliOptions } from '../parseNestedCliOptions';

const baseArgv = ['node', 'openapi-codegen'];

describe('@unit: parseNestedCliOptions', () => {
    test('parses dot-notation flags into nested objects', () => {
        const { cleanedArgv, nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out', '--auto-select.strict']);

        assert.deepStrictEqual(cleanedArgv, [...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out']);
        assert.deepStrictEqual(nestedOptions.autoSelect, { strict: true });
    });

    test('parses dot-notation with explicit values and kebab-case fields', () => {
        const { nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '--anomaly-detection.fail-on-anomalies=false', '--auto-select.prefer-standards=true']);

        assert.deepStrictEqual(nestedOptions.anomalyDetection, { failOnAnomalies: false });
        assert.deepStrictEqual(nestedOptions.autoSelect, { preferStandards: true });
    });

    test('parses JSON object values for Marauder groups', () => {
        const { cleanedArgv, nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '--auto-select', '{"strict":true,"preferStandards":true}']);

        assert.deepStrictEqual(cleanedArgv, [...baseArgv, 'generate']);
        assert.deepStrictEqual(nestedOptions.autoSelect, { strict: true, preferStandards: true, enabled: true });
    });

    test('parses inline JSON via equals syntax', () => {
        const { nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '--auto-select={"strict":true}']);

        assert.deepStrictEqual(nestedOptions.autoSelect, { strict: true, enabled: true });
    });

    test('parses inline boolean true via equals syntax', () => {
        const { cleanedArgv, nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out', '--auto-select=true']);

        assert.deepStrictEqual(nestedOptions.autoSelect, { enabled: true });
        assert.deepStrictEqual(cleanedArgv, [...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out']);
    });

    test('parses inline boolean false via equals syntax', () => {
        const { cleanedArgv, nestedOptions } = parseNestedCliOptions([...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out', '--auto-select=false']);

        assert.deepStrictEqual(nestedOptions.autoSelect, { enabled: false });
        assert.deepStrictEqual(cleanedArgv, [...baseArgv, 'generate', '-i', 'spec.json', '-o', 'out']);
    });

    test('leaves boolean shorthand flags for Commander', () => {
        const { cleanedArgv } = parseNestedCliOptions([...baseArgv, 'generate', '--auto-select', '--spec-analysis']);

        assert.deepStrictEqual(cleanedArgv, [...baseArgv, 'generate', '--auto-select', '--spec-analysis']);
    });

    test('throws on invalid JSON', () => {
        assert.throws(() => parseNestedCliOptions([...baseArgv, 'generate', '--auto-select', '{invalid']), /Invalid JSON for --auto-select/);
    });
});

describe('@unit: mergeNestedCliOptions', () => {
    test('merges nested dot-flags with boolean CLI shorthand', () => {
        const merged = mergeNestedCliOptions({ autoSelect: true }, { autoSelect: { strict: true } });

        assert.deepStrictEqual(merged.autoSelect, { enabled: true, strict: true });
    });

    test('merges nested dot-flags with existing object options', () => {
        const merged = mergeNestedCliOptions({ anomalyDetection: { enabled: false, reportPath: './report.json' } }, { anomalyDetection: { failOnAnomalies: true } });

        assert.deepStrictEqual(merged.anomalyDetection, {
            enabled: false,
            reportPath: './report.json',
            failOnAnomalies: true,
        });
    });
});
