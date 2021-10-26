/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';

export async function request(options: ApiRequestOptions): Promise<Record<string, any>> {
    const url = `${options.path}`;

    // Do your request...

    return {
        url,
        ok: true,
        status: 200,
        statusText: 'dummy',
        body: {
            ...options
        },
    };
}
