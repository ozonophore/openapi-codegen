/* istanbul ignore file */
import type { Client } from '../../client/interfaces/Client';
import { Context } from '../../core/Context';
import type { OpenApi } from './interfaces/OpenApi';
import { getModels } from './parser/getModels';
import { getServer } from './parser/getServer';
import { getServices } from './parser/getServices';
import { getServiceVersion } from './parser/getServiceVersion';
import { Parser } from './Parser';

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
