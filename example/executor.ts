/**
 * Example customExecutorPath module — ky-based RequestExecutor adapter.
 *
 * Config:
 *   "customExecutorPath": "./example/executor.ts"
 *
 * Export must be named `createExecutorAdapter` with the generated signature.
 * Imports below resolve to the generated client after `openapi-codegen-cli generate`.
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { KyResponse, Options as KyOptions } from 'ky';
import ky from 'ky';

// @ts-ignore — generated after codegen
import type { ApiResult } from './ApiResult';
// @ts-ignore
import type { TOpenAPIConfig } from './OpenAPI';
// @ts-ignore
import { OpenAPI } from './OpenAPI';
// @ts-ignore
import type { RequestConfig, RequestExecutor } from './requestExecutor';

function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {
    return value !== undefined && value !== null;
}

function buildUrl(config: RequestConfig, openApiConfig: TOpenAPIConfig): string {
    const url = new URL(`${openApiConfig.BASE}${config.path}`);

    if (config.query) {
        Object.entries(config.query).forEach(([key, value]) => {
            if (!isDefined(value)) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (isDefined(item)) {
                        url.searchParams.append(key, String(item));
                    }
                });
                return;
            }

            url.searchParams.set(key, String(value));
        });
    }

    return url.toString();
}

function buildBody(config: RequestConfig): string | FormData | Blob | undefined {
    if (!isDefined(config.body)) {
        return undefined;
    }

    if (config.body instanceof FormData || config.body instanceof Blob || typeof config.body === 'string') {
        return config.body;
    }

    return JSON.stringify(config.body);
}

async function buildResponseBody(response: KyResponse<unknown>, config: RequestConfig): Promise<unknown> {
    try {
        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

        if (config.responseType === 'blob') {
            return await response.blob();
        }

        if (contentType.includes('application/json')) {
            return await response.json();
        }

        if (contentType) {
            return await response.text();
        }
    } catch (error) {
        console.error(error);
    }

    return null;
}

async function executeKyRequest<T>(
    config: RequestConfig,
    openApiConfig: TOpenAPIConfig,
    kyOptions?: KyOptions,
): Promise<ApiResult<T>> {
    const url = buildUrl(config, openApiConfig);
    const response = await ky(url, {
        ...kyOptions,
        throwHttpErrors: false,
        method: config.method,
        headers: {
            Accept: 'application/json',
            ...(config.requestMediaType ? { 'Content-Type': config.requestMediaType } : {}),
            ...(config.headers ?? {}),
            ...(kyOptions?.headers as Record<string, string> | undefined),
        },
        body: buildBody(config),
        credentials: openApiConfig.WITH_CREDENTIALS ? 'include' : 'same-origin',
    });
    const responseBody = await buildResponseBody(response, config);

    return {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: responseBody as T,
    };
}

function throwOnErrorStatus<T>(result: ApiResult<T>): void {
    if (!result.ok) {
        throw { status: result.status, body: result.body };
    }
}

/**
 * Ky-based adapter (codegen D + runtime R1, M7 with mapOptions).
 * Uses throwHttpErrors: false so requestRaw returns ApiResult for 4xx/5xx;
 * request() throws { status, body } for apiErrorInterceptor → ApiError.
 *
 * @param openApiConfig - Runtime OpenAPI settings (BASE, TOKEN, HEADERS, etc.)
 * @param mapOptions - Maps typed per-request options into ky Options
 */
export function createExecutorAdapter<TRequestOptions extends KyOptions = KyOptions>(
    openApiConfig: TOpenAPIConfig = OpenAPI,
    mapOptions?: (options: TRequestOptions | undefined) => Partial<KyOptions>,
): RequestExecutor<TRequestOptions> {
    const resolveKyOptions = (options?: TRequestOptions): KyOptions | undefined => {
        if (!options && !mapOptions) {
            return undefined;
        }

        return {
            ...(mapOptions ? mapOptions(options) : {}),
            ...(options ?? {}),
        };
    };

    return {
        async request<T>(config: RequestConfig, options?: TRequestOptions): Promise<T> {
            const result = await executeKyRequest<T>(config, openApiConfig, resolveKyOptions(options));
            throwOnErrorStatus(result);
            return result.body;
        },

        async requestRaw<T>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<T>> {
            return executeKyRequest<T>(config, openApiConfig, resolveKyOptions(options));
        },
    };
}
