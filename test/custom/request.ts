/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

// @ts-ignore
import { ApiError } from './ApiError';
// @ts-ignore
import type { ApiResult } from './ApiResult';
// @ts-ignore
import type { ApiRequestOptions } from './ApiRequestOptions';
// @ts-ignore
import type { TOpenAPIConfig } from './OpenAPI';
// @ts-ignore
import { EHTTP_STATUS_CODES, EHTTP_STATUS_NAME } from './HttpStatusCode';

function getHeaders(options: ApiRequestOptions, config: TOpenAPIConfig): Record<string, unknown> {
    return {};
}

function getRequestBody(options: ApiRequestOptions) {
    return undefined;
}

function getResponseHeader(response: Response, responseHeader?: string): string | null {
    return null;
}

async function getResponseBody(response: Response): Promise<any> {
    try {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            const isJSON = contentType.toLowerCase().startsWith('application/json');
            if (isJSON) {
                return await response.json();
            } else {
                return await response.text();
            }
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

function toRequestConfig(options: ApiRequestOptions) {
    return {
        method: options.method,
        path: options.path,
        headers: options.headers,
        query: options.query,
        body: options.body,
    };
}

function catchErrors(options: ApiRequestOptions, result: ApiResult): void {
    const errors: Record<string, string> = {
        [EHTTP_STATUS_CODES.BAD_GATEWAY]: EHTTP_STATUS_NAME.BAD_GATEWAY,
        [EHTTP_STATUS_CODES.BAD_REQUEST]: EHTTP_STATUS_NAME.BAD_REQUEST,
        [EHTTP_STATUS_CODES.FORBIDDEN]: EHTTP_STATUS_NAME.FORBIDDEN,
        [EHTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: EHTTP_STATUS_NAME.INTERNAL_SERVER_ERROR,
        [EHTTP_STATUS_CODES.NOT_FOUND]: EHTTP_STATUS_NAME.NOT_FOUND,
        [EHTTP_STATUS_CODES.SERVICE_UNAVAILABLE]: EHTTP_STATUS_NAME.SERVICE_UNAVAILABLE,
        [EHTTP_STATUS_CODES.UNAUTHORIZED]: EHTTP_STATUS_NAME.UNAUTHORIZED,
        ...options.errors,
    };

    const error = errors[result.status];
    if (error) {
        throw new ApiError({
            status: result.status,
            message: error,
            body: result.body,
            request: toRequestConfig(options),
        });
    }

    if (!result.ok) {
        throw new ApiError({
            status: result.status,
            message: 'Generic Error',
            body: result.body,
            request: toRequestConfig(options),
        });
    }
}

async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig): Promise<Response> {
    const request: RequestInit = {
        method: options.method,
        headers: getHeaders(options, config) as any,
        body: getRequestBody(options),
    };

    return await fetch(url, request);
}

function buildUrl(options: ApiRequestOptions, config: TOpenAPIConfig): string {
    const path = options.path.replace('{api-version}', config.VERSION);
    return `${config.BASE}${path}`;
}

export async function request<T>(options: ApiRequestOptions, config: TOpenAPIConfig): Promise<T> {
    const result = await requestRaw<T>(options, config);
    return result.body;
}

export async function requestRaw<T>(options: ApiRequestOptions, config: TOpenAPIConfig): Promise<ApiResult<T>> {
    const url = buildUrl(options, config);
    const response = await sendRequest(options, url, config);
    const responseBody = await getResponseBody(response);
    const responseHeader = getResponseHeader(response, options.responseHeader);

    const result: ApiResult<T> = {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: (responseHeader || responseBody) as T,
    };

    catchErrors(options, result);
    return result;
}
