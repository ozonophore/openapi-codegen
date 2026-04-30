import SwaggerParser from '@apidevtools/swagger-parser';
import path from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { getContent } from '../api/v3/parser/getContent';
import { Context } from '../Context';
import { evaluateGovernanceRules,GovernancePolicyConfig, GovernanceReport } from '../governance/evaluateGovernanceRules';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

type StrictIssueSeverity = 'error' | 'warning' | 'info';

type StrictIssue = {
    severity: StrictIssueSeverity;
    code: 'UNRESOLVED_REF' | 'CONTENT_MEDIA_TYPE_FALLBACK' | 'SUSPICIOUS_DEFAULT_RESPONSE' | 'MISSING_OPERATION_ID' | 'OPENAPI_PARSER_VALIDATION_FAILED';
    message: string;
    path: string;
};

type StrictSummary = {
    errors: number;
    warnings: number;
    info: number;
};

export type StrictOpenApiReport = {
    summary: StrictSummary;
    governance: GovernanceReport;
    issues: StrictIssue[];
};

type StrictValidationContext = Pick<Context, 'paths' | 'get' | 'exists'> &
    Partial<Pick<Context, 'getAllCanonicalRefs'>>;

type ValidateOpenApiStrictParams = {
    openApi: CommonOpenApi;
    context: StrictValidationContext;
    preIssues?: StrictIssue[];
    governanceConfig?: GovernancePolicyConfig;
};

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/**
 * Normalizes a media type value by:
 * 1) removing parameters after `;`
 * 2) trimming surrounding spaces
 * 3) converting to lowercase.
 */
function normalizeMediaType(mediaType: string): string {
    return mediaType.split(';')[0].trim().toLowerCase();
}

/**
 * Checks whether a response code key is an explicit success code.
 * Supports exact `2xx` numeric codes and OpenAPI range form `2XX`.
 */
function isSuccessResponseCode(responseCode: string): boolean {
    return /^\s*2\d\d\s*$/.test(responseCode) || /^\s*2xx\s*$/i.test(responseCode);
}

/**
 * Builds aggregated counters for report summary from collected issues.
 */
function createSummary(issues: StrictIssue[]): StrictSummary {
    return issues.reduce(
        (summary, issue) => {
            if (issue.severity === 'error') {
                summary.errors += 1;
            } else if (issue.severity === 'warning') {
                summary.warnings += 1;
            } else {
                summary.info += 1;
            }

            return summary;
        },
        { errors: 0, warnings: 0, info: 0 }
    );
}

/**
 * Extracts source file path from a canonical ref.
 * Example: `/spec/pet.yaml#/components/schemas/Pet` -> `/spec/pet.yaml`.
 */
function getSourceFileFromRef(ref: string): string {
    return ref.split('#')[0] || ref;
}

/**
 * Returns refs to traverse for strict `$ref` checks.
 *
 * Priority:
 * 1) Canonical refs from `context.getAllCanonicalRefs()` when available.
 * 2) Fallback to file-level refs from `context.paths()`.
 */
function getSchemaTraversalRefs(context: StrictValidationContext): string[] {
    if (typeof context.getAllCanonicalRefs === 'function') {
        const canonicalRefs = context.getAllCanonicalRefs();
        if (canonicalRefs.length > 0) {
            return canonicalRefs;
        }
    }

    return context.paths();
}

/**
 * Traverses resolved schemas and collects diagnostics for unresolved `$ref`.
 *
 * Uses Context methods:
 * - `getAllCanonicalRefs()` to iterate canonical refs with fragments (when available)
 * - `paths()` to iterate source schema files
 * - `get()` to load schema data
 * - `exists()` to validate each discovered `$ref`
 *
 * Duplicate diagnostics are removed via a local dedupe set.
 */
function collectUnresolvedRefIssues(context: StrictValidationContext): StrictIssue[] {
    const issues: StrictIssue[] = [];
    const dedupe = new Set<string>();

    const walk = (node: unknown, sourceFile: string, pathSegments: string[]): void => {
        if (!node || typeof node !== 'object') {
            return;
        }

        const objectNode = node as Record<string, unknown>;
        if (typeof objectNode.$ref === 'string') {
            const ref = objectNode.$ref;
            const isRefExists = context.exists(ref, sourceFile);

            if (!isRefExists) {
                const issuePath = `${sourceFile} ${pathSegments.join('.') || '$'}.$ref`;
                const dedupeKey = `${sourceFile}|${issuePath}|${ref}`;
                if (!dedupe.has(dedupeKey)) {
                    dedupe.add(dedupeKey);
                    issues.push({
                        severity: 'error',
                        code: 'UNRESOLVED_REF',
                        message: `Unresolved $ref: ${ref}`,
                        path: issuePath,
                    });
                }
            }
        }

        if (Array.isArray(node)) {
            node.forEach((item, index) => walk(item, sourceFile, [...pathSegments, `[${index}]`]));
            return;
        }

        for (const [key, value] of Object.entries(objectNode)) {
            walk(value, sourceFile, [...pathSegments, key]);
        }
    };

    const traversalRefs = getSchemaTraversalRefs(context);

    for (const traversalRef of traversalRefs) {
        try {
            const schema = context.get(traversalRef);
            const sourceFile = getSourceFileFromRef(traversalRef);
            walk(schema, sourceFile, []);
        } catch {
            // Ignore non-schema technical refs.
        }
    }

    return issues;
}

