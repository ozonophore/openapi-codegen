/* istanbul ignore file */
import type { Client } from '../../client/interfaces/Client';
import { Context } from '../../core/Context';
import type { OpenApi } from './interfaces/OpenApi';
import { hasMappedType } from './parser/getMappedType';
import { getModels } from './parser/getModels';
import { getServer } from './parser/getServer';
import { getServices } from './parser/getServices';
import { getServiceVersion } from './parser/getServiceVersion';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param context The context of application
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export function parse(openApi: OpenApi): Client {
    const context = Context.getInstance();
    const getTypeNameByRef = (value: string, ref?: string): string => {
        if (ref) {
            const definition: any = context.get(ref);
            if (definition.oneOf || definition.anyOf || definition.allOf || ['string', 'number', 'integer', 'boolean', 'array'].includes(definition.type)) {
                return `${context.prefix.type}${value}`;
            } else if (definition.enum && definition !== 'boolean') {
                return `${context.prefix.enum}${value}`;
            } else if (definition.type === 'object') {
                return `${context.prefix.interface}${value}`;
            }
        }
        return value;
    };
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = getModels(context, openApi, getTypeNameByRef);
    const services = getServices(context, openApi, getTypeNameByRef);

    return { version, server, models, services };
}
