import get from 'lodash-es/get';

import { Import } from '../../../types/shared/Import.model';
import { Model } from '../../../types/shared/Model.model';
import type { Service } from '../../../types/shared/Service.model';
import { getClassName } from '../../../utils/getClassName';
import { getServiceClassName } from '../../../utils/getServiceClassName';
import { unique } from '../../../utils/unique';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import { OpenApiOperation } from '../types/OpenApiOperation.model';

function getServiceName(op: OpenApiOperation, fileName: string): string {
    return getServiceClassName(op.tags?.[0] || `${getClassName(fileName)}Service`);
}

function fillModelsByAlias(items: Model[], value: Import) {
    items
        .filter(result => result.path === value.path && result.type === value.name && value.alias)
        .forEach(result => {
            result.alias = value.alias;
            result.base = value.alias;
        });
}

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
                            const fileName = this.context.fileName();
                            const serviceName = getServiceName(op, fileName);
                            // If we have already declared a service, then we should fetch that and
                            // append the new method to it. Otherwise we should create a new service object.
                            const service =
                                services.get(serviceName) ||
                                ({
                                    name: serviceName,
                                    originName: getClassName(op.tags?.[0] || fileName),
                                    operations: [],
                                    imports: [],
                                } as Service);
                            const operation = this.getOperation(openApi, url, method, op, pathParams, serviceName);

                            // Push the operation in the service
                            service.operations.push(operation);
                            operation.imports = operation.imports.map(item => {
                                const operationImport = service.imports.find(serviceImport => serviceImport.path === item.path);
                                if (!operationImport) {
                                    return item;
                                }
                                return operationImport;
                            });
                            service.imports.push(...operation.imports);
                            services.set(operation.service, service);
                            break;
                        }
                    }
                }
            }
        }
    }
    services.forEach(service => {
        service.imports = service.imports.filter(unique).sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
        let previous: Import;
        let index = 1;
        service.imports = service.imports.map(value => {
            if (previous && previous.name === value.name) {
                if (index === 1) {
                    previous.alias = `${value.name}$${index}`;
                    index++;
                }
                value.alias = `${value.name}$${index}`;
                index++;
            } else {
                value.alias = '';
                index = 1;
            }
            previous = value;
            return value;
        });
        service.imports.forEach(item => {
            for (const operation of service.operations) {
                fillModelsByAlias(operation.results, item);
                fillModelsByAlias(operation.parameters, item);
            }
        });
    });
    return Array.from(services.values());
}
