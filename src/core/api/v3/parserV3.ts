/* istanbul ignore file */
import type { Client } from '../../types/shared/Client.model';
import { getServiceVersion } from '../../utils/getServiceVersion';
import { Parser } from './Parser';
import { getServer } from './parser/getServer';
import type { OpenApi } from './types/OpenApi.model';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param context The context of application
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export function parse(this: Parser, openApi: OpenApi): Client {
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = this.getModels(openApi);
    const services = this.getServices(openApi);

    return { version, server, models, services };
}
