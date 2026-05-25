import assert from 'node:assert';
import { describe, test } from 'node:test';

import { evaluateGovernanceRules } from '../evaluateGovernanceRules';

describe('@unit: evaluateGovernanceRules', () => {
    test('returns no violations for compliant spec without breaking changes', () => {
        const report = evaluateGovernanceRules({
            openApi: {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            operationId: 'getUsers',
                            responses: {
                                '200': {
                                    description: 'ok',
                                },
                            },
                        },
                    },
                },
            } as any,
            breakingChangesCount: 0,
            allowBreaking: false,
        });

        assert.deepStrictEqual(report.summary, {
            errors: 0,
            warnings: 0,
            info: 0,
        });
        assert.deepStrictEqual(report.violations, []);
    });

    test('returns violations for breaking flag, missing operationId and default-only response', () => {
        const report = evaluateGovernanceRules({
            openApi: {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            responses: {
                                default: {
                                    description: 'fallback',
                                },
                            },
                        },
                    },
                },
            } as any,
            breakingChangesCount: 2,
            allowBreaking: false,
        });

        assert.ok(report.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(report.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(report.violations.some(violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX'));
        assert.ok(report.summary.errors > 0);
        assert.ok(report.summary.warnings > 0);
    });

    test('applies enabled, severity and allowList overrides from config', () => {
        const report = evaluateGovernanceRules({
            openApi: {
                openapi: '3.0.0',
                paths: {
                    '/users': {
                        get: {
                            responses: {
                                default: {
                                    description: 'fallback',
                                },
                            },
                        },
                    },
                },
            } as any,
            breakingChangesCount: 1,
            allowBreaking: false,
            governanceConfig: {
                rules: {
                    NO_BREAKING_WITHOUT_FLAG: {
                        enabled: false,
                    },
                    REQUIRE_OPERATION_ID: {
                        severity: 'error',
                        allowList: [{ operation: '/users GET' }],
                    },
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'error',
                    },
                },
            },
        });

        assert.ok(!report.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG'));
        assert.ok(!report.violations.some(violation => violation.ruleId === 'REQUIRE_OPERATION_ID'));
        assert.ok(
            report.violations.some(
                violation => violation.ruleId === 'NO_DEFAULT_WITHOUT_2XX' && violation.severity === 'error'
            )
        );
        assert.strictEqual(report.summary.errors, 1);
    });
});
