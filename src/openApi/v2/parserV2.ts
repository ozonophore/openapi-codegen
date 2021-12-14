/* istanbul ignore file */
import type { Client } from '../../client/interfaces/Client';
import type { OpenApi } from './interfaces/OpenApi';
import { Parser } from './Parser';
import { getServer } from './parser/getServer';
import { getServiceVersion } from './parser/getServiceVersion';

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
