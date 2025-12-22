import { safeHasOwn } from '../../common/utils/safeHasOwn';
import type { Import } from '../types/shared/Import.model';
import type { Model } from '../types/shared/Model.model';
import type { Service } from '../types/shared/Service.model';
import { unique } from './unique';

const SUPPORTED_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'] as const;

/**
 * Iterate over supported HTTP methods in a path object and call callback for each found operation.
 *
 * @param pathObj - OpenAPI Path object (may contain methods like get, post, etc.)
 * @param cb - callback invoked as cb(method, operation)
 */
export function forEachOperationInPath(pathObj: Record<string, any>, cb: (method: string, op: any) => void): void {
    for (const method in pathObj) {
        if (!safeHasOwn(pathObj, method)) continue;
        if (SUPPORTED_METHODS.includes(method as any) && pathObj[method]) {
            cb(method, pathObj[method]);
        }
    }
}

/**
 * Ensure service exists in the services map or create a new one.
 *
 * @param services - Map of services
 * @param name - service name
 * @param originName - originName (optional) used when creating a new service
 * @returns existing or newly created Service
 */
export function ensureService(services: Map<string, Service>, name: string, originName?: string): Service {
    const existing = services.get(name);
    if (existing) return existing;
    const s: Service = {
        name,
        originName: originName ?? name,
        operations: [],
        imports: [],
    };
    services.set(name, s);
    return s;
}

/**
 * Merge operation.imports into service.imports.
 * - Reuse existing import objects in service.imports by matching path.
 * - Replace operation.imports entries with the reused ones when found.
 *
 * This preserves identity of import objects so alias assignment is consistent.
 *
 * @param service - service to merge into
 * @param operation - operation whose imports should be merged
 */
export function mergeOperationImportsIntoService(service: Service, operation: any): void {
    operation.imports = operation.imports.map((item: Import) => {
        const existing = service.imports.find(si => si.path === item.path);
        return existing ?? item;
    });
    service.imports.push(...operation.imports);
}

/**
 * Internal helper: apply alias value to models that reference the import.
 */
function fillModelsByAlias(items: Model[] = [], value: Import) {
    items
        .filter(result => result.path === value.path && result.type === value.name && value.alias)
        .forEach(result => {
            result.alias = value.alias;
            result.base = value.alias;
        });
}

/**
 * Finalize imports for a service:
 * - Deduplicate and sort imports
 * - Assign aliases for duplicate import names (name, name$1, name$2, ...)
 * - Propagate assigned aliases to models referenced in operations (results, parameters)
 *
 * Modifies service in-place and returns it.
 *
 * @param service - Service to finalize
 * @returns service
 */
export function finalizeServiceImports(service: Service): Service {
    service.imports = service.imports.filter(unique).sort((a: Import, b: Import) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });

    let previous: Import | undefined;
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

    for (const item of service.imports) {
        for (const operation of service.operations) {
            fillModelsByAlias(operation.results, item);
            fillModelsByAlias(operation.parameters, item);
        }
    }

    return service;
}