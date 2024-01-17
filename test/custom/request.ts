/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { TOpenAPIConfig } from './OpenAPI';

export function request<T>(config: TOpenAPIConfig, options: ApiRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
        try {
            const url = `${config.BASE}${options.path}`.replace('{api-version}', config.VERSION);

            // Do your request...

            resolve({ ...options });
        } catch (error) {
            reject(error);
        }
    })
}