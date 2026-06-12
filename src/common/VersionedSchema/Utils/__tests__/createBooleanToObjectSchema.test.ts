import assert from 'node:assert';
import { describe, test } from 'node:test';

import { z } from 'zod';

import { createBooleanToObjectSchema, createOptionalBooleanToObjectSchema, normalizeMarauderBoolean } from '../createBooleanToObjectSchema';

describe('@unit: createBooleanToObjectSchema', () => {
    describe('Boolean transformation', () => {
        test('transforms true to { enabled: true }', () => {
            const schema = createBooleanToObjectSchema(z.object({ enabled: z.boolean() }));
            const result = schema.parse(true);
            assert.deepStrictEqual(result, { enabled: true });
        });

        test('transforms false to { enabled: false }', () => {
            const schema = createBooleanToObjectSchema(z.object({ enabled: z.boolean() }));
            const result = schema.parse(false);
            assert.deepStrictEqual(result, { enabled: false });
        });
    });

    describe('Object passthrough', () => {
        test('passes through object unchanged', () => {
            const testObject = { enabled: true, strict: true };
            const schema = createBooleanToObjectSchema(
                z.object({
                    enabled: z.boolean().optional(),
                    strict: z.boolean().optional(),
                })
            );
            const result = schema.parse(testObject);
            assert.deepStrictEqual(result, testObject);
        });

        test('preserves nested object fields', () => {
            const testObject = {
                enabled: false,
                strategy: 'aggressive' as const,
                outputPath: '/tmp/output',
            };
            const schema = createBooleanToObjectSchema(
                z.object({
                    enabled: z.boolean().optional(),
                    strategy: z.enum(['aggressive', 'balanced', 'conservative']).optional(),
                    outputPath: z.string().optional(),
                })
            );
            const result = schema.parse(testObject);
            assert.deepStrictEqual(result, testObject);
        });
    });

    describe('Undefined handling', () => {
        test('passes undefined through', () => {
            const schema = createBooleanToObjectSchema(z.object({ enabled: z.boolean() }).optional());
            const result = schema.parse(undefined);
            assert.strictEqual(result, undefined);
        });
    });

    describe('Validation', () => {
        test('validates transformed object against schema', () => {
            const schema = createBooleanToObjectSchema(
                z.object({
                    enabled: z.boolean(),
                    strict: z.boolean().optional(),
                })
            );

            // Valid
            assert.doesNotThrow(() => schema.parse(true));
            assert.doesNotThrow(() => schema.parse({ enabled: true, strict: false }));

            // Invalid (missing required field after transform)
            assert.throws(() =>
                schema.parse({
                    // enabled is missing, should fail
                    strict: true,
                })
            );
        });
    });

    describe('Real-world Marauder schemas', () => {
        test('works with autoSelectConfigSchema pattern', () => {
            const autoSelectConfigSchema = z.object({
                enabled: z.boolean().optional(),
                strict: z.boolean().optional(),
                preferSmallBundles: z.boolean().optional(),
                preferStandards: z.boolean().optional(),
            });

            const schema = createBooleanToObjectSchema(autoSelectConfigSchema);

            // CLI boolean flag
            assert.deepStrictEqual(schema.parse(true), { enabled: true });
            assert.deepStrictEqual(schema.parse(false), { enabled: false });

            // Config file object
            assert.deepStrictEqual(schema.parse({ enabled: true, strict: true }), {
                enabled: true,
                strict: true,
            });
        });

        test('works with anomalyDetectionConfigSchema pattern', () => {
            const anomalyDetectionConfigSchema = z.object({
                enabled: z.boolean().optional(),
                severity: z.enum(['low', 'medium', 'high']).optional(),
                reportPath: z.string().optional(),
            });

            const schema = createBooleanToObjectSchema(anomalyDetectionConfigSchema);

            assert.deepStrictEqual(schema.parse(true), { enabled: true });
            assert.deepStrictEqual(schema.parse({ enabled: false, severity: 'high' }), {
                enabled: false,
                severity: 'high',
            });
        });
    });
});

describe('@unit: createOptionalBooleanToObjectSchema', () => {
    test('returns optional schema', () => {
        const schema = createOptionalBooleanToObjectSchema(z.object({ enabled: z.boolean() }));

        assert.deepStrictEqual(schema.parse(true), { enabled: true });
        assert.strictEqual(schema.parse(undefined), undefined);
    });

    test('allows undefined without error', () => {
        const schema = createOptionalBooleanToObjectSchema(z.object({ enabled: z.boolean().optional() }));

        assert.doesNotThrow(() => schema.parse(undefined));
    });
});

describe('@unit: normalizeMarauderBoolean', () => {
    describe('Boolean transformation', () => {
        test('transforms true to { enabled: true }', () => {
            const result = normalizeMarauderBoolean(true);
            assert.deepStrictEqual(result, { enabled: true });
        });

        test('transforms false to { enabled: false }', () => {
            const result = normalizeMarauderBoolean(false);
            assert.deepStrictEqual(result, { enabled: false });
        });
    });

    describe('Object passthrough', () => {
        test('passes through object unchanged', () => {
            const testObject = { enabled: true, strict: true };
            const result = normalizeMarauderBoolean(testObject);
            assert.strictEqual(result, testObject);
        });
    });

    describe('Undefined handling', () => {
        test('passes undefined through', () => {
            const result = normalizeMarauderBoolean(undefined);
            assert.strictEqual(result, undefined);
        });
    });

    describe('Real-world usage patterns', () => {
        test('handles CLI boolean merge pattern', () => {
            // Simulating: mergeAutoSelectConfig(cli.autoSelect, config.autoSelect)
            const cliBoolean = true;
            const configObject = { enabled: false, strict: true };

            const normalizedCli = normalizeMarauderBoolean(cliBoolean);
            const normalizedConfig = normalizeMarauderBoolean(configObject);

            // Deep merge pattern
            const merged = {
                ...normalizeMarauderBoolean(normalizedConfig),
                enabled: normalizeMarauderBoolean(normalizedCli)?.enabled,
            };

            assert.deepStrictEqual(merged, { enabled: true, strict: true });
        });

        test('handles config migration pattern', () => {
            // Simulating: normalizeMarauderConfigBlocks for migration
            const data = {
                autoSelect: true,
                specAnalysis: { enabled: false, severity: 'high' },
                anomalyDetection: undefined,
            };

            const normalized = {
                autoSelect: normalizeMarauderBoolean(data.autoSelect),
                specAnalysis: normalizeMarauderBoolean(data.specAnalysis),
                anomalyDetection: normalizeMarauderBoolean(data.anomalyDetection),
            };

            assert.deepStrictEqual(normalized, {
                autoSelect: { enabled: true },
                specAnalysis: { enabled: false, severity: 'high' },
                anomalyDetection: undefined,
            });
        });
    });
});
