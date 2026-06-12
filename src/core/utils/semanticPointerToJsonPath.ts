import { toJsonPath } from '../../common/utils/jsonPath';

const HTTP_METHODS = new Set(['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE']);
const OPERATION_SUFFIX_MARKERS = ['parameters', 'requestBody', 'responses'] as const;

/**
 * Splits semantic operation pointer tail into operation key and nested suffix segments.
 */
function splitOperationPointerTail(tail: string): { operationKey: string; suffix: string[] } {
    for (const marker of OPERATION_SUFFIX_MARKERS) {
        const markerIndex = tail.indexOf(`/${marker}`);
        if (markerIndex > 0) {
            return {
                operationKey: tail.slice(0, markerIndex),
                suffix: [
                    marker,
                    ...tail
                        .slice(markerIndex + marker.length + 1)
                        .split('/')
                        .filter(Boolean),
                ],
            };
        }
    }

    return { operationKey: tail, suffix: [] };
}

/**
 * Parses semantic operation key "GET /pets" into HTTP method and route path.
 */
function parseOperationKey(operationKey: string): { method: string; routePath: string } | null {
    const match = operationKey.match(/^(GET|PUT|POST|DELETE|OPTIONS|HEAD|PATCH|TRACE)\s+(\S+)$/i);
    if (!match) {
        return null;
    }

    const method = match[1].toLowerCase();
    const routePath = match[2];
    if (!HTTP_METHODS.has(match[1].toUpperCase())) {
        return null;
    }

    return { method, routePath };
}

const decodePointerSegment = (segment: string): string => segment.replace(/~1/g, '/').replace(/~0/g, '~');

/**
 * Преобразует семантический JSON Pointer в legacy JSONPath, используемый генератором.
 * @param pointer JSON Pointer или уже готовый JSONPath
 * @returns legacy JSONPath
 */
export function semanticPointerToJsonPath(pointer: string): string {
    if (pointer.startsWith('$')) {
        return pointer;
    }

    if (!pointer.startsWith('#/')) {
        return pointer;
    }

    const body = pointer.slice(2);

    if (body.startsWith('paths/')) {
        const tail = body.slice('paths/'.length);
        const { operationKey, suffix } = splitOperationPointerTail(tail);
        const parsedOperation = parseOperationKey(operationKey);

        if (parsedOperation) {
            return toJsonPath(['paths', parsedOperation.routePath, parsedOperation.method, ...suffix]);
        }
    }

    const rawSegments = body.split('/').map(decodePointerSegment);
    return toJsonPath(rawSegments);
}
