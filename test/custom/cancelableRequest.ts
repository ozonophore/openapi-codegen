/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';

export function request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return new CancelablePromise((resolve, reject, onCancel) => {
        const url = `${options.path}`;
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