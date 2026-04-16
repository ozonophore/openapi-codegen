import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

type GovernanceSeverity = 'error' | 'warning' | 'info';

export type GovernanceRuleId = 'NO_BREAKING_WITHOUT_FLAG' | 'REQUIRE_OPERATION_ID' | 'NO_DEFAULT_WITHOUT_2XX';

type GovernanceSummary = {
    errors: number;
    warnings: number;
    info: number;
};

export type GovernanceViolation = {
    ruleId: GovernanceRuleId;
    severity: GovernanceSeverity;
    message: string;
    path: string;
};

export type GovernanceReport = {
    summary: GovernanceSummary;
    violations: GovernanceViolation[];
};

export type GovernanceAllowListItem = {
    operation?: string;
    path?: string;
};

export type GovernanceRuleConfig = {
    enabled?: boolean;
    severity?: GovernanceSeverity;
    allowList?: GovernanceAllowListItem[];
};

export type GovernancePolicyConfig = {
    rules?: Partial<Record<GovernanceRuleId, GovernanceRuleConfig>>;
};

type GovernanceInput = {
    openApi: CommonOpenApi;
    allowBreaking?: boolean;
    breakingChangesCount?: number;
    governanceConfig?: GovernancePolicyConfig;
};

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/**
 * Checks whether response key is an explicit successful HTTP status code key.
 */
function isSuccessResponseCode(responseCode: string): boolean {
    return /^\s*2\d\d\s*$/.test(responseCode) || /^\s*2xx\s*$/i.test(responseCode);
}

/**
 * Builds governance summary counters from violations.
 */
function buildSummary(violations: GovernanceViolation[]): GovernanceSummary {
    return violations.reduce(
        (summary, violation) => {
            if (violation.severity === 'error') {
                summary.errors += 1;
            } else if (violation.severity === 'warning') {
                summary.warnings += 1;
            } else {
                summary.info += 1;
            }

            return summary;
        },
        {
            errors: 0,
            warnings: 0,
            info: 0,
        }
    );
}

type RuleDefaults = {
    enabled: boolean;
    severity: GovernanceSeverity;
};

const RULE_DEFAULTS: Record<GovernanceRuleId, RuleDefaults> = {
    NO_BREAKING_WITHOUT_FLAG: {
        enabled: true,
        severity: 'error',
    },
    REQUIRE_OPERATION_ID: {
        enabled: true,
        severity: 'warning',
    },
    NO_DEFAULT_WITHOUT_2XX: {
        enabled: true,
        severity: 'warning',
    },
};

/**
 * Resolves effective rule config using defaults overridden by user policy.
 */
function getEffectiveRuleConfig(ruleId: GovernanceRuleId, governanceConfig?: GovernancePolicyConfig): Required<GovernanceRuleConfig> {
    const defaults = RULE_DEFAULTS[ruleId];
    const configuredRule = governanceConfig?.rules?.[ruleId] ?? {};

    return {
        enabled: configuredRule.enabled ?? defaults.enabled,
        severity: configuredRule.severity ?? defaults.severity,
        allowList: Array.isArray(configuredRule.allowList) ? configuredRule.allowList : [],
    };
}

/**
 * Returns true when violation is allowed by operation/path allow list.
 */
function isViolationAllowed(
    allowList: GovernanceAllowListItem[],
    operation: string | undefined,
    violationPath: string
): boolean {
    return allowList.some(item => {
        const operationAllowed = typeof item.operation === 'string' && operation ? item.operation === operation : false;
        const pathAllowed =
            typeof item.path === 'string' && item.path.trim().length > 0
                ? violationPath === item.path || violationPath.startsWith(item.path)
                : false;

        return operationAllowed || pathAllowed;
    });
}

/**
 * Evaluates governance rules and returns machine-readable violations.
 */
export function evaluateGovernanceRules(params: GovernanceInput): GovernanceReport {
    const { openApi, allowBreaking = false, breakingChangesCount = 0, governanceConfig } = params;
    const violations: GovernanceViolation[] = [];

    const noBreakingRule = getEffectiveRuleConfig('NO_BREAKING_WITHOUT_FLAG', governanceConfig);
    if (noBreakingRule.enabled && !allowBreaking && breakingChangesCount > 0) {
        const violationPath = '#/summary/breaking';
        if (!isViolationAllowed(noBreakingRule.allowList, undefined, violationPath)) {
            violations.push({
                ruleId: 'NO_BREAKING_WITHOUT_FLAG',
                severity: noBreakingRule.severity,
                message: `Breaking changes are not allowed without explicit allow flag. Found ${breakingChangesCount}.`,
                path: violationPath,
            });
        }
    }

    const paths = (openApi as unknown as Record<string, unknown>).paths as Record<string, unknown> | undefined;
    for (const [routePath, pathItemRaw] of Object.entries(paths ?? {})) {
        const pathItem = (pathItemRaw as Record<string, unknown>) ?? {};

        for (const method of HTTP_METHODS) {
            const operationRaw = pathItem[method];
            if (!operationRaw || typeof operationRaw !== 'object') {
                continue;
            }

            const operation = operationRaw as Record<string, unknown>;
            const operationPath = `${routePath} ${method.toUpperCase()}`;

            const requireOperationIdRule = getEffectiveRuleConfig('REQUIRE_OPERATION_ID', governanceConfig);
            if (requireOperationIdRule.enabled && !operation.operationId) {
                if (!isViolationAllowed(requireOperationIdRule.allowList, operationPath, operationPath)) {
                    violations.push({
                        ruleId: 'REQUIRE_OPERATION_ID',
                        severity: requireOperationIdRule.severity,
                        message: 'Operation must define operationId.',
                        path: operationPath,
                    });
                }
            }

            const responses = operation.responses as Record<string, unknown> | undefined;
            if (!responses || typeof responses !== 'object') {
                continue;
            }

            const responseCodes = Object.keys(responses);
            const hasDefaultResponse = responseCodes.includes('default');
            const hasSuccessResponse = responseCodes.some(isSuccessResponseCode);
            const noDefaultWithout2xxRule = getEffectiveRuleConfig('NO_DEFAULT_WITHOUT_2XX', governanceConfig);
            if (noDefaultWithout2xxRule.enabled && hasDefaultResponse && !hasSuccessResponse) {
                const violationPath = `${operationPath} responses.default`;
                if (!isViolationAllowed(noDefaultWithout2xxRule.allowList, operationPath, violationPath)) {
                    violations.push({
                        ruleId: 'NO_DEFAULT_WITHOUT_2XX',
                        severity: noDefaultWithout2xxRule.severity,
                        message: 'Default response is present without an explicit 2xx response.',
                        path: violationPath,
                    });
                }
            }
        }
    }

    return {
        summary: buildSummary(violations),
        violations,
    };
}
