/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ApiError } from './ApiError';
import type { ApiResult } from './ApiResult';
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { TOpenAPIConfig } from './OpenAPI';
import { CancelablePromise } from './CancelablePromise';
import { EHTTP_STATUS_CODES, EHTTP_STATUS_NAME } from './HttpStatusCode';

function getHeaders(options: ApiRequestOptions, config: TOpenAPIConfig): Record<string, unknown> {
    // Добавь свою логику сбора данных для заголовков
    return {}
}

function getRequestBody(options: ApiRequestOptions) {
    // Добавь свою логику сбора данных для тела запроса
    return undefined
}

function getResponseHeader(response: Response, responseHeader?: string): string | null {
    // Добавь свою логику сбора данных для формирования заголовков ответа
    return null
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
    }

    const error = errors[result.status];
    if (error) {
        throw new ApiError(result, error);
    }

    if (!result.ok) {
        throw new ApiError(result, 'Generic Error');
    }
}

async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig, onCancel: (cancelHandler: () => void) => void): Promise<Response> {
    const controller = new AbortController();
    const request: RequestInit = {
        method: options.method,
        headers: getHeaders(options, config) as any,
        body: getRequestBody(options),
        signal: controller.signal,
    };

    onCancel(() => controller.abort());

    return await fetch(url, request);
}

export function request<T>(config: TOpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise(async(resolve, reject, onCancel) => {
        const url = `${config.BASE}${options.path}`.replace('{api-version}', config.VERSION);
        try {
            if (!onCancel.isCancelled) {
                const response = await sendRequest(options, url, config, onCancel);
                const responseBody = await getResponseBody(response);
                const responseHeader = getResponseHeader(response, options.responseHeader);
                const result: ApiResult = {
                    url,
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    body: responseHeader || responseBody,
                };

                catchErrors(options, result);
                resolve(result.body);
            }
        } catch (e) {
            reject(e);
        }
    });
}
