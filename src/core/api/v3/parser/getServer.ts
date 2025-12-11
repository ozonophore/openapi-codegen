import { safeHasOwn } from '../../../../common/utils/safeHasOwn';
import type { OpenApi } from '../types/OpenApi.model';

export function getServer(openApi: OpenApi): string {
    const server = openApi.servers?.[0];
    const variables = server?.variables || {};
    let url = server?.url || '';
    for (const variable in variables) {
        if (safeHasOwn(variables, variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url;
}
