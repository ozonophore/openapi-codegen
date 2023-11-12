/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { TOpenAPIConfig } from './OpenAPI';
import { CancelablePromise } from './CancelablePromise';

export function request<T>(config: TOpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise((resolve, reject, onCancel) => {
        const url = `${config.BASE}${options.path}`.replace('{api-version}', config.VERSION);
        try {
            // Do your request...

            const timeout = setTimeout(() => {
                resolve({ ...options });
            }, 500);

            // Cancel your request...
            onCancel(() => {
                clearTimeout(timeout);
            });
        } catch (e) {
            reject(e);
        }
    });
}
