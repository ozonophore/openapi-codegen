import get from 'lodash-es/get';

import type { Service } from '../../../types/shared/Service.model';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';

/**
 * Get the OpenAPI services
 */
export function getServices(this: Parser, openApi: OpenApi): Service[] {
    const services = new Map<string, Service>();
    for (const url in openApi.paths) {
        if (get(openApi.paths, url, null)) {
            // Grab path and parse any global path parameters
            const path = openApi.paths[url];
            const pathParams = this.getOperationParameters(openApi, path.parameters || []);

            // Parse all the methods for this path
            for (const method in path) {
                if (get(path, method, null)) {
                    switch (method) {
                        case 'get':
                        case 'put':
                        case 'post':
                        case 'delete':
                        case 'options':
                        case 'head':
                        case 'patch': {
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method]!;
                            const operation = this.getOperation(openApi, url, method, op, pathParams);

                            // If we have already declared a service, then we should fetch that and
                            // append the new method to it. Otherwise we should create a new service object.
                            const service: Service = services.get(operation.service) || {
                                name: operation.service,
                                originName: operation.service,
                                operations: [],
                                imports: [],
                            };

                            // Push the operation in the service
                            service.operations.push(operation);
                            service.imports.push(...operation.imports);
                            services.set(operation.service, service);
                            break;
                        }
                    }
                }
            }
        }
    }
    return Array.from(services.values());
}
