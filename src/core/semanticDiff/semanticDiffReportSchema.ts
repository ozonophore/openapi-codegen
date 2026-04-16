import { validate } from 'json-schema';
import { JSONSchema7 } from 'json-schema';

import { SEMANTIC_DIFF_REPORT_SCHEMA_VERSION } from './analyzeOpenApiDiff';

export type SemanticDiffReportSchemaValidationResult = {
    valid: boolean;
    errors: string[];
};

export const semanticDiffReportJsonSchema: JSONSchema7 = {
    type: 'object',
    additionalProperties: false,
    properties: {
        schemaVersion: {
            type: 'string',
            enum: [SEMANTIC_DIFF_REPORT_SCHEMA_VERSION],
            required: true as never,
        },
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
                        enum: [
                            'HAS_BREAKING_CHANGES',
                            'HAS_BACKWARD_COMPATIBLE_CHANGES',
                            'HAS_INFORMATIONAL_ONLY_CHANGES',
                            'NO_API_SURFACE_CHANGES',
                        ],
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
                },
            },
        },
    },
};

/**
 * Validates semantic diff report payload by JSON Schema contract.
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
