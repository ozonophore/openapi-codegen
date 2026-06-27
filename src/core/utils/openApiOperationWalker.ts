import { safeHasOwn } from '../../common/utils/safeHasOwn';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { isSuccessResponseCode } from './isSuccessResponseCode';

export const OPENAPI_HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export type OpenApiHttpMethod = (typeof OPENAPI_HTTP_METHODS)[number];

const OPENAPI_HTTP_METHODS_SET = new Set<string>(OPENAPI_HTTP_METHODS);
const CODEGEN_HTTP_METHODS_SET = new Set<string>(OPENAPI_HTTP_METHODS.filter(method => method !== 'trace'));

export type OpenApiOperationWalkContext = {
    path: string;
    method: OpenApiHttpMethod;
    operation: Record<string, unknown>;
    pathItem: Record<string, unknown>;
};

/**
 * Checks whether response key is an explicit successful HTTP status code key.
 */
export function isExplicitSuccessResponseCode(responseCode: string): boolean {
    return isSuccessResponseCode(responseCode);
}

/**
 * Iterates HTTP operations on a path item in object declaration order.
 */
export function forEachOperationInPath(
    pathItem: Record<string, unknown>,
    callback: (method: string, operation: Record<string, unknown>) => void,
    allowedMethods: ReadonlySet<string> = CODEGEN_HTTP_METHODS_SET
): void {
    for (const method in pathItem) {
        if (!safeHasOwn(pathItem, method)) {
            continue;
        }
        if (!allowedMethods.has(method)) {
            continue;
        }

        const operation = pathItem[method];
        if (!operation || typeof operation !== 'object') {
            continue;
        }

        callback(method, operation as Record<string, unknown>);
    }
}

/**
 * Iterates supported HTTP methods on a single OpenAPI path item in canonical method order.
 */
function forEachOperationInPathItem(
    pathItem: Record<string, unknown>,
    callback: (method: OpenApiHttpMethod, operation: Record<string, unknown>) => void,
    methods: readonly OpenApiHttpMethod[] = OPENAPI_HTTP_METHODS
): void {
    for (const method of methods) {
        if (!OPENAPI_HTTP_METHODS_SET.has(method)) {
            continue;
        }

        const operation = pathItem[method];
        if (!operation || typeof operation !== 'object') {
            continue;
        }

        callback(method, operation as Record<string, unknown>);
    }
}

/**
 * Iterates all operations in an OpenAPI spec paths map.
 */
export function forEachOperationInSpec(spec: CommonOpenApi | Record<string, unknown>, callback: (context: OpenApiOperationWalkContext) => void): void {
    const specRecord = spec as Record<string, unknown>;
    const paths = (specRecord.paths as Record<string, unknown> | undefined) ?? {};

    for (const [path, pathItemRaw] of Object.entries(paths)) {
        const pathItem = (pathItemRaw as Record<string, unknown>) ?? {};

        forEachOperationInPathItem(pathItem, (method, operation) => {
            callback({ path, method, operation, pathItem });
        });
    }
}
