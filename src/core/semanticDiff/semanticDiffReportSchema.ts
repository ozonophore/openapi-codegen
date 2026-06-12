import { validate } from 'json-schema';
import { JSONSchema7 } from 'json-schema';

import { UNIFIED_DIFF_REPORT_SCHEMA_VERSION } from '../types/DiffReport.model';

/**
 * Результат валидации diff-отчёта по JSON Schema.
 * @property valid признак успешной валидации
 * @property errors список ошибок валидации
 */
export type SemanticDiffReportSchemaValidationResult = {
    valid: boolean;
    errors: string[];
};

/** JSON Schema контракт унифицированного diff-отчёта. */
const semanticDiffReportJsonSchema: JSONSchema7 = {
    type: 'object',
    additionalProperties: false,
    properties: {
        schemaVersion: {
            type: 'string',
            enum: [UNIFIED_DIFF_REPORT_SCHEMA_VERSION],
            required: true as never,
        },
        timestamp: {
            type: 'string',
            minLength: 1,
            required: true as never,
        },
        metadata: {
            type: 'object',
            additionalProperties: false,
            required: true as never,
            properties: {
                base: { type: 'string', minLength: 1, required: true as never },
                target: { type: 'string', minLength: 1, required: true as never },
                baseHash: { type: 'string', minLength: 1, required: true as never },
                targetHash: { type: 'string', minLength: 1, required: true as never },
            },
        },
        semantic: {
            type: 'object',
            additionalProperties: false,
            required: true as never,
            properties: {
                summary: {
                    type: 'object',
                    additionalProperties: false,
                    required: true as never,
                    properties: {
                        breaking: { type: 'integer', minimum: 0, required: true as never },
                        nonBreaking: { type: 'integer', minimum: 0, required: true as never },
                        informational: { type: 'integer', minimum: 0, required: true as never },
                    },
                },
                recommendation: {
                    type: 'object',
                    additionalProperties: false,
                    required: true as never,
                    properties: {
                        semver: {
                            type: 'string',
                            enum: ['major', 'minor', 'patch'],
                            required: true as never,
                        },
                        confidence: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            required: true as never,
                        },
                        reason: {
                            type: 'string',
                            minLength: 1,
                            required: true as never,
                        },
                        reasons: {
                            type: 'array',
                            minItems: 1,
                            required: true as never,
                            items: {
                                type: 'string',
                                enum: ['HAS_BREAKING_CHANGES', 'HAS_BACKWARD_COMPATIBLE_CHANGES', 'HAS_INFORMATIONAL_ONLY_CHANGES', 'NO_API_SURFACE_CHANGES'],
                            },
                        },
                    },
                },
                governance: {
                    type: 'object',
                    additionalProperties: false,
                    required: true as never,
                    properties: {
                        summary: {
                            type: 'object',
                            additionalProperties: false,
                            required: true as never,
                            properties: {
                                errors: { type: 'integer', minimum: 0, required: true as never },
                                warnings: { type: 'integer', minimum: 0, required: true as never },
                                info: { type: 'integer', minimum: 0, required: true as never },
                            },
                        },
                        violations: {
                            type: 'array',
                            required: true as never,
                            items: {
                                type: 'object',
                                additionalProperties: false,
                                properties: {
                                    ruleId: { type: 'string', minLength: 1, required: true as never },
                                    severity: {
                                        type: 'string',
                                        enum: ['error', 'warning', 'info'],
                                        required: true as never,
                                    },
                                    message: { type: 'string', minLength: 1, required: true as never },
                                    path: { type: 'string', minLength: 1, required: true as never },
                                },
                            },
                        },
                    },
                },
                changes: {
                    type: 'array',
                    required: true as never,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            type: { type: 'string', minLength: 1, required: true as never },
                            severity: {
                                type: 'string',
                                enum: ['breaking', 'non-breaking', 'informational'],
                                required: true as never,
                            },
                            message: { type: 'string', minLength: 1, required: true as never },
                            path: { type: 'string', minLength: 1, required: true as never },
                            from: {},
                            to: {},
                            fromRequired: { type: 'boolean' },
                            toRequired: { type: 'boolean' },
                            fromNullable: { type: 'boolean' },
                            toNullable: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        structural: {
            type: 'object',
            additionalProperties: false,
            required: true as never,
            properties: {
                diff: {
                    type: 'object',
                    additionalProperties: false,
                    required: true as never,
                    properties: {
                        breaking: { type: 'array', required: true as never, items: { type: 'object' } },
                        warnings: { type: 'array', required: true as never, items: { type: 'object' } },
                        info: { type: 'array', required: true as never, items: { type: 'object' } },
                        all: { type: 'array', required: true as never, items: { type: 'object' } },
                    },
                },
                miracles: {
                    type: 'array',
                    required: true as never,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            oldPath: { type: 'string', minLength: 1, required: true as never },
                            newPath: { type: 'string', minLength: 1, required: true as never },
                            type: {
                                type: 'string',
                                enum: ['RENAME', 'TYPE_COERCION'],
                                required: true as never,
                            },
                            confidence: { type: 'number', minimum: 0, maximum: 1, required: true as never },
                            status: {
                                type: 'string',
                                enum: ['auto-generated', 'confirmed'],
                                required: true as never,
                            },
                            modelName: { type: 'string' },
                            oldProperty: { type: 'string' },
                            newProperty: { type: 'string' },
                        },
                    },
                },
                stats: {
                    type: 'object',
                    additionalProperties: false,
                    required: true as never,
                    properties: {
                        totalChanges: { type: 'integer', minimum: 0, required: true as never },
                        added: { type: 'integer', minimum: 0, required: true as never },
                        removed: { type: 'integer', minimum: 0, required: true as never },
                        changed: { type: 'integer', minimum: 0, required: true as never },
                        ignored: { type: 'integer', minimum: 0 },
                        stabilityScore: { type: 'integer', minimum: 0, maximum: 100, required: true as never },
                    },
                },
            },
        },
    },
};

/**
 * Валидирует payload diff-отчёта по JSON Schema контракту.
 * @param report проверяемый отчёт
 * @returns результат валидации с перечнем ошибок
 */
export function validateSemanticDiffReportSchema(report: unknown): SemanticDiffReportSchemaValidationResult {
    if (report === null || typeof report !== 'object') {
        return {
            valid: false,
            errors: ['root: report must be an object'],
        };
    }

    const result = validate(report, semanticDiffReportJsonSchema);

    return {
        valid: result.valid,
        errors: result.errors.map(error => `${error.property}: ${error.message}`),
    };
}