/**
 * Collects operation-level diagnostics:
 * - `info` for missing `operationId`
 * - `warning` for fallback media type selection
 * - `warning` for `default` response without explicit `2xx`.
 */
function collectOperationIssues(openApi: CommonOpenApi): StrictIssue[] {
    const issues: StrictIssue[] = [];
    const paths = openApi.paths as Record<string, Record<string, any>>;

    for (const [routePath, pathItem] of Object.entries(paths ?? {})) {
        for (const method of HTTP_METHODS) {
            const operation = pathItem?.[method];
            if (!operation || typeof operation !== 'object') {
                continue;
            }

            const operationPath = `${routePath} ${method.toUpperCase()}`;

            if (!operation.operationId) {
                issues.push({
                    severity: 'info',
                    code: 'MISSING_OPERATION_ID',
                    message: 'Operation does not define operationId.',
                    path: operationPath,
                });
            }

            const requestBodyContent = operation?.requestBody?.content;
            if (requestBodyContent && typeof requestBodyContent === 'object') {
                const selectedContent = getContent(requestBodyContent);
                if (selectedContent && normalizeMediaType(selectedContent.mediaType) !== 'application/json') {
                    issues.push({
                        severity: 'warning',
                        code: 'CONTENT_MEDIA_TYPE_FALLBACK',
                        message: `No application/json found, fallback media type selected: ${selectedContent.mediaType}`,
                        path: `${operationPath} requestBody.content`,
                    });
                }
            }

            const responses = operation?.responses as Record<string, any> | undefined;
            if (responses && typeof responses === 'object') {
                const responseCodes = Object.keys(responses);
                const hasDefaultResponse = responseCodes.includes('default');
                const hasExplicitSuccessResponse = responseCodes.some(isSuccessResponseCode);

                if (hasDefaultResponse && !hasExplicitSuccessResponse) {
                    issues.push({
                        severity: 'warning',
                        code: 'SUSPICIOUS_DEFAULT_RESPONSE',
                        message: 'Default response is used without an explicit 2xx response.',
                        path: `${operationPath} responses.default`,
                    });
                }

                for (const responseCode of responseCodes) {
                    const response = responses[responseCode];
                    const responseContent = response?.content;
                    if (!responseContent || typeof responseContent !== 'object') {
                        continue;
                    }

                    const selectedContent = getContent(responseContent);
                    if (selectedContent && normalizeMediaType(selectedContent.mediaType) !== 'application/json') {
                        issues.push({
                            severity: 'warning',
                            code: 'CONTENT_MEDIA_TYPE_FALLBACK',
                            message: `No application/json found, fallback media type selected: ${selectedContent.mediaType}`,
                            path: `${operationPath} responses.${responseCode}.content`,
                        });
                    }
                }
            }
        }
    }

    return issues;
}

/**
 * Runs SwaggerParser built-in `validate` and converts parser failure into strict issues.
 * This check complements (but does not replace) custom strict diagnostics.
 */
export async function validateWithSwaggerParser(inputPath: string): Promise<StrictIssue[]> {
    const parser = new SwaggerParser();
    const previousCwd = process.cwd();
    const inputDir = dirNameHelper(inputPath);

    if (previousCwd !== inputDir) {
        process.chdir(inputDir);
    }

    try {
        await parser.validate(inputPath);
        return [];
    } catch (error) {
        return [
            {
                severity: 'error',
                code: 'OPENAPI_PARSER_VALIDATION_FAILED',
                message: error instanceof Error ? error.message : String(error),
                path: inputPath,
            },
        ];
    } finally {
        if (process.cwd() !== previousCwd) {
            process.chdir(previousCwd);
        }
    }
}

/**
 * Runs strict OpenAPI diagnostics and returns a structured report.
 */
export function validateOpenApiStrict(params: ValidateOpenApiStrictParams): StrictOpenApiReport {
    const { openApi, context, preIssues = [], governanceConfig } = params;

    const issues = [...preIssues, ...collectUnresolvedRefIssues(context), ...collectOperationIssues(openApi)];
    const governance = evaluateGovernanceRules({
        openApi,
        allowBreaking: true,
        governanceConfig,
    });

    return {
        summary: createSummary(issues),
        governance,
        issues,
    };
}

/**
 * Writes strict diagnostics report to a JSON file and returns absolute file path.
 * Creates target directory if it does not exist.
 */
export async function writeOpenApiStrictReport(report: StrictOpenApiReport, reportFilePath: string): Promise<string> {
    const resolvedReportPath = resolveHelper(process.cwd(), reportFilePath);
    const reportDir = path.dirname(resolvedReportPath);

    const isReportDirExists = await fileSystemHelpers.exists(reportDir);
    if (!isReportDirExists) {
        await fileSystemHelpers.mkdir(reportDir);
    }

    const reportContent = await format(JSON.stringify(report), 'json');
    await fileSystemHelpers.writeFile(resolvedReportPath, reportContent);

    return resolvedReportPath;
}
