import { z } from 'zod';

import { GovernancePolicyConfig } from './evaluateGovernanceRules';

const GOVERNANCE_SEVERITIES = ['error', 'warning', 'info'] as const;

const allowListItemSchema = z
    .object({
        operation: z.string().min(1).optional(),
        path: z.string().min(1).optional(),
    })
    .strict()
    .superRefine((item, ctx) => {
        if (!item.operation && !item.path) {
            ctx.addIssue({
                code: 'custom',
                message: 'allowList item must define at least one of: operation or path',
                path: [],
            });
        }
    });

const governanceRuleConfigSchema = z
    .object({
        enabled: z.boolean().optional(),
        severity: z.enum(GOVERNANCE_SEVERITIES).optional(),
        allowList: z.array(allowListItemSchema).optional(),
    })
    .strict();

const governanceRulesSchema = z
    .object({
        NO_BREAKING_WITHOUT_FLAG: governanceRuleConfigSchema.optional(),
        REQUIRE_OPERATION_ID: governanceRuleConfigSchema.optional(),
        NO_DEFAULT_WITHOUT_2XX: governanceRuleConfigSchema.optional(),
    })
    .strict();

export const governancePolicyConfigSchema: z.ZodType<GovernancePolicyConfig> = z
    .object({
        rules: governanceRulesSchema.optional(),
    })
    .strict();
