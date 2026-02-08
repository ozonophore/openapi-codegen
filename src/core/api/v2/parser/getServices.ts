import { safeHasOwn } from '../../../../common/utils/safeHasOwn';
import type { Service } from '../../../types/shared/Service.model';
import { getClassName } from '../../../utils/getClassName';
import { ensureService, finalizeServiceImports, forEachOperationInPath, mergeOperationImportsIntoService } from '../../../utils/serviceHelpers';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import { OpenApiOperation } from '../types/OpenApiOperation.model';
import { OpenApiPath } from '../types/OpenApiPath.model';
import { getServiceName } from './getServiceName';

/**
 * Get the OpenAPI services
 */
export function getServices(this: Parser, openApi: OpenApi): Service[] {
    const services = new Map<string, Service>();
    for (const url in openApi.paths) {
        if (safeHasOwn(openApi.paths, url)) {
            // Grab path and parse any global path parameters
            const pathByUrl = openApi.paths[url];
            const rootPath = this.context.root?.path || '';
            const path = (pathByUrl.$ref ? (this.context.get(pathByUrl.$ref, rootPath) as Record<string, any>) : pathByUrl) as OpenApiPath;
            const parentFileRef = pathByUrl.$ref || rootPath;
            const pathParams = this.getOperationParameters(openApi, path.parameters || [], parentFileRef);

            // Parse all the methods for this path
            forEachOperationInPath(path, (method, op) => {
                // Each method contains an OpenAPI operation, we parse the operation
                const fileName = this.context.fileName();
                const serviceName = getServiceName(op as OpenApiOperation, fileName);
                const service = ensureService(services, serviceName, getClassName(op.tags?.[0] || fileName));
                const operation = this.getOperation(openApi, url, method, op, pathParams, parentFileRef);

                // Merge operation imports into service (reuse import objects when possible)
                mergeOperationImportsIntoService(service, operation);

                service.operations.push(operation);
                services.set(operation.service, service);
            });
        }
    }

    services.forEach(service => {
        finalizeServiceImports(service);
    });

    return Array.from(services.values());
}
