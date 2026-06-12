import { getContent } from '../api/v3/parser/getContent';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { forEachOperationInSpec, isExplicitSuccessResponseCode } from '../utils/openApiOperationWalker';

export type OperationDiagnosticRuleId = 'REQUIRE_OPERATION_ID' | 'NO_DEFAULT_WITHOUT_2XX' | 'CONTENT_MEDIA_TYPE_FALLBACK';

export type OperationDiagnosticSeverity = 'error' | 'warning' | 'info';

export type OperationDiagnostic = {
    ruleId: OperationDiagnosticRuleId;
    severity: OperationDiagnosticSeverity;
    path: string;
    message: string;
    operationPath: string;
};

const STRICT_SEVERITIES: Record<OperationDiagnosticRuleId, OperationDiagnosticSeverity> = {
    REQUIRE_OPERATION_ID: 'info',
    NO_DEFAULT_WITHOUT_2XX: 'warning',
    CONTENT_MEDIA_TYPE_FALLBACK: 'warning',
};

/**
 * Normalizes a media type value by removing parameters after `;`, trimming spaces, and lowercasing.
 */
function normalizeMediaType(mediaType: string): string {
    return mediaType.split(';')[0].trim().toLowerCase();
}

/**
 * Collects shared operation-level diagnostics for strict mode and governance rules.
 */
export function collectOperationDiagnostics(openApi: CommonOpenApi): OperationDiagnostic[] {
    const diagnostics: OperationDiagnostic[] = [];

    forEachOperationInSpec(openApi, ({ path: routePath, method, operation }) => {
        const operationPath = `${routePath} ${method.toUpperCase()}`;

        if (!operation.operationId) {
            diagnostics.push({
                ruleId: 'REQUIRE_OPERATION_ID',
                severity: STRICT_SEVERITIES.REQUIRE_OPERATION_ID,
                message: 'Operation does not define operationId.',
                path: operationPath,
                operationPath,
            });
        }

        const requestBodyContent = operation.requestBody as { content?: Record<string, unknown> } | undefined;
        if (requestBodyContent?.content && typeof requestBodyContent.content === 'object') {
            const selectedContent = getContent(requestBodyContent.content as Parameters<typeof getContent>[0]);
            if (selectedContent && normalizeMediaType(selectedContent.mediaType) !== 'application/json') {
                diagnostics.push({
                    ruleId: 'CONTENT_MEDIA_TYPE_FALLBACK',
                    severity: STRICT_SEVERITIES.CONTENT_MEDIA_TYPE_FALLBACK,
                    message: `No application/json found, fallback media type selected: ${selectedContent.mediaType}`,
                    path: `${operationPath} requestBody.content`,
                    operationPath,
                });
            }
        }

        const responses = operation.responses as Record<string, unknown> | undefined;
        if (!responses || typeof responses !== 'object') {
            return;
        }

        const responseCodes = Object.keys(responses);
        const hasDefaultResponse = responseCodes.includes('default');
        const hasExplicitSuccessResponse = responseCodes.some(isExplicitSuccessResponseCode);

        if (hasDefaultResponse && !hasExplicitSuccessResponse) {
            diagnostics.push({
                ruleId: 'NO_DEFAULT_WITHOUT_2XX',
                severity: STRICT_SEVERITIES.NO_DEFAULT_WITHOUT_2XX,
                message: 'Default response is used without an explicit 2xx response.',
                path: `${operationPath} responses.default`,
                operationPath,
            });
        }

        for (const responseCode of responseCodes) {
            const response = responses[responseCode] as { content?: Record<string, unknown> } | undefined;
            const responseContent = response?.content;
            if (!responseContent || typeof responseContent !== 'object') {
                continue;
            }

            const selectedContent = getContent(responseContent as Parameters<typeof getContent>[0]);
            if (selectedContent && normalizeMediaType(selectedContent.mediaType) !== 'application/json') {
                diagnostics.push({
                    ruleId: 'CONTENT_MEDIA_TYPE_FALLBACK',
                    severity: STRICT_SEVERITIES.CONTENT_MEDIA_TYPE_FALLBACK,
                    message: `No application/json found, fallback media type selected: ${selectedContent.mediaType}`,
                    path: `${operationPath} responses.${responseCode}.content`,
                    operationPath,
                });
            }
        }
    });

    return diagnostics;
}
