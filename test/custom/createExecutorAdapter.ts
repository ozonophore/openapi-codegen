/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

// @ts-ignore
import type { ApiRequestOptions } from '../ApiRequestOptions';
// @ts-ignore
import type { ApiResult } from '../ApiResult';
// @ts-ignore
import type { TOpenAPIConfig } from '../OpenAPI';
// @ts-ignore
import { OpenAPI } from '../OpenAPI';
// @ts-ignore
import { request as transportRequest, requestRaw as transportRequestRaw } from '../request';
// @ts-ignore
import type { RequestConfig,RequestExecutor } from './requestExecutor';

export function createExecutorAdapter<TRequestOptions extends Record<string, any> = Record<string, never>>(
    openApiConfig: TOpenAPIConfig = OpenAPI,
    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,
): RequestExecutor<TRequestOptions> {
    const toApiRequestOptions = (config: RequestConfig): ApiRequestOptions => ({
        method: config.method as ApiRequestOptions['method'],
        path: config.path,
        headers: config.headers,
        query: config.query,
        body: config.body,
        cookies: config.cookies,
        mediaType: config.requestMediaType,
        responseType: config.responseType,
    });

    const toMergedOptions = (config: RequestConfig, options?: TRequestOptions): ApiRequestOptions => ({
        ...toApiRequestOptions(config),
        ...(mapOptions ? mapOptions(options) : {}),
    });

    return {
        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {
            return transportRequest<TResponse>(toMergedOptions(config, options), openApiConfig);
        },
        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {
            return transportRequestRaw<TResponse>(toMergedOptions(config, options), openApiConfig);
        },
    };
}
