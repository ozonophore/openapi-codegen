/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';

export function request<T>(options: ApiRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
        try {
            const url = `${options.path}`;

            // Do your request...

            resolve({ ...options });
        } catch (error) {
            reject(error);
        }
    })
}