import get from 'lodash-es/get'

import type { OpenApi } from '../types/OpenApi.model';

export function getServer(openApi: OpenApi): string {
    const server = openApi.servers?.[0];
    const variables = server?.variables || {};
    let url = server?.url || '';
    for (const variable in variables) {
        if (get(variables, variable, null)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url;
}
